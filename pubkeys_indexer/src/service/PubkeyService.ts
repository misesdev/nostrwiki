import AppSettings from "../settings/AppSettings";
import { Settings } from "../settings/types";
import { distinct, getPubkeys } from "../utils";
import { LoadDataProps } from "./commons";
import DBPubkeys from "./database/DBPubkeys";
import FriendsService from "./FriendsService";
import RelayService from "./RelayService";

class PubkeyService
{
    private readonly _settings: Settings
    private readonly _dbPubkeys: DBPubkeys
    private readonly _friendService: FriendsService
    constructor(
        settings: Settings,
        dbPubkeys: DBPubkeys = new DBPubkeys(),
        friendService: FriendsService = new FriendsService()
    ) {
        this._dbPubkeys = dbPubkeys
        this._friendService = friendService
        this._settings = settings
    }

    public async loadPubkeys({ pool, pubkeys, accumulateRelays }: LoadDataProps): Promise<void>
    {
        const relayUrls: string[] = []
        if(pubkeys[0] == this._settings.initial_user)
            await this._dbPubkeys.upsert(distinct(pubkeys))            

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
                await this._dbPubkeys.upsert(distinct(npubs))
                await this._friendService.saveFriends(event.pubkey, distinct(npubs))
                const urls = RelayService.relaysFromEvent(event)
                relayUrls.push(...urls)
            }
        }
        accumulateRelays(relayUrls)
    }

    public static async currentPubkeys(settings: Settings): Promise<string[]>
    {
        const dbPubkeys = new DBPubkeys()

        let pubkeys: string[] = await dbPubkeys
            .list(settings.pubkey_index, settings.pubkeys_per_process)
        
        if(!pubkeys.length && settings.pubkey_index > 0) 
        {
            pubkeys = await dbPubkeys.list(0, settings.pubkeys_per_process)
            AppSettings.save({...settings, pubkey_index: 0 })
        }

        if (!pubkeys.length && settings.pubkey_index == 0) 
        {
            pubkeys = [settings.initial_user]
        }
        return pubkeys
    }
}

export default PubkeyService
