import { RelayPool } from "./src/modules/RelayPool";
import { RefRelay } from "./src/modules/types/NostrRelay";
import NoteService from "./src/service/NoteService";
import PubkeyService from "./src/service/PubkeyService";
import RelayService from "./src/service/RelayService";
import UserService from "./src/service/UserService";
import AppSettings from "./src/settings/AppSettings";
import { configDotenv } from "dotenv";

configDotenv()

const runIndexer = async () => {
    const appSettings = new AppSettings()
    const settings = await appSettings.get()
    try 
    {
        console.log("Running indexer...");

        const relayMap = new Map<string, number>()

        const accumulateRelays = (relays: string[]) => {
            relays.forEach(relay => 
                relayMap.set(relay, (relayMap.get(relay)??0)+1)
            )
        } 

        const relays = await RelayService.currentRelays(settings)

        const pool = await RelayPool.getInstance(relays)

        const pubkeys = await PubkeyService.currentPubkeys(settings)

        // load pubkeys, friends pubkeys and relays
        const pubkeyService = new PubkeyService(settings)
        await pubkeyService.loadPubkeys({ pool, pubkeys, accumulateRelays })

        // load users from pubkeys
        const userService = new UserService(settings)
        await userService.loadUsers({ pool, pubkeys, accumulateRelays })

        const noteService = new NoteService(settings)
        await noteService.loadNotes({ pool, pubkeys, accumulateRelays })

        // load relays from pubkeys
        const relayService = new RelayService(settings)
        await relayService.loadRelays({ pool, pubkeys, accumulateRelays })

        const relayRefs: RefRelay[] = Array.from(relayMap.entries())
            .map(([url, count]) => ({ url, count }));

        await relayService.saveRelays(relayRefs.map(r => r.url))
        await relayService.upRefs(relayRefs) 
       
        if(settings.pubkey_index >= settings.pubkeys_per_process) 
            settings.relay_index += relays.length

        settings.pubkey_index += pubkeys.length
        await appSettings.save(settings)

        await pool.disconect()
    } 
    catch (err) {
        console.error("Indexer error:", err);
    } 
    finally {
        console.log("Indexer finished. Next run in", settings.indexer_interval, "minutes");
        setTimeout(runIndexer, settings.indexer_interval * 60 * 1000);
    }
}

runIndexer()



