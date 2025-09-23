import { Service } from "./src/constant";
import { RelayPool } from "./src/modules/RelayPool";
import { RefRelay } from "./src/modules/types/NostrRelay";
import PubkeyService from "./src/service/PubkeyService";
import RelayService from "./src/service/RelayService";
import AppSettings from "./src/settings/AppSettings";
import { configDotenv } from "dotenv";

configDotenv()

var shutdown = false;
var nextRun: NodeJS.Timeout | null = null;
var pool: RelayPool | null = null;

const gracefulShutdown = async () => {
    if (shutdown) return; 
    shutdown = true;

    console.log("\nclosing connections ...");

    try 
    {
        if (nextRun) clearTimeout(nextRun);
        if (pool) await pool.disconect();
    } 
    catch (err) {
        console.error("Erro ao encerrar pool:", err);
    } 
    finally {
        process.exit(0);
    }
}

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

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

        const pool = await RelayPool.getInstance(settings, Service.pubkey_indexer)

        const pubkeys = await PubkeyService.currentPubkeys(settings, Service.pubkey_indexer)

        // load pubkeys, friends pubkeys and relays
        const pubkeyService = new PubkeyService(settings)
        await pubkeyService.loadPubkeys({ pool, pubkeys, accumulateRelays })

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
            const pubkeyIndex = settings.pubkey_index + pubkeys.length
            await appSettings.updatePubkeyIndex(Service.pubkey_indexer, pubkeyIndex)
        }

        await pool.disconect()
    } 
    catch (err) {
        console.error("Indexer error:", err);
    } 
    finally {
        if (!shutdown) // execute only is not shutdown 
        { 
            console.log("Indexer finished. Next run in", settings.indexer_interval, "minutes");
            nextRun = setTimeout(runIndexer, settings.indexer_interval * 60 * 1000);
        }
    }
}

runIndexer()



