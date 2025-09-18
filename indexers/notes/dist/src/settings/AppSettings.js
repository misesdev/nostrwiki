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
const constant_1 = require("../constant");
const DBSettings_1 = __importDefault(require("../service/database/DBSettings"));
class AppSettings {
    constructor(dbSettings = new DBSettings_1.default()) {
        this._dbSettings = dbSettings;
    }
    get() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._dbSettings.get();
        });
    }
    save(settings) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._dbSettings.update(settings);
        });
    }
    updateRelayIndex(col, index) {
        return __awaiter(this, void 0, void 0, function* () {
            if (col == constant_1.Service.relay_indexer)
                yield this._dbSettings.updateIndex(index, "relay_index");
            else if (col == constant_1.Service.pubkey_indexer)
                yield this._dbSettings.updateIndex(index, "pubkey_relay_index");
            else if (col == constant_1.Service.profile_indexer)
                yield this._dbSettings.updateIndex(index, "user_relay_index");
            else if (col == constant_1.Service.note_indexer)
                yield this._dbSettings.updateIndex(index, "note_relay_index");
            else if (col == constant_1.Service.file_indexer)
                yield this._dbSettings.updateIndex(index, "file_relay_index");
            else
                yield this._dbSettings.updateIndex(index, "relay_index");
        });
    }
    updatePubkeyIndex(col, index) {
        return __awaiter(this, void 0, void 0, function* () {
            if (col == constant_1.Service.pubkey_indexer)
                yield this._dbSettings.updateIndex(index, "pubkey_index");
            else if (col == constant_1.Service.profile_indexer)
                yield this._dbSettings.updateIndex(index, "user_pubkey_index");
            else if (col == constant_1.Service.note_indexer)
                yield this._dbSettings.updateIndex(index, "note_pubkey_index");
            else if (col == constant_1.Service.file_indexer)
                yield this._dbSettings.updateIndex(index, "file_pubkey_index");
            else if (col == constant_1.Service.relay_indexer)
                yield this._dbSettings.updateIndex(index, "relay_pubkey_index");
            else
                yield this._dbSettings.updateIndex(index, "pubkey_index");
        });
    }
    updateSince(col, time) {
        return __awaiter(this, void 0, void 0, function* () {
            if (col == constant_1.Service.note_indexer)
                yield this._dbSettings.updateSince(time, "note_since");
            else if (col == constant_1.Service.file_indexer)
                yield this._dbSettings.updateSince(time, "file_since");
            else
                yield this._dbSettings.updateSince(time, "note_since");
        });
    }
}
exports.default = AppSettings;
