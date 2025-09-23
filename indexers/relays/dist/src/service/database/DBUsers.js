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
const dbElastic_1 = __importDefault(require("../elastic/dbElastic"));
const DBFactory_1 = __importDefault(require("./DBFactory"));
class DBUsers {
    constructor(db = new DBFactory_1.default(), elastic = new dbElastic_1.default()) {
        this.BATCH_SIZE = 100;
        this._db = db;
        this._elastic = elastic;
    }
    list(offset, items) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
            SELECT DISTINCT ON (u.pubkey) 
                u.*,
                n.published_at AS since
            FROM users u
            LEFT JOIN notes n ON n.pubkey = u.pubkey
            WHERE u.available = true
            ORDER BY u.pubkey, n.published_at DESC
            LIMIT $1 OFFSET $2
        `;
            const result = yield this._db.query(query, [items, offset]);
            return result;
        });
    }
    listPubkeys(offset, items) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
            SELECT pubkey 
            FROM users 
            ORDER BY pubkey 
            LIMIT $1 OFFSET $2
        `;
            const results = yield this._db.query(query, [items, offset]);
            return results.map(u => u.pubkey);
        });
    }
    upsertPubkeys(items) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < items.length; i += this.BATCH_SIZE) {
                const batch = items.slice(i, i + this.BATCH_SIZE);
                yield this.upsertPubkeysBetch(batch);
            }
        });
    }
    upsertPubkeysBetch(pubkeys) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!pubkeys.length)
                return;
            const values = [];
            const columns = ["pubkey"];
            const placeholders = [];
            pubkeys.forEach((pubkey, i) => {
                const baseIndex = i * columns.length;
                placeholders.push(`(${columns.map((_, j) => `$${baseIndex + j + 1}`).join(", ")})`);
                values.push(pubkey);
            });
            const query = `
            INSERT INTO users (${columns.join(", ")})
            VALUES ${placeholders.join(", ")}
            ON CONFLICT (pubkey)
            DO UPDATE SET
                ref_count = EXCLUDED.ref_count + 1,
                updated_at = NOW()
        `;
            yield this._db.exec(query, values);
        });
    }
    upsert(items) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < items.length; i += this.BATCH_SIZE) {
                const batch = items.slice(i, i + this.BATCH_SIZE);
                yield this._elastic.indexUsers(batch);
                yield this.upsertBetch(batch);
            }
        });
    }
    upsertBetch(users) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!users.length)
                return;
            const columns = [
                "pubkey", "name", "display_name", "picture", "about", "banner", "website",
                "nip05", "lud06", "lud16", "zap_service", "created_at", "available"
            ];
            const values = [];
            const placeholders = [];
            users.forEach((user, i) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                const baseIndex = i * columns.length;
                placeholders.push(`(${columns.map((_, j) => `$${baseIndex + j + 1}`).join(", ")})`);
                values.push(user.pubkey, (_a = user.name) !== null && _a !== void 0 ? _a : null, (_b = user.display_name) !== null && _b !== void 0 ? _b : null, (_c = user.picture) !== null && _c !== void 0 ? _c : null, (_d = user.about) !== null && _d !== void 0 ? _d : null, (_e = user.banner) !== null && _e !== void 0 ? _e : null, (_f = user.website) !== null && _f !== void 0 ? _f : null, (_g = user.nip05) !== null && _g !== void 0 ? _g : null, (_h = user.lud06) !== null && _h !== void 0 ? _h : null, (_j = user.lud16) !== null && _j !== void 0 ? _j : null, (_k = user.zapService) !== null && _k !== void 0 ? _k : null, user.created_at, true);
            });
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
            UPDATE users 
                SET ref_count = users.ref_count + v.count
            FROM (
                SELECT unnest($1::text[]) AS pubkey,
                       unnest($2::bigint[]) AS count
            ) AS v
            WHERE users.pubkey = v.pubkey
        `;
            yield this._db.exec(query, [pubkeys, counts]);
        });
    }
}
exports.default = DBUsers;
