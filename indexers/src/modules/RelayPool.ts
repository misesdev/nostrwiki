import { WebSocket } from "ws"
import { distinctEvent } from "../utils";
import { NostrFilter } from "./types/NostrFilter";
import { NostrEvent } from "./types/NostrEvent";
import { Settings } from "../settings/types";
import { ServiceKey } from "../constant";
import RelayService from "../service/RelayService"
import DBRelays from "../service/database/DBRelays";
import AppSettings from "../settings/AppSettings";

export class RelayPool 
{
    public relays: string[];
    public websockets: WebSocket[];
    public timeout: number = 3200;
    private subscription: string = "3da9794398579582309458";

    constructor(relays: string[]) 
    {
        if(relays.length < 1)
            throw Error("expected relays");
        this.relays = relays; 
        this.websockets = [];
    }

    private async connectRelay(relay: string) : Promise<WebSocket> 
    {
        return new Promise((resolve) => {
            let websock = new WebSocket(relay);
            websock.on("open", () => resolve(websock))
            websock.on("close", () => resolve(null))
            websock.on("error", () => resolve(null))
            setTimeout(() => resolve(null), this.timeout)
        });
    }

    public async connect() 
    {
        let websockets = this.relays.map(async (relay) => await this.connectRelay(relay))

        const allwebsockets = await Promise.all(websockets)

        const connectedRelays = allwebsockets.filter((socket: WebSocket) => socket != null)

        this.websockets.push(...connectedRelays)

        console.log("connected relays", this.websockets.length)
    }

    private async disconectRelay(websocket: WebSocket): Promise<void> 
    {
        new Promise<void>((resolve) => {
            let timeout: any
            websocket.send(`[\"CLOSE\", ${this.subscription}]`)

            const handleMessage = (message: any) => {
                let data = JSON.parse(message.toString()); 

                if(data[0] == "EOSE") {
                    console.log("disconect relay.:", websocket.url)
                    websocket.removeListener("message", handleMessage)
                    clearTimeout(timeout)
                    resolve()
                }
                
                websocket.on("message", handleMessage);

                timeout = setTimeout(() => {
                    websocket.removeListener("message", handleMessage)
                    resolve()
                }, this.timeout)
            }
        })
    }

    public async disconect() 
    {
        let promises = this.websockets.map(async (websocket) => await this.disconectRelay(websocket))
        await Promise.all(promises)
    }

    private async fetchEventRelay(websocket: WebSocket, filter: NostrFilter): Promise<NostrEvent[]> 
    {
        if(!filter.since) delete filter["since"]
        
        return new Promise((resolve) => {
            let timeout: any;
            let events: NostrEvent[] = []
            // send the message
            websocket.send(`[
                "REQ", 
                "${this.subscription}", 
                ${JSON.stringify(filter)}
            ]`);
            
            // receive the event and return
            const handleMessage = (message: any) => {
                let data = JSON.parse(message.toString());            
                
                if(data[0] == "EVENT") {
                    let event: NostrEvent = data[2];
                    events.push(event);
                }
                
                if(data[0] == "EOSE") {
                    websocket.removeListener("message", handleMessage)
                    clearTimeout(timeout)
                    resolve(events)
                }
            }

            websocket.on("message", handleMessage)

            // remove the listener in timeout
            timeout = setTimeout(() => { 
                websocket.removeAllListeners("message")
                resolve(events);
            }, this.timeout);
        });
    }

    public async fechEvents(filter: NostrFilter): Promise<NostrEvent[]> 
    {
        let eventPromises = this.websockets.map(async (websocket) => { 
            return this.fetchEventRelay(websocket, filter).catch((error:string) => {
                console.log(error)
                return [];
            })
        })

        let allEvents = await Promise.all(eventPromises)

        let events = allEvents.flat()

        return distinctEvent(events)
    }

    public async fechUser(pubkey: string): Promise<NostrEvent|null> 
    {
        let events = await this.fechEvents({
            kinds: [0],
            authors: [pubkey],
            limit: 1
        })
        if(events.length > 0) return events[0]
        return null
    }

    public async addRelays(relay: string[]): Promise<void>
    {
        console.log("connecting more relays")
        this.relays = relay.filter(r => !this.relays.some(i => i==r))
        if(this.relays.length) {
            await this.connect()
        }
    }

    public static async getInstance(settings: Settings, service: ServiceKey): Promise<RelayPool>
    {   
        const dbRelays = new DBRelays()
        const appSettings = new AppSettings()

        let currentIndex = RelayService.getRelayIndex(settings, service)

        const relays = await dbRelays.list(currentIndex, settings.relays_connections)

        if(!relays.length) {
            const list = await dbRelays.list(0, settings.relays_connections)
            await appSettings.updateRelayIndex(service, 0)
            relays.push(...list)
            currentIndex = 0
        }

        const pool = new RelayPool(relays.map(r => r.url))

        await pool.connect()

        while(pool.websockets.length <= 30) 
        {
            currentIndex += settings.relays_connections

            const relays = await dbRelays.list(currentIndex, settings.relays_connections)

            if(relays.length) 
                await appSettings.updateRelayIndex(service, currentIndex)

            if(!relays.length) 
            {
                const list = await dbRelays.list(0, settings.relays_connections)
                await appSettings.updateRelayIndex(service, 0)
                relays.push(...list)
                currentIndex = 0
            }

            await pool.addRelays(relays.map(r => r.url))
        }
        return pool
    }
}


