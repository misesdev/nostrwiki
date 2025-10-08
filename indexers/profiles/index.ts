import { Service } from "./src/constant";
import { RelayPool } from "./src/modules/RelayPool";
import { RefRelay } from "./src/modules/types/NostrRelay";
import PubkeyService from "./src/service/PubkeyService";
import RelayService from "./src/service/RelayService";
import UserService from "./src/service/UserService";
import AppSettings from "./src/settings/AppSettings";
import { configDotenv } from "dotenv";
import cron from "node-cron";

configDotenv()

const runIndexer = async () => {
    try 
    {
        console.log("Running indexer...")
        const appSettings = new AppSettings()
        const settings = await appSettings.get()
        const relayMap = new Map<string, number>()
        const accumulateRelays = (relays: string[]) => {
            relays.forEach(relay => 
                relayMap.set(relay, (relayMap.get(relay)??0)+1)
            )
        } 
        const pool = await RelayPool.getInstance(settings, Service.profile_indexer)
        const pubkeys = await PubkeyService.currentPubkeys(settings, Service.profile_indexer)
        // load users from pubkeys
        const userService = new UserService(settings)
        await userService.loadUsers({ pool, pubkeys, accumulateRelays })
        
        const relayRefs: RefRelay[] = Array.from(relayMap.entries())
            .map(([url, count]) => ({ url, count }));
        if(relayRefs.length) 
        {
            const relayService = new RelayService(settings)
            await relayService.saveRelays(relayRefs.map(r => r.url))
            await relayService.upRefs(relayRefs) 
        }
        if(pubkeys.length) 
        {
            const pubkeyIndex = settings.user_pubkey_index + pubkeys.length
            await appSettings.updatePubkeyIndex(Service.profile_indexer, pubkeyIndex)
        }
        await pool.disconect()
    } 
    catch (err) {
        console.error("Indexer error:", err)
    } 
    // force garbage collector if enabled --expose-gc
    global.gc?.();
}

cron.schedule("0 0 1 * * *", async () => {
    await runIndexer()
})

