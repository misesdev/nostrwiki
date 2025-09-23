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
class DBFriends {
    constructor() {
        this.BATCH_SIZE = 100;
        this._db = new DBFactory_1.default();
    }
    listFriends(user_pubkey) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
            SELECT f.friend_pubkey AS pubkey, u.*
            FROM friends f
            JOIN users u ON f.friend_pubkey = u.pubkey
            WHERE f.user_pubkey = $1
            ORDER BY u.display_name NULLS LAST, u.name NULLS LAST
        `;
            const result = yield this._db.query(query, [user_pubkey]);
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
    upsertBetch(friends) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!friends.length)
                return;
            const columns = ["user_pubkey", "friend_pubkey"];
            const values = [];
            const placeholders = [];
            friends.forEach((f, i) => {
                const baseIndex = i * columns.length;
                placeholders.push(`(${columns.map((_, j) => `$${baseIndex + j + 1}`).join(", ")})`);
                values.push(f.user_pubkey, f.friend_pubkey);
            });
            const query = `
            INSERT INTO friends (${columns.join(", ")})
            VALUES ${placeholders.join(", ")}
            ON CONFLICT (user_pubkey, friend_pubkey) DO NOTHING
        `;
            yield this._db.exec(query, values);
        });
    }
    remove(user_pubkey, friend_pubkey) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
            DELETE FROM friends
            WHERE user_pubkey = $1 AND friend_pubkey = $2
        `;
            yield this._db.exec(query, [user_pubkey, friend_pubkey]);
        });
    }
}
exports.default = DBFriends;
