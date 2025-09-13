import { RefPubkey } from "../../modules/types/User"
import DBFactory from "./DBFactory"

class DBPubkeys
{
    private BATCH_SIZE = 100
    private readonly _db: DBFactory
    constructor() {
        this._db = new DBFactory()
    }

    public async list(offset: number, items: number): Promise<string[]>
    {
        const query = `
            SELECT pubkey 
            FROM pubkeys 
            ORDER BY pubkey 
            LIMIT $1 OFFSET $2
        `
        const result = await this._db.query<any>(query, [items, offset])
        return result.map(p => p.pubkey)
    }

    public async upsert(items: string[]): Promise<void>
    {
        for (let i = 0; i < items.length; i += this.BATCH_SIZE) {
            const batch = items.slice(i, i + this.BATCH_SIZE);
            await this.upsertBetch(batch);
        }
    }

    public async upsertBetch(pubkeys: string[]): Promise<void>
    {
        if(!pubkeys.length) return;
        const values: any[] = [];
        const placeholders = pubkeys.map((key, i) => {
            values.push(key);
            return `($${i + 1})`;
        });
        const query = `
            INSERT INTO pubkeys (pubkey)
            VALUES ${placeholders.join(", ")}
            ON CONFLICT (pubkey)
            DO UPDATE SET ref_count = pubkeys.ref_count + 1
        `;
        await this._db.exec(query, values);
    }

    public async upRefs(refs: RefPubkey[]): Promise<void>
    {
        for (let i = 0; i < refs.length; i += this.BATCH_SIZE) {
            const batch = refs.slice(i, i + this.BATCH_SIZE);
            await this.upRefsBetch(batch);
        }
    }

    private async upRefsBetch(refs: RefPubkey[]): Promise<void>
    {
        if(!refs.length) return

        const pubkeys = refs.map(r => r.pubkey);
        const counts = refs.map(r => r.count);

        const query = `
            UPDATE pubkeys
            SET ref_count = pubkeys.ref_count + v.count
            FROM (
                SELECT unnest($1::text[]) AS pubkey,
                       unnest($2::bigint[]) AS count
            ) AS v
            WHERE pubkeys.pubkey = v.pubkey
        `;

        await this._db.exec(query, [pubkeys, counts]);
    }
}

export default DBPubkeys

