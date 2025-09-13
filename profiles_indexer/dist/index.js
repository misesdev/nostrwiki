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
const RelayPool_1 = require("./src/modules/RelayPool");
const PubkeyService_1 = require("./src/service/PubkeyService");
const RelayService_1 = require("./src/service/RelayService");
const AppSettings_1 = require("./src/settings/AppSettings");
const dotenv_1 = require("dotenv");
(0, dotenv_1.configDotenv)();
const runIndexer = (settings) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const relayMap = new Map();
        const accumulateRelays = (relays) => {
            relays.forEach(relay => { var _a; return relayMap.set(relay, ((_a = relayMap.get(relay)) !== null && _a !== void 0 ? _a : 0) + 1); });
        };
        const relays = yield RelayService_1.default.currentRelays(settings);
        const pool = yield RelayPool_1.RelayPool.getInstance(relays);
        const pubkeys = yield PubkeyService_1.default.currentPubkeys(settings);
        const pubkeyService = new PubkeyService_1.default(settings);
        yield pubkeyService.loadPubkeys({ pool, pubkeys, accumulateRelays });
        const relayRefs = Array.from(relayMap.entries())
            .map(([url, count]) => ({ url, count }));
        const relayService = new RelayService_1.default(settings);
        yield relayService.saveRelays(relayRefs.map(r => r.url));
        yield relayService.upRefs(relayRefs);
        if (settings.pubkey_index >= settings.pubkeys_per_process)
            settings.relay_index += relays.length;
        settings.pubkey_index += pubkeys.length;
        AppSettings_1.default.save(settings);
        yield pool.disconect();
    }
    catch (ex) {
        console.log(ex);
    }
});
exports.default = runIndexer;
