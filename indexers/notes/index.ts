import { Service } from "./src/constant";
import { RelayPool } from "./src/modules/RelayPool";
import { RefRelay } from "./src/modules/types/NostrRelay";
import NoteService from "./src/service/NoteService";
import PubkeyService from "./src/service/PubkeyService";
import RelayService from "./src/service/RelayService";
import AppSettings from "./src/settings/AppSettings";
import { configDotenv } from "dotenv";
import cron from "node-cron"

configDotenv()

const runIndexer = async () => {
    try 
    {
        console.log("Running indexer...");

        const appSettings = new AppSettings()
        const settings = await appSettings.get()
        const relayMap = new Map<string, number>()
        const accumulateRelays = (relays: string[]) => {
            relays.forEach(relay => 
                relayMap.set(relay, (relayMap.get(relay)??0)+1)
            )
        } 
        const users = await PubkeyService.currentUsers(settings, Service.note_indexer)
        const pool = await RelayPool.getInstance(settings, Service.note_indexer)

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
    // force garbage collector if enabled --expose-gc
    global.gc?.();
}

cron.schedule("0 0 2 * * *", async () => {
    await runIndexer()
})


