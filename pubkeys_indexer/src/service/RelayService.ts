import { NostrEvent } from "../modules/types/NostrEvent";
import { NostrRelay, RefRelay } from "../modules/types/NostrRelay";
import AppSettings from "../settings/AppSettings";
import { Settings } from "../settings/types";
import { distinct, getRelayDomain, npubToHex } from "../utils";
import DBRelays from "./database/DBRelays";
const https = require("node:https")
const pLimit = require("p-limit");
import axios from "axios"
import { LoadDataProps } from "./commons";

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
        const relays: NostrRelay[] = []
        let betchSize = this._settings.relays_betch_size
        const distinctRelays: string[] = distinct(relayUrls)
        console.log("fetching data relays...:", distinctRelays.length)
        for(let i = 0; i < distinctRelays.length; i += betchSize)
        { 
            const betch = distinctRelays.slice(i, i + betchSize)
            const results = await Promise.all(
                betch.map(async url => limit(() => this.fetchRelayData(url)))
            )
            const allRelays = results.flat()
            if(allRelays.length)
                relays.push(...allRelays.filter(r => !!r))
        }
        await this._dbRelays.upsert(relays);
        console.log("saved relays", relays.length)
    }

    private async fetchRelayData(url: string): Promise<NostrRelay>
    {
        const httpClient = axios.create({
            headers: { Accept: "application/nostr+json" },
            httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            timeout: 3500
        });
        try {
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
                pubkey: relay_author,
                name: response.data.name ?? url,
                description: response.data.description,
                contact: response.data.contact,
                supported_nips: JSON.stringify(response.data.supported_nips??[]),
                software: response.data.software,
                version: response.data.version,
                icon: response.data.icon,
                active: true,
            }
        }
        catch(ex) {
            console.log("unreachable relay", url)
            return { url, name: url, active: false }
        }
    }

    public async upRefs(refs: RefRelay[]): Promise<void>
    {
        await this._dbRelays.upRefs(refs)
    }

    public static async currentRelays(settings: Settings): Promise<NostrRelay[]>
    {
        const dbRelays = new DBRelays()
        let relays = await dbRelays.list(settings.relay_index, settings.relays_connections)
        if(!relays.length) 
        { 
            relays = await dbRelays.list(0, settings.relays_connections)
            AppSettings.save({ ...settings, relay_index: 0 })
        }
        return relays
    }
}

export default RelayService


