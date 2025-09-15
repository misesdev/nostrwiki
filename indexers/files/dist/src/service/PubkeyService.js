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
const AppSettings_1 = require("../settings/AppSettings");
const utils_1 = require("../utils");
const DBPubkeys_1 = require("./database/DBPubkeys");
const FriendsService_1 = require("./FriendsService");
const RelayService_1 = require("./RelayService");
class PubkeyService {
    constructor(settings, dbPubkeys = new DBPubkeys_1.default(), friendService = new FriendsService_1.default()) {
        this._dbPubkeys = dbPubkeys;
        this._friendService = friendService;
        this._settings = settings;
    }
    loadPubkeys(_a) {
        return __awaiter(this, arguments, void 0, function* ({ pool, pubkeys, accumulateRelays }) {
            const relayUrls = [];
            if (pubkeys[0] == this._settings.initial_user)
                yield this._dbPubkeys.upsert((0, utils_1.distinct)(pubkeys));
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
                    yield this._dbPubkeys.upsert((0, utils_1.distinct)(npubs));
                    yield this._friendService
                        .saveFriends(event.pubkey, (0, utils_1.distinct)(npubs));
                    const urls = RelayService_1.default.relaysFromEvent(event);
                    relayUrls.push(...urls);
                }
            }
            accumulateRelays(relayUrls);
        });
    }
    static currentPubkeys(settings) {
        return __awaiter(this, void 0, void 0, function* () {
            const dbPubkeys = new DBPubkeys_1.default();
            let pubkeys = yield dbPubkeys
                .list(settings.pubkey_index, settings.pubkeys_per_process);
            if (!pubkeys.length && settings.pubkey_index > 0) {
                pubkeys = yield dbPubkeys.list(0, settings.pubkeys_per_process);
                AppSettings_1.default.save(Object.assign(Object.assign({}, settings), { pubkey_index: 0 }));
            }
            if (!pubkeys.length && settings.pubkey_index == 0) {
                pubkeys = [settings.initial_user];
            }
            return pubkeys;
        });
    }
}
exports.default = PubkeyService;
