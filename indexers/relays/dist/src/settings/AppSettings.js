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
const DBSettings_1 = require("../service/database/DBSettings");
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
    incrementRelays(relays) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._dbSettings.incrementRelays(relays);
        });
    }
    incrementPubkeys(relays) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._dbSettings.incrementPubkeys(relays);
        });
    }
}
exports.default = AppSettings;
