import { Settings } from "../settings/types";
import { distinct, getPubkeys } from "../utils";
import { LoadDataProps } from "./commons";
import DBSettings from "./database/DBSettings";
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
        const relayUrls: string[] = []
        if(pubkeys[0] == this._settings.initial_pubkey)
            await this._dbUsers.upsertPubkeys(distinct(pubkeys))            

        let skipe = this._settings.max_fetch_events

        console.log(`varrendo ${pubkeys.length} pubkeys..`)
        for(let i = 0; i < pubkeys.length; i += skipe) 
        {
            let events = await pool.fechEvents({
                authors: pubkeys.slice(i, i + skipe),
                kinds: [3],
                limit: skipe
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

    public static async currentPubkeys(settings: Settings): Promise<string[]>
    {
        const dbUsers = new DBUsers()
        const appSettings = new DBSettings()

        let pubkeys: string[] = await dbUsers
            .listPubkeys(settings.pubkey_index, settings.pubkeys_per_process)
        
        if(!pubkeys.length && settings.pubkey_index > 0) 
        {
            pubkeys = await dbUsers.listPubkeys(0, settings.pubkeys_per_process)
            await appSettings.update({...settings, pubkey_index: 0 })
        }

        if (!pubkeys.length && settings.pubkey_index == 0) 
        {
            pubkeys = [settings.initial_pubkey]
        }
        return pubkeys
    }
}

export default PubkeyService
