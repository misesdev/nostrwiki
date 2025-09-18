import DBFactory from "./DBFactory"
import { Note, RefNote } from "../../modules/types/Note";
import DBElastic from "../elastic/dbElastic";

class DBNotes
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

    public async upsert(notes: Note[]): Promise<void>
    {
        for (let i = 0; i < notes.length; i += this.BATCH_SIZE) {
            const batch = notes.slice(i, i + this.BATCH_SIZE);
            await this._elastic.indexNotes(batch)
            await this.upsertBetch(batch);
        }
    }

    private async upsertBetch(notes: Note[]): Promise<void>
    {
        if(!notes.length) return;

        const columns = [
            "id", "kind", "pubkey", "title", "content", "published_by", "published_at", 
            "created_at", "tags"
        ];
        const values: any[] = [];
        const placeholders: string[] = [];
        notes.forEach((note, i) => {
            const baseIndex = i * columns.length;
            placeholders.push(
                `(${columns.map((_, j) => `$${baseIndex + j + 1}`).join(", ")})`
            );
            values.push(
                note.id,
                note.kind,
                note.pubkey,
                note.title,
                note.content,
                note.published_by,
                note.published_at,
                note.created_at,
                note.tags
            )
        })
        const query = `
            INSERT INTO notes (${columns.join(", ")})
            VALUES ${placeholders.join(", ")}
            ON CONFLICT (id) 
            DO UPDATE SET
                ref_count = EXCLUDED.ref_count + 1
        `;
        await this._db.exec(query, values);
    }

    public async upRefs(refs: RefNote[]): Promise<void>
    {
        for (let i = 0; i < refs.length; i += this.BATCH_SIZE) {
            const batch = refs.slice(i, i + this.BATCH_SIZE);
            await this.upRefsBetch(batch);
        }
    }

    public async upRefsBetch(refs: RefNote[]): Promise<void>
    {
        if(!refs.length) return

        const ids = refs.map(r => r.id);
        const counts = refs.map(r => r.count);
        let query = `
            -- update ref_count(relevance) notes
            UPDATE notes
                SET ref_count = notes.ref_count + v.count
            FROM (
                SELECT unnest($1::text[]) AS id,
                       unnest($2::bigint[]) AS count
            ) AS v
            WHERE notes.id = v.id;
        `;
        await this._db.exec(query, [ids, counts]);
        query = `
            -- update ref_count(relevance) in files of this notes
            UPDATE files 
                SET ref_count = files.ref_count + v.count
            FROM (
                SELECT unnest($1::text[]) AS id,
                       unnest($2::bigint[]) AS count
            ) AS v
            WHERE files.note_id = v.id;
        `;
        await this._db.exec(query, [ids, counts]);
    }
}

export default DBNotes
