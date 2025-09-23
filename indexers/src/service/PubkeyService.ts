import { Service, ServiceKey } from "../constant";
import { User } from "../modules/types/User";
import AppSettings from "../settings/AppSettings";
import { Settings } from "../settings/types";
import { distinct, getPubkeys } from "../utils";
import { LoadDataProps } from "./commons";
import DBUsers from "./database/DBUsers";
import FriendsService from "./FriendsService";
import RelayService from "./RelayService";

class PubkeyService
{
    private readonly _settings: Settings
    private readonly _dbUsers: DBUsers 
    private readonly _friendService: FriendsService
    constructor(
        settings: Settings,
        dbUsers: DBUsers = new DBUsers(),
        friendService: FriendsService = new FriendsService()
    ) {
        this._dbUsers = dbUsers
        this._friendService = friendService
        this._settings = settings
    }

    public async loadPubkeys({ pool, pubkeys, accumulateRelays }: LoadDataProps): Promise<void>
    {
        if(!pubkeys.length) return

        if(pubkeys.length == 1 && pubkeys[0] == this._settings.initial_pubkey) 
        {
            await this._dbUsers.upsertPubkeys(distinct(pubkeys))         
        }

        const relayUrls: string[] = []
        let skip = this._settings.max_fetch_events

        for(let i = 0; i < pubkeys.length; i += skip) 
        {
            console.log("fetching", skip, "pubkeys from friends")
            let events = await pool.fechEvents({
                authors: pubkeys.slice(i, i + skip),
                kinds: [3],
                limit: skip
            })

            for(let i = 0; i < events.length; i++)
            {
                let event = events[i]
                let npubs = getPubkeys(event)
                console.log("npubs...:", npubs.length)
                await this._dbUsers.upsertPubkeys(distinct(npubs))
                await this._friendService
                    .saveFriends(event.pubkey, distinct(npubs))
                const urls = RelayService.relaysFromEvent(event)
                relayUrls.push(...urls)
            }
        }
        accumulateRelays(relayUrls)
    }

    public static getPubkeyIndex(settings: Settings, service: ServiceKey): number
    {
        const map = new Map<ServiceKey, number>();
        map.set(Service.pubkey_indexer, settings.pubkey_index)
        map.set(Service.profile_indexer, settings.user_pubkey_index)
        map.set(Service.note_indexer, settings.note_pubkey_index)
        map.set(Service.file_indexer, settings.file_pubkey_index)
        map.set(Service.relay_indexer, settings.relay_pubkey_index)
        return map.get(service) ?? 0
    }

    public static async currentPubkeys(settings: Settings, service: ServiceKey): Promise<string[]>
    {
        const dbUsers = new DBUsers()
        const appSettings = new AppSettings()

        const index = this.getPubkeyIndex(settings, service)
        let pubkeys: string[] = await dbUsers.listPubkeys(index, settings.pubkeys_per_process)
        
        if(!pubkeys.length && settings.pubkey_index != 0) 
        {
            pubkeys = await dbUsers.listPubkeys(0, settings.pubkeys_per_process)
            if(!pubkeys.length) pubkeys = [settings.initial_pubkey]
            await appSettings.updatePubkeyIndex(service, 0)
        }
        if(!pubkeys.length && settings.pubkey_index <= 0)
            pubkeys = [settings.initial_pubkey]

        return pubkeys
    }

    public static async currentUsers(settings: Settings, service: ServiceKey): Promise<User[]>
    {
        const dbUsers = new DBUsers()
        const appSettings = new AppSettings()

        const index = this.getPubkeyIndex(settings, service)
        let users: User[] = await dbUsers.list(index, settings.pubkeys_per_process)
        
        if(!users.length && settings.pubkey_index != 0) 
        {
            users = await dbUsers.list(0, settings.pubkeys_per_process)
            await appSettings.updatePubkeyIndex(service, 0)
        }

        if(index >= 200000 && !settings.note_since) {
            await appSettings.updateSince(service)
        }

        return users
    }
}

export default PubkeyService
