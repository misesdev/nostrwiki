import { Service } from "./src/constant";
import { RelayPool } from "./src/modules/RelayPool";
import { RefRelay } from "./src/modules/types/NostrRelay";
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
        const pubkeys = await PubkeyService.currentPubkeys(settings, Service.relay_indexer)
        const pool = await RelayPool.getInstance(settings, Service.relay_indexer)
        // load relays from pubkeys
        const relayService = new RelayService(settings)
        await relayService.loadRelays({ pool, pubkeys, accumulateRelays })

        const relayRefs: RefRelay[] = Array.from(relayMap.entries())
            .map(([url, count]) => ({ url, count }));

        if(relayRefs.length) 
        {
            await relayService.saveRelays(relayRefs.map(r => r.url))
            await relayService.upRefs(relayRefs) 
        }
        if(pubkeys.length) 
        {
            const pubkeyIndex = settings.relay_pubkey_index + pubkeys.length
            await appSettings.updatePubkeyIndex(Service.relay_indexer, pubkeyIndex)
        }
        await pool.disconect()
    } 
    catch (err) {
        console.error("Indexer error:", err);
    } 
    // force garbage collector if enabled --expose-gc
    global.gc?.();
}

cron.schedule("0 0 3 * * *", async () => {
    await runIndexer()
})

