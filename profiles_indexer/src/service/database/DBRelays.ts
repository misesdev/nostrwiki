import { NostrRelay, RefRelay } from "../../modules/types/NostrRelay";
import DBFactory from "./DBFactory"

class DBRelays
{
    private BATCH_SIZE = 100
    private readonly _db: DBFactory
    constructor() {
        this._db = new DBFactory()
    }

    public async list(offset: number, items: number): Promise<NostrRelay[]>
    {
        const query = `
            SELECT * 
            FROM relays 
            WHERE active = true
                AND url NOT LIKE '%.onion'
            ORDER BY url 
            LIMIT $1 OFFSET $2
        `
        const result = await this._db.query<NostrRelay>(query, [items, offset])
        return result
    }

    public async insert(relay: NostrRelay): Promise<void>
    {
        const columns = [
            "url", "name", "icon", "pubkey", "description", "contact",
            "supported_nips", "software", "version", "active"
        ];
        const values: any[] = [relay.url,
            relay.name, relay.icon, relay.pubkey, relay.description,
            relay.contact, relay.supported_nips, relay.software,
            relay.version, relay.active
        ];
        const placeholders: string[] = columns.map((_,i) => `$${i+1}`);
        const query = `
            INSERT INTO relays (${columns.join(", ")})
            VALUES (${placeholders.join(", ")})
            ON CONFLICT (url)
            DO UPDATE SET
                name = EXCLUDED.name,
                icon = EXCLUDED.icon,
                pubkey = EXCLUDED.pubkey,
                description = EXCLUDED.description,
                contact = EXCLUDED.contact,
                supported_nips = EXCLUDED.supported_nips,
                software = EXCLUDED.software,
                version = EXCLUDED.version,
                active = EXCLUDED.active,
                ref_count = relays.ref_count + 1
        `;
        await this._db.exec(query, values);
    }

    public async upsert(items: NostrRelay[]): Promise<void>
    {
        for (let i = 0; i < items.length; i += this.BATCH_SIZE) {
            const batch = items.slice(i, i + this.BATCH_SIZE);
            await this.upsertBetch(batch);
        }
    }

    private async upsertBetch(relays: NostrRelay[]): Promise<void>
    {
        if(!relays.length) return;
        const columns = [
            "url", "name", "icon", "pubkey", "description", "contact",
            "supported_nips", "software", "version", "active"
        ];
        const values: any[] = [];
        const placeholders: string[] = [];
        relays.forEach((relay, i) => {
            const baseIndex = i * columns.length;
            placeholders.push(
                `(${columns.map((_, j) => `$${baseIndex + j + 1}`).join(", ")})`
            );
            values.push(
                relay.url,
                relay.name,
                relay.icon,
                relay.pubkey,
                relay.description,
                relay.contact,
                relay.supported_nips,
                relay.software,
                relay.version,
                relay.active,
            );
        });
        const query = `
            INSERT INTO relays (${columns.join(", ")})
            VALUES ${placeholders.join(", ")}
            ON CONFLICT (url)
            DO UPDATE SET
                name = EXCLUDED.name,
                icon = EXCLUDED.icon,
                pubkey = EXCLUDED.pubkey,
                description = EXCLUDED.description,
                contact = EXCLUDED.contact,
                supported_nips = EXCLUDED.supported_nips,
                software = EXCLUDED.software,
                version = EXCLUDED.version,
                active = EXCLUDED.active,
                ref_count = relays.ref_count + 1
        `;
        await this._db.exec(query, values);
    }

    public async upRefs(refs: RefRelay[]): Promise<void>
    {
        for (let i = 0; i < refs.length; i += this.BATCH_SIZE) {
            const batch = refs.slice(i, i + this.BATCH_SIZE);
            await this.upRefsBetch(batch);
        }
    }

    private async upRefsBetch(refs: RefRelay[]): Promise<void>
    {
        if(!refs.length) return

        const urls = refs.map(r => r.url);
        const counts = refs.map(r => r.count);

        const query = `
            UPDATE relays 
                SET ref_count = relays.ref_count + v.count
            FROM (
                SELECT unnest($1::text[]) AS url,
                       unnest($2::bigint[]) AS count
            ) AS v
            WHERE relays.url = v.url
        `;

        await this._db.exec(query, [urls, counts]);
    }
}

export default DBRelays
