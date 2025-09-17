import { Service } from "./src/constant";
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

        const relays = await RelayService.currentRelays(settings, Service.note_indexer)

        const users = await PubkeyService.currentUsers(settings, Service.note_indexer)

        const pool = await RelayPool.getInstance(relays)

        const noteService = new NoteService(settings)
        await noteService.loadNotes({ pool, users, accumulateRelays })

        const relayRefs: RefRelay[] = Array.from(relayMap.entries())
            .map(([url, count]) => ({ url, count }));

        if(relayRefs.length) 
        {
            const relayService = new RelayService(settings)
            await relayService.saveRelays(relayRefs.map(r => r.url))
            await relayService.upRefs(relayRefs) 
        }
       
        if(settings.note_pubkey_index >= settings.pubkeys_per_process)
        { 
            const relayIndex = settings.note_relay_index + relays.length
            await appSettings.updateRelayIndex(Service.note_indexer, relayIndex)
        }

        if(users.length) 
        {
            const pubkeyIndex = settings.note_pubkey_index + users.length
            await appSettings.updatePubkeyIndex(Service.note_indexer, pubkeyIndex)
        }

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



