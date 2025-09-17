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
class DBSettings {
    constructor() {
        this._db = new DBFactory_1.default();
    }
    get() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
            SELECT * 
            FROM app_settings 
            LIMIT 1
        `;
            const results = yield this._db.query(query, []);
            return results[0];
        });
    }
    update(settings) {
        return __awaiter(this, void 0, void 0, function* () {
            const values = [];
            const query = `
            UPDATE app_settings SET
                pubkey_index = ${settings.pubkey_index},
                pubkeys_per_process = ${settings.pubkeys_per_process},
                max_fetch_events = ${settings.max_fetch_events},
                relay_index = ${settings.relay_index},
                relays_connections = ${settings.relays_connections},
                relays_betch_size = ${settings.relays_betch_size},
                indexer_interval = ${settings.indexer_interval},
                pubkeys_per_notes = ${settings.pubkeys_per_notes},
                max_fetch_notes = ${settings.max_fetch_notes}
            WHERE 1=1
        `;
            yield this._db.exec(query, values);
        });
    }
    updateIndex(index, col) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
            UPDATE app_settings SET ${col} = ${index} WHERE 1=1
        `;
            yield this._db.exec(query, []);
        });
    }
    updateSince(timeSeconds, col) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
            UPDATE app_settings SET ${col} = ${timeSeconds} WHERE 1=1
        `;
            yield this._db.exec(query, []);
        });
    }
}
exports.default = DBSettings;
