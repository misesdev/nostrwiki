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
const constant_1 = require("../constant");
const AppSettings_1 = require("../settings/AppSettings");
const utils_1 = require("../utils");
const DBUsers_1 = require("./database/DBUsers");
const FriendsService_1 = require("./FriendsService");
const RelayService_1 = require("./RelayService");
class PubkeyService {
    constructor(settings, dbUsers = new DBUsers_1.default(), friendService = new FriendsService_1.default()) {
        this._dbUsers = dbUsers;
        this._friendService = friendService;
        this._settings = settings;
    }
    loadPubkeys(_a) {
        return __awaiter(this, arguments, void 0, function* ({ pool, pubkeys, accumulateRelays }) {
            if (!pubkeys.length)
                return;
            if (pubkeys.length == 1 && pubkeys[0] == this._settings.initial_pubkey) {
                yield this._dbUsers.upsertPubkeys((0, utils_1.distinct)(pubkeys));
            }
            const relayUrls = [];
            let skipe = this._settings.max_fetch_events;
            console.log(`varrendo ${pubkeys.length} pubkeys..`);
            for (let i = 0; i < pubkeys.length; i += skipe) {
                let events = yield pool.fechEvents({
                    authors: pubkeys.slice(i, i + skipe),
                    kinds: [3],
                    limit: skipe
                });
                for (let i = 0; i < events.length; i++) {
                    let event = events[i];
                    let npubs = (0, utils_1.getPubkeys)(event);
                    console.log("npubs...:", npubs.length);
                    yield this._dbUsers.upsertPubkeys((0, utils_1.distinct)(npubs));
                    yield this._friendService
                        .saveFriends(event.pubkey, (0, utils_1.distinct)(npubs));
                    const urls = RelayService_1.default.relaysFromEvent(event);
                    relayUrls.push(...urls);
                }
            }
            accumulateRelays(relayUrls);
        });
    }
    static getPubkeyIndex(settings, service) {
        var _a;
        const map = new Map();
        map.set(constant_1.Service.pubkey_indexer, settings.pubkey_index);
        map.set(constant_1.Service.profile_indexer, settings.user_pubkey_index);
        map.set(constant_1.Service.note_indexer, settings.note_pubkey_index);
        map.set(constant_1.Service.file_indexer, settings.file_pubkey_index);
        map.set(constant_1.Service.relay_indexer, settings.relay_pubkey_index);
        return (_a = map.get(service)) !== null && _a !== void 0 ? _a : 0;
    }
    static currentPubkeys(settings, service) {
        return __awaiter(this, void 0, void 0, function* () {
            const dbUsers = new DBUsers_1.default();
            const appSettings = new AppSettings_1.default();
            const index = this.getPubkeyIndex(settings, service);
            let pubkeys = yield dbUsers.listPubkeys(index, settings.pubkeys_per_process);
            if (!pubkeys.length && settings.pubkey_index != 0) {
                pubkeys = yield dbUsers.listPubkeys(0, settings.pubkeys_per_process);
                if (!pubkeys.length)
                    pubkeys = [settings.initial_pubkey];
                yield appSettings.updatePubkeyIndex(service, 0);
            }
            if (!pubkeys.length && settings.pubkey_index <= 0)
                pubkeys = [settings.initial_pubkey];
            return pubkeys;
        });
    }
}
exports.default = PubkeyService;
