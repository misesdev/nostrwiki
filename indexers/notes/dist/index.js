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
const constant_1 = require("./src/constant");
const RelayPool_1 = require("./src/modules/RelayPool");
const NoteService_1 = __importDefault(require("./src/service/NoteService"));
const PubkeyService_1 = __importDefault(require("./src/service/PubkeyService"));
const RelayService_1 = __importDefault(require("./src/service/RelayService"));
const AppSettings_1 = __importDefault(require("./src/settings/AppSettings"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.configDotenv)();
const runIndexer = () => __awaiter(void 0, void 0, void 0, function* () {
    const appSettings = new AppSettings_1.default();
    const settings = yield appSettings.get();
    try {
        console.log("Running indexer...");
        const relayMap = new Map();
        const accumulateRelays = (relays) => {
            relays.forEach(relay => { var _a; return relayMap.set(relay, ((_a = relayMap.get(relay)) !== null && _a !== void 0 ? _a : 0) + 1); });
        };
        const relays = yield RelayService_1.default.currentRelays(settings, constant_1.Service.note_indexer);
        const users = yield PubkeyService_1.default.currentUsers(settings, constant_1.Service.note_indexer);
        const pool = yield RelayPool_1.RelayPool.getInstance(relays);
        const noteService = new NoteService_1.default(settings);
        yield noteService.loadNotes({ pool, users, accumulateRelays });
        const relayRefs = Array.from(relayMap.entries())
            .map(([url, count]) => ({ url, count }));
        if (relayRefs.length) {
            const relayService = new RelayService_1.default(settings);
            yield relayService.saveRelays(relayRefs.map(r => r.url));
            yield relayService.upRefs(relayRefs);
        }
        if (settings.note_pubkey_index >= settings.pubkeys_per_process) {
            const relayIndex = settings.note_relay_index + relays.length;
            yield appSettings.updateRelayIndex(constant_1.Service.note_indexer, relayIndex);
        }
        if (users.length) {
            const pubkeyIndex = settings.note_pubkey_index + users.length;
            yield appSettings.updatePubkeyIndex(constant_1.Service.note_indexer, pubkeyIndex);
        }
        yield pool.disconect();
    }
    catch (err) {
        console.error("Indexer error:", err);
    }
    finally {
        console.log("Indexer finished. Next run in", settings.indexer_interval, "minutes");
        setTimeout(runIndexer, settings.indexer_interval * 60 * 1000);
    }
});
runIndexer();
