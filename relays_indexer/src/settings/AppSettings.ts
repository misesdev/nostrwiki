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
}

export default AppSettings


