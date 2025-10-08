import { NostrEvent } from "../modules/types/NostrEvent";
import { NostrRelay, RefRelay } from "../modules/types/NostrRelay";
import { Settings } from "../settings/types";
import { distinct, getRelayDomain, npubToHex } from "../utils";
import DBRelays from "./database/DBRelays";
import { LoadDataProps } from "./commons";
import { Service, ServiceKey } from "../constant"
const https = require("node:https")
const pLimit = require("p-limit");
import axios from "axios"

class RelayService
{
    private readonly _settings: Settings
    private readonly _dbRelays: DBRelays
    private _relayIndex:Map<ServiceKey, number>
    constructor(
        settings: Settings,
        dbRelays: DBRelays = new DBRelays()
    ) {
        this._settings = settings
        this._dbRelays = dbRelays
        this._relayIndex = new Map<ServiceKey, number>()
        this._relayIndex.set(Service.pubkey_indexer, settings.pubkey_relay_index)
        this._relayIndex.set(Service.profile_indexer, settings.user_relay_index)
        this._relayIndex.set(Service.note_indexer, settings.note_relay_index)
        this._relayIndex.set(Service.file_indexer, settings.file_relay_index)
        this._relayIndex.set(Service.relay_indexer, settings.relay_index)
    }

    public async loadRelays({ pool, pubkeys, accumulateRelays }: LoadDataProps): Promise<void>
    {
        const uniqueRelays = new Set<string>()
        let skip = this._settings.max_fetch_events
        console.log("fetching relays from", pubkeys.length ,"pubkeys")
        for(let i = 0; i < pubkeys.length; i += skip) 
        {
            let events = await pool.fechEvents({
                authors: pubkeys.slice(i, i + skip),
                kinds: [10002],
                limit: skip
            })
            for(let i = 0; i < events.length; i++)
            {
                let event = events[i]
                let relays = RelayService.relaysFromEvent(event)
                relays.forEach(relay => uniqueRelays.add(relay))
            }
            console.log("found relays.:", uniqueRelays.size)
        }
        accumulateRelays(Array.from(uniqueRelays))
    }

    public static relaysFromEvent(event: NostrEvent): string[]
    {
        const relayUrls: string[] = []
        const pushRelay = (data: string) => {
            if(data) {
                let relayDomain = getRelayDomain(data)
                if(relayDomain) 
                    relayUrls.push(relayDomain)
            }
        }
        // relays from profile event
        try {
            let eventRelays = JSON.parse(event.content);
            for(let relay in eventRelays)  
                pushRelay(relay)
        } catch {}
        // relays from tags
        try {
            const relayOn2Index = ["p", "a", "e"]
            // relay reference
            event.tags.filter(t => t[0] == "r").forEach(t => pushRelay(t[1]))
            // profile, event, addr references
            event.tags.filter(t => relayOn2Index.includes(t[0]))
                .forEach(t => pushRelay(t[2]))
        } catch {}
        return relayUrls 
    }

    public async saveRelays(relayUrls: string[]): Promise<void>
    {
        if(!relayUrls.length) return;

        const limit = pLimit(12)
        const uniqueRelays = new Map<string, NostrRelay>()
        let betchSize = this._settings.relays_betch_size
        const distinctRelays: string[] = distinct(relayUrls)
        for(let i = 0; i < distinctRelays.length; i += betchSize)
        { 
            console.log("validating,", betchSize, "relays")
            const betch = distinctRelays.slice(i, i + betchSize)
            const results = await Promise.all(
                betch.map(async url => limit(() => this.fetchRelayData(url)))
            )
            const allRelays: NostrRelay[] = results.flat().filter((r: NostrRelay) => !!r)
            if(allRelays.length) {
                console.log("valid relays...:", allRelays.filter(r => r.available).length)
                allRelays.forEach(relay => uniqueRelays.set(relay.url, relay))
            }
        }
        await this._dbRelays.upsert(Array.from(uniqueRelays.values()));
    }

    private async fetchRelayData(url: string): Promise<NostrRelay>
    {
        const httpClient = axios.create({
            headers: { Accept: "application/nostr+json" },
            httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            timeout: 3000
        });
        try 
        {
            if(url.includes(".onion") || url.includes(".local"))
                throw new Error("onion is not accessible")
            const relayUrl = url.replace("wss", "https")
                .replace("ws", "http")
            const response = await httpClient.get(relayUrl)
            if(response.status != 200)
                throw new Error(`unreachable relay ${url}`)
            let relay_author: string = response.data.pubkey
            if(relay_author && relay_author.startsWith("npub")) {
                relay_author = npubToHex(relay_author) 
            }
            return {
                url: url.slice(0, 100),
                pubkey: relay_author?.slice(0, 64) ?? null,
                name: response.data.name?.slice(0, 100) ?? url,
                description: response.data.description ?? null,
                contact: response.data.contact?.slice(0, 250) ?? null,
                supported_nips: JSON.stringify(response.data.supported_nips??[]),
                software: response.data.software?.slice(0, 250) ?? null,
                version: response.data.version?.slice(0, 50) ?? null,
                icon: response.data.icon ?? null,
                created_at: new Date(),
                available: true,
                ref_count: 1
            }
        }
        catch(ex) {
            return { 
                url: url.slice(0, 100), 
                name: url.slice(0, 100), 
                created_at: new Date(),
                available: false,
                ref_count: 1
            }
        }
    }

    public async upRefs(refs: RefRelay[]): Promise<void>
    {
        await this._dbRelays.upRefs(refs)
    }

    public static getRelayIndex(settings: Settings, service: ServiceKey): number
    {
        const relayIndex = new Map<ServiceKey, number>()
        relayIndex.set(Service.pubkey_indexer, settings.pubkey_relay_index)
        relayIndex.set(Service.profile_indexer, settings.user_relay_index)
        relayIndex.set(Service.note_indexer, settings.note_relay_index)
        relayIndex.set(Service.file_indexer, settings.file_relay_index)
        relayIndex.set(Service.relay_indexer, settings.relay_index)
        return relayIndex.get(service) ?? 0
    }
}

export default RelayService


