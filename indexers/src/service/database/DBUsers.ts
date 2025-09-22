import { RefPubkey, User } from "../../modules/types/User";
import DBElastic from "../elastic/dbElastic";
import DBFactory from "./DBFactory"

class DBUsers
{
    private BATCH_SIZE = 100
    private readonly _db: DBFactory
    private readonly _elastic: DBElastic
    constructor(
        db: DBFactory = new DBFactory(),
        elastic: DBElastic = new DBElastic()
    ) {
        this._db = db
        this._elastic = elastic
    }

    public async list(offset: number, items: number): Promise<User[]>
    {
        const query = `
            SELECT DISTINCT ON (u.pubkey) 
                u.*,
                n.published_at AS since
            FROM users u
            LEFT JOIN notes n ON n.pubkey = u.pubkey
            WHERE u.available = true
            ORDER BY u.pubkey, n.published_at DESC
            LIMIT $1 OFFSET $2
        `
        const result = await this._db.query<User>(query, [items, offset])
        return result
    }

    public async listPubkeys(offset: number, items: number): Promise<string[]>
    {
        const query = `
            SELECT pubkey 
            FROM users 
            ORDER BY pubkey 
            LIMIT $1 OFFSET $2
        `
        const results = await this._db.query<{ pubkey: string }>(query, [items, offset])
        return results.map(u => u.pubkey)
    }

    public async upsertPubkeys(items: string[]): Promise<void>
    {
        for (let i = 0; i < items.length; i += this.BATCH_SIZE) {
            const batch = items.slice(i, i + this.BATCH_SIZE);
            await this.upsertPubkeysBetch(batch);
        }
    }

    private async upsertPubkeysBetch(pubkeys: string[]): Promise<void>
    {
        if(!pubkeys.length) return;

        const values: any[] = [];
        const columns = ["pubkey"];
        const placeholders: string[] = [];
        pubkeys.forEach((pubkey, i) => {
            const baseIndex = i * columns.length;
            placeholders.push(
                `(${columns.map((_, j) => `$${baseIndex + j + 1}`).join(", ")})`
            );
            values.push(pubkey)
        })
        const query = `
            INSERT INTO users (${columns.join(", ")})
            VALUES ${placeholders.join(", ")}
            ON CONFLICT (pubkey)
            DO UPDATE SET
                ref_count = EXCLUDED.ref_count + 1,
                updated_at = NOW()
        `;
        await this._db.exec(query, values);
    }

    public async upsert(items: User[]): Promise<void>
    {
        for (let i = 0; i < items.length; i += this.BATCH_SIZE) {
            const batch = items.slice(i, i + this.BATCH_SIZE);
            await this._elastic.indexUsers(batch)
            await this.upsertBetch(batch);
        }
    }

    private async upsertBetch(users: User[]): Promise<void>
    {
        if(!users.length) return;

        const columns = [
            "pubkey", "name", "display_name", "picture", "about", "banner", "website", 
            "nip05", "lud06", "lud16", "zap_service", "created_at", "available"
        ];
        const values: any[] = [];
        const placeholders: string[] = [];
        users.forEach((user, i) => {
            const baseIndex = i * columns.length;
            placeholders.push(
                `(${columns.map((_, j) => `$${baseIndex + j + 1}`).join(", ")})`
            );
            values.push(
                user.pubkey,
                user.name ?? null,
                user.display_name ?? null,
                user.picture ?? null,
                user.about ?? null,
                user.banner ?? null,
                user.website ?? null,
                user.nip05 ?? null,
                user.lud06 ?? null,
                user.lud16 ?? null,
                user.zapService ?? null,
                user.created_at,
                true 
            )
        })
        const query = `
            INSERT INTO users (${columns.join(", ")})
            VALUES ${placeholders.join(", ")}
            ON CONFLICT (pubkey)
            DO UPDATE SET
                name = EXCLUDED.name,
                display_name = EXCLUDED.display_name,
                picture = EXCLUDED.picture,
                about = EXCLUDED.about,
                banner = EXCLUDED.banner,
                website = EXCLUDED.website,
                nip05 = EXCLUDED.nip05,
                lud06 = EXCLUDED.lud06,
                lud16 = EXCLUDED.lud16,
                zap_service = EXCLUDED.zap_service,
                updated_at = NOW(),
                available = true
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
            UPDATE users 
                SET ref_count = users.ref_count + v.count
            FROM (
                SELECT unnest($1::text[]) AS pubkey,
                       unnest($2::bigint[]) AS count
            ) AS v
            WHERE users.pubkey = v.pubkey
        `;

        await this._db.exec(query, [pubkeys, counts]);
    }
}

export default DBUsers
