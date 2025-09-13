import { NFile } from "../../modules/types/File";
import DBFactory from "./DBFactory"

class DBFiles
{
    private BATCH_SIZE = 100
    private readonly _db: DBFactory
    constructor() {
        this._db = new DBFactory()
    }

    public async upsert(items: NFile[]): Promise<void>
    {
        for (let i = 0; i < items.length; i += this.BATCH_SIZE) {
            const batch = items.slice(i, i + this.BATCH_SIZE);
            await this.upsertBetch(batch);
        }
    }

    private async upsertBetch(files: NFile[]): Promise<void>
    {
        if(!files.length) return;

        const columns = [
            "pubkey", "note_id", "url", "type", "tags"
        ];
        const values: any[] = [];
        const placeholders: string[] = [];
        files.forEach((file, i) => {
            const baseIndex = i * columns.length;
            placeholders.push(
                `(${columns.map((_, j) => `$${baseIndex + j + 1}`).join(", ")})`
            );
            values.push(
                file.pubkey,
                file.note_id,
                file.url,
                file.type,
                file.tags
            )
        })
        const query = `
            INSERT INTO files (${columns.join(", ")})
            VALUES ${placeholders.join(", ")}
            ON CONFLICT (url) DO NOTHING
        `;
        await this._db.exec(query, values);
    }
}

export default DBFiles 
