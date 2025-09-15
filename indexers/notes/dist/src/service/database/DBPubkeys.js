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
class DBPubkeys {
    constructor() {
        this.BATCH_SIZE = 100;
        this._db = new DBFactory_1.default();
    }
    list(offset, items) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
            SELECT pubkey 
            FROM pubkeys 
            ORDER BY pubkey 
            LIMIT $1 OFFSET $2
        `;
            const result = yield this._db.query(query, [items, offset]);
            return result.map(p => p.pubkey);
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
    upsertBetch(pubkeys) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!pubkeys.length)
                return;
            const values = [];
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
            yield this._db.exec(query, [pubkeys, counts]);
        });
    }
}
exports.default = DBPubkeys;
