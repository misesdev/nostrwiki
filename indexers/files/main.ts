import runIndexer from ".";
import AppSettings from "./src/settings/AppSettings";

async function scheduleIndexer() {
    const settings = AppSettings.get()
    try {
        console.log("Running indexer...");
        await runIndexer(settings);
    } catch (err) {
        console.error("Indexer error:", err);
    } finally {
        console.log("Indexer finished. Next run in", settings.indexer_interval, "minutes");
        setTimeout(scheduleIndexer, settings.indexer_interval * 60 * 1000);
    }
}

// runs immediately and then every indexer_interval minutes
scheduleIndexer();
