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
class DBUsers {
    constructor() {
        this.BATCH_SIZE = 100;
        this._db = new DBFactory_1.default();
    }
    list(offset, items) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
            SELECT * 
            FROM users 
            WHERE active = 1 
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
    upsertBetch(users) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!users.length)
                return;
            const columns = [
                "pubkey", "name", "display_name", "picture", "about",
                "banner", "website", "nip05", "lud06", "lud16", "zap_service"
            ];
            const values = [];
            const placeholders = [];
            users.forEach((user, i) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                const baseIndex = i * columns.length;
                placeholders.push(`(${columns.map((_, j) => `$${baseIndex + j + 1}`).join(", ")})`);
                values.push(user.pubkey, (_a = user.name) !== null && _a !== void 0 ? _a : null, (_b = user.display_name) !== null && _b !== void 0 ? _b : null, (_c = user.picture) !== null && _c !== void 0 ? _c : null, (_d = user.about) !== null && _d !== void 0 ? _d : null, (_e = user.banner) !== null && _e !== void 0 ? _e : null, (_f = user.website) !== null && _f !== void 0 ? _f : null, (_g = user.nip05) !== null && _g !== void 0 ? _g : null, (_h = user.lud06) !== null && _h !== void 0 ? _h : null, (_j = user.lud16) !== null && _j !== void 0 ? _j : null, (_k = user.zapService) !== null && _k !== void 0 ? _k : null);
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
                zap_service = EXCLUDED.zap_service
        `;
            yield this._db.exec(query, values);
        });
    }
}
exports.default = DBUsers;
