import { Service, ServiceKey } from "../constant";
import DBSettings from "../service/database/DBSettings";
import { Settings } from "./types";

class AppSettings 
{
    private readonly _dbSettings: DBSettings
    constructor(
        dbSettings: DBSettings = new DBSettings()
    )
    {
        this._dbSettings = dbSettings
    }

    public async get(): Promise<Settings>
    {
        return await this._dbSettings.get() 
    }

    public async save(settings: Settings): Promise<void>
    {
        await this._dbSettings.update(settings) 
    }

    public async updateRelayIndex(col: ServiceKey, index: number): Promise<void>
    {
        if(col == Service.relay_indexer)
            await this._dbSettings.updateIndex(index, "relay_index");
        else if (col == Service.pubkey_indexer)
            await this._dbSettings.updateIndex(index, "pubkey_relay_index");
        else if (col == Service.profile_indexer)
            await this._dbSettings.updateIndex(index, "user_relay_index");
        else if (col == Service.note_indexer)
            await this._dbSettings.updateIndex(index, "note_relay_index");
        else if (col == Service.file_indexer)
            await this._dbSettings.updateIndex(index, "file_relay_index");
        else
            await this._dbSettings.updateIndex(index, "relay_index");
    }
    
    public async updatePubkeyIndex(col: ServiceKey, index: number): Promise<void>
    {
        if(col == Service.pubkey_indexer)
            await this._dbSettings.updateIndex(index, "pubkey_index");
        else if (col == Service.profile_indexer)
            await this._dbSettings.updateIndex(index, "user_pubkey_index");
        else if (col == Service.note_indexer)
            await this._dbSettings.updateIndex(index, "note_pubkey_index");
        else if (col == Service.file_indexer)
            await this._dbSettings.updateIndex(index, "file_pubkey_index");
        else if (col == Service.relay_indexer)
            await this._dbSettings.updateIndex(index, "relay_pubkey_index");
        else
            await this._dbSettings.updateIndex(index, "pubkey_index");
    }

    public async updateSince(col: ServiceKey): Promise<void>
    {
        const time = parseInt((Date.now() / 1000).toString())
        if(col == Service.note_indexer)
            await this._dbSettings.updateSince(time, "note_since")
        else if(col == Service.file_indexer)
            await this._dbSettings.updateSince(time, "file_since")
        else
            await this._dbSettings.updateSince(time, "note_since")
    }
}

export default AppSettings

