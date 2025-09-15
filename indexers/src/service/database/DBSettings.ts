
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
        const result = await this._db.query<Settings>(query, null)
        return result[0]
    }

    public async update(settings: Settings): Promise<void>
    {
        const values: any[] = []

        const query = `
            UPDATE app_settings SET
                initial_pubkey = '${settings.initial_pubkey}'
                pubkey_index = ${settings.pubkey_index}
                pubkeys_per_process = ${settings.pubkeys_per_process}
                max_fetch_events = ${settings.max_fetch_events}
                relay_index = ${settings.relay_index}
                relays_connections = ${settings.relays_connections}
                relays_betch_size = ${settings.relays_betch_size}
                indexer_interval = ${settings.indexer_interval}
                pubkeys_per_notes = ${settings.pubkeys_per_notes}
                max_fetch_notes = ${settings.max_fetch_notes}
            WHERE 1=1
        `
        await this._db.exec(query, values)
    }

    public async incrementPubkeys(pubkeys: number): Promise<void>
    {
        const query = `
            UPDATE app_settings SET
                pubkey_index = pubkey_index + ?
            WHERE 1=1
        `
        await this._db.exec(query, [pubkeys])
    }

    public async incrementRelays(relays: number): Promise<void>
    {
        const query = `
            UPDATE app_settings SET
                relay_index = relay_index + ?
            WHERE 1=1
        `
        await this._db.exec(query, [relays])
    }
}

export default DBSettings
