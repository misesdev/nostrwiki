import { RelayPool } from "./src/modules/RelayPool";
import { RefRelay } from "./src/modules/types/NostrRelay";
import NoteService from "./src/service/NoteService";
import PubkeyService from "./src/service/PubkeyService";
import RelayService from "./src/service/RelayService";
import UserService from "./src/service/UserService";
import AppSettings from "./src/settings/AppSettings";
import { Settings } from "./src/settings/types";
import { configDotenv } from "dotenv";

configDotenv()

const runIndexer = async (settings: Settings) => {
    try 
    {
        const relayMap = new Map<string, number>()

        const accumulateRelays = (relays: string[]) => {
            relays.forEach(relay => 
                relayMap.set(relay, (relayMap.get(relay)??0)+1)
            )
        } 
        
        const relays = await RelayService.currentRelays(settings)

        const pool = await RelayPool.getInstance(relays)

        const pubkeys = await PubkeyService.currentPubkeys(settings)

        const pubkeyService = new PubkeyService(settings)
        await pubkeyService.loadPubkeys({ pool, pubkeys, accumulateRelays })

        const relayRefs: RefRelay[] = Array.from(relayMap.entries())
            .map(([url, count]) => ({ url, count }));

        const relayService = new RelayService(settings)
        await relayService.saveRelays(relayRefs.map(r => r.url))
        await relayService.upRefs(relayRefs) 
       
        if(settings.pubkey_index >= settings.pubkeys_per_process) 
            settings.relay_index += relays.length

        settings.pubkey_index += pubkeys.length
        AppSettings.save(settings)

        await pool.disconect()
    } 
    catch(ex) 
    {
        console.log(ex)
    }
}

export default runIndexer



