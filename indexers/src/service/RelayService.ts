import { NostrEvent } from "../modules/types/NostrEvent";
import { NostrRelay, RefRelay } from "../modules/types/NostrRelay";
import { Settings } from "../settings/types";
import { distinct, getRelayDomain, npubToHex } from "../utils";
import AppSettings from "../settings/AppSettings" 
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
    constructor(
        settings: Settings,
        dbRelays: DBRelays = new DBRelays()
    ) {
        this._settings = settings
        this._dbRelays = dbRelays
    }

    public async loadRelays({ pool, pubkeys, accumulateRelays }: LoadDataProps): Promise<void>
    {
        let relayUrls: string[] = []
        let skipe = this._settings.max_fetch_events
        for(let i = 0; i < pubkeys.length; i += skipe) 
        {
            let events = await pool.fechEvents({
                authors: pubkeys.slice(i, i + skipe),
                kinds: [10002],
                limit: skipe
            })
            for(let i = 0; i < events.length; i++)
            {
                let event = events[i]
                let urls = RelayService.relaysFromEvent(event)
                console.log("found relays...:", urls.length)
                if(urls.length)
                    relayUrls.push(...urls)
            }
        }
        accumulateRelays(relayUrls)
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

        const limit = pLimit(10) 
        let betchSize = this._settings.relays_betch_size
        const distinctRelays: string[] = distinct(relayUrls)
        console.log("fetching data relays...:", distinctRelays.length)
        for(let i = 0; i < distinctRelays.length; i += betchSize)
        { 
            const betch = distinctRelays.slice(i, i + betchSize)
            const results = await Promise.all(
                betch.map(async url => limit(() => this.fetchRelayData(url)))
            )
            const allRelays: NostrRelay[] = results.flat()
            if(allRelays.length) {
                await this._dbRelays.upsert(allRelays.filter(r => !!r));
                console.log("saved relays", allRelays.length)
            }
        }
    }

    private async fetchRelayData(url: string): Promise<NostrRelay>
    {
        const httpClient = axios.create({
            headers: { Accept: "application/nostr+json" },
            httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            timeout: 3800
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
            console.log("active relay", url)
            let relay_author: string = response.data.pubkey
            if(relay_author && relay_author.startsWith("npub")) {
                relay_author = npubToHex(relay_author) 
            }
            return {
                url,
                pubkey: relay_author ?? null,
                name: response.data.name ?? url,
                description: response.data.description ?? null,
                contact: response.data.contact ?? null,
                supported_nips: JSON.stringify(response.data.supported_nips??[]),
                software: response.data.software ?? null,
                version: response.data.version ?? null,
                icon: response.data.icon ?? null,
                created_at: new Date(),
                available: true,
                ref_count: 1
            }
        }
        catch(ex) {
            console.log("unreachable relay", url)
            return { 
                url, 
                name: url, 
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
        const map = new Map<ServiceKey, number>();
        map.set(Service.pubkey_indexer, settings.pubkey_relay_index)
        map.set(Service.profile_indexer, settings.user_relay_index)
        map.set(Service.note_indexer, settings.note_relay_index)
        map.set(Service.file_indexer, settings.file_relay_index)
        map.set(Service.relay_indexer, settings.relay_index)
        return map.get(service) ?? 0
    }

    public static async currentRelays(settings: Settings, service: ServiceKey): Promise<NostrRelay[]>
    {
        const dbRelays = new DBRelays()
        const appSettings = new AppSettings()
        const index = this.getRelayIndex(settings, service)
        let relays = await dbRelays.list(index, settings.relays_connections)
        if(!relays.length) 
        { 
            relays = await dbRelays.list(0, settings.relays_connections)
            await appSettings.updateRelayIndex(service, 0)
        }
        return relays
    }
}

export default RelayService


