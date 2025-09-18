"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DBFactory_1 = __importDefault(require("./DBFactory"));
const dbElastic_1 = __importDefault(require("../elastic/dbElastic"));
class DBNotes {
    constructor(db = new DBFactory_1.default(), elastic = new dbElastic_1.default()) {
        this.BATCH_SIZE = 100;
        this._db = db;
        this._elastic = elastic;
    }
    upsert(notes) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < notes.length; i += this.BATCH_SIZE) {
                const batch = notes.slice(i, i + this.BATCH_SIZE);
                yield this._elastic.indexNotes(batch);
                yield this.upsertBetch(batch);
            }
        });
    }
    upsertBetch(notes) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!notes.length)
                return;
            const columns = [
                "id", "kind", "pubkey", "title", "content", "published_by", "published_at",
                "created_at", "tags"
            ];
            const values = [];
            const placeholders = [];
            notes.forEach((note, i) => {
                const baseIndex = i * columns.length;
                placeholders.push(`(${columns.map((_, j) => `$${baseIndex + j + 1}`).join(", ")})`);
                values.push(note.id, note.kind, note.pubkey, note.title, note.content, note.published_by, note.published_at, note.created_at, note.tags);
            });
            const query = `
            INSERT INTO notes (${columns.join(", ")})
            VALUES ${placeholders.join(", ")}
            ON CONFLICT (id) 
            DO UPDATE SET
                ref_count = EXCLUDED.ref_count + 1
        `;
            yield this._db.exec(query, values);
        });
    }
    upRefs(refs) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < refs.length; i += this.BATCH_SIZE) {
                const batch = refs.slice(i, i + this.BATCH_SIZE);
                yield this.upRefsBetch(batch);
            }
        });
    }
    upRefsBetch(refs) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!refs.length)
                return;
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
            yield this._db.exec(query, [ids, counts]);
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
            yield this._db.exec(query, [ids, counts]);
        });
    }
}
exports.default = DBNotes;
