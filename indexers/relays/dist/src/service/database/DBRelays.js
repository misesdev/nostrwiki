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
Object.defineProperty(exports, "__esModule", { value: true });
const DBFactory_1 = require("./DBFactory");
class DBRelays {
    constructor() {
        this.BATCH_SIZE = 100;
        this._db = new DBFactory_1.default();
    }
    list(offset, items) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
            SELECT * 
            FROM relays 
            WHERE available = true
                AND url NOT LIKE '%.onion'
            ORDER BY url 
            LIMIT $1 OFFSET $2
        `;
            const result = yield this._db.query(query, [items, offset]);
            return result;
        });
    }
    upsert(items) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < items.length; i += this.BATCH_SIZE) {
                const batch = items.slice(i, i + this.BATCH_SIZE);
                yield this.upsertBetch(batch);
            }
        });
    }
    upsertBetch(relays) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!relays.length)
                return;
            const columns = [
                "url", "name", "icon", "pubkey", "description", "contact", "supported_nips",
                "software", "version", "available", "created_at"
            ];
            const values = [];
            const placeholders = [];
            relays.forEach((relay, i) => {
                const baseIndex = i * columns.length;
                placeholders.push(`(${columns.map((_, j) => `$${baseIndex + j + 1}`).join(", ")})`);
                values.push(relay.url, relay.name, relay.icon, relay.pubkey, relay.description, relay.contact, relay.supported_nips, relay.software, relay.version, relay.available, new Date());
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
                ref_count = relays.ref_count + 1,
                updated_at = NOW()
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
            yield this._db.exec(query, [urls, counts]);
        });
    }
}
exports.default = DBRelays;
