
import { Settings } from "../../settings/types"
import DBFactory from "./DBFactory"

class DBSettings
{
    private readonly _db: DBFactory
    constructor() {
        this._db = new DBFactory()
    }

    public async get(): Promise<Settings>
    {
        const query = `
            SELECT * 
            FROM app_settings 
            LIMIT 1
        `
        const results = await this._db.query<Settings>(query, [])
        return results[0]
    }

    public async update(settings: Settings): Promise<void>
    {
        const values: any[] = []

        const query = `
            UPDATE app_settings SET
                pubkey_index = ${settings.pubkey_index},
                pubkeys_per_process = ${settings.pubkeys_per_process},
                max_fetch_events = ${settings.max_fetch_events},
                relay_index = ${settings.relay_index},
                relays_connections = ${settings.relays_connections},
                relays_betch_size = ${settings.relays_betch_size},
                indexer_interval = ${settings.indexer_interval},
                pubkeys_per_notes = ${settings.pubkeys_per_notes},
                max_fetch_notes = ${settings.max_fetch_notes}
            WHERE 1=1
        `
        await this._db.exec(query, values)
    }

    public async updateIndex(index: number, col: string): Promise<void>
    {
        const query = `
            UPDATE app_settings SET ${col} = ${index} WHERE 1=1
        `
        await this._db.exec(query, [])
    }

    public async updateSince(timeSeconds: number, col: string): Promise<void>
    {
        const query = `
            UPDATE app_settings SET ${col} = ${timeSeconds} WHERE 1=1
        `
        await this._db.exec(query, [])
    }
}

export default DBSettings
