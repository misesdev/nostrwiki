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
const utils_1 = require("../utils");
const AppSettings_1 = __importDefault(require("../settings/AppSettings"));
const DBRelays_1 = __importDefault(require("./database/DBRelays"));
const constant_1 = require("../constant");
const https = require("node:https");
const pLimit = require("p-limit");
const axios_1 = __importDefault(require("axios"));
class RelayService {
    constructor(settings, dbRelays = new DBRelays_1.default()) {
        this._settings = settings;
        this._dbRelays = dbRelays;
    }
    loadRelays(_a) {
        return __awaiter(this, arguments, void 0, function* ({ pool, pubkeys, accumulateRelays }) {
            let relayUrls = [];
            let skipe = this._settings.max_fetch_events;
            for (let i = 0; i < pubkeys.length; i += skipe) {
                let events = yield pool.fechEvents({
                    authors: pubkeys.slice(i, i + skipe),
                    kinds: [10002],
                    limit: skipe
                });
                for (let i = 0; i < events.length; i++) {
                    let event = events[i];
                    let urls = RelayService.relaysFromEvent(event);
                    console.log("found relays...:", urls.length);
                    if (urls.length)
                        relayUrls.push(...urls);
                }
            }
            accumulateRelays(relayUrls);
        });
    }
    static relaysFromEvent(event) {
        const relayUrls = [];
        const pushRelay = (data) => {
            if (data) {
                let relayDomain = (0, utils_1.getRelayDomain)(data);
                if (relayDomain)
                    relayUrls.push(relayDomain);
            }
        };
        // relays from profile event
        try {
            let eventRelays = JSON.parse(event.content);
            for (let relay in eventRelays)
                pushRelay(relay);
        }
        catch (_a) { }
        // relays from tags
        try {
            const relayOn2Index = ["p", "a", "e"];
            // relay reference
            event.tags.filter(t => t[0] == "r").forEach(t => pushRelay(t[1]));
            // profile, event, addr references
            event.tags.filter(t => relayOn2Index.includes(t[0]))
                .forEach(t => pushRelay(t[2]));
        }
        catch (_b) { }
        return relayUrls;
    }
    saveRelays(relayUrls) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!relayUrls.length)
                return;
            const limit = pLimit(10);
            let betchSize = this._settings.relays_betch_size;
            const distinctRelays = (0, utils_1.distinct)(relayUrls);
            console.log("fetching data relays...:", distinctRelays.length);
            for (let i = 0; i < distinctRelays.length; i += betchSize) {
                const betch = distinctRelays.slice(i, i + betchSize);
                const results = yield Promise.all(betch.map((url) => __awaiter(this, void 0, void 0, function* () { return limit(() => this.fetchRelayData(url)); })));
                const allRelays = results.flat();
                if (allRelays.length) {
                    yield this._dbRelays.upsert(allRelays.filter(r => !!r));
                    console.log("saved relays", allRelays.length);
                }
            }
        });
    }
    fetchRelayData(url) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            const httpClient = axios_1.default.create({
                headers: { Accept: "application/nostr+json" },
                httpsAgent: new https.Agent({ rejectUnauthorized: false }),
                timeout: 3800
            });
            try {
                if (url.includes(".onion") || url.includes(".local"))
                    throw new Error("onion is not accessible");
                const relayUrl = url.replace("wss", "https")
                    .replace("ws", "http");
                const response = yield httpClient.get(relayUrl);
                if (response.status != 200)
                    throw new Error(`unreachable relay ${url}`);
                console.log("active relay", url);
                let relay_author = response.data.pubkey;
                if (relay_author && relay_author.startsWith("npub")) {
                    relay_author = (0, utils_1.npubToHex)(relay_author);
                }
                return {
                    url,
                    pubkey: relay_author !== null && relay_author !== void 0 ? relay_author : null,
                    name: (_a = response.data.name) !== null && _a !== void 0 ? _a : url,
                    description: (_b = response.data.description) !== null && _b !== void 0 ? _b : null,
                    contact: (_c = response.data.contact) !== null && _c !== void 0 ? _c : null,
                    supported_nips: JSON.stringify((_d = response.data.supported_nips) !== null && _d !== void 0 ? _d : []),
                    software: (_e = response.data.software) !== null && _e !== void 0 ? _e : null,
                    version: (_f = response.data.version) !== null && _f !== void 0 ? _f : null,
                    icon: (_g = response.data.icon) !== null && _g !== void 0 ? _g : null,
                    created_at: new Date(),
                    available: true,
                    ref_count: 1
                };
            }
            catch (ex) {
                console.log("unreachable relay", url);
                return {
                    url,
                    name: url,
                    created_at: new Date(),
                    available: false,
                    ref_count: 1
                };
            }
        });
    }
    upRefs(refs) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._dbRelays.upRefs(refs);
        });
    }
    static getRelayIndex(settings, service) {
        var _a;
        const map = new Map();
        map.set(constant_1.Service.pubkey_indexer, settings.pubkey_relay_index);
        map.set(constant_1.Service.profile_indexer, settings.user_relay_index);
        map.set(constant_1.Service.note_indexer, settings.note_relay_index);
        map.set(constant_1.Service.file_indexer, settings.file_relay_index);
        map.set(constant_1.Service.relay_indexer, settings.relay_index);
        return (_a = map.get(service)) !== null && _a !== void 0 ? _a : 0;
    }
    static currentRelays(settings, service) {
        return __awaiter(this, void 0, void 0, function* () {
            const dbRelays = new DBRelays_1.default();
            const appSettings = new AppSettings_1.default();
            const index = this.getRelayIndex(settings, service);
            let relays = yield dbRelays.list(index, settings.relays_connections);
            if (!relays.length) {
                relays = yield dbRelays.list(0, settings.relays_connections);
                yield appSettings.updateRelayIndex(service, 0);
            }
            return relays;
        });
    }
}
exports.default = RelayService;
