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
const DBRelays_1 = __importDefault(require("./database/DBRelays"));
const constant_1 = require("../constant");
const https = require("node:https");
const pLimit = require("p-limit");
const axios_1 = __importDefault(require("axios"));
class RelayService {
    constructor(settings, dbRelays = new DBRelays_1.default()) {
        this._settings = settings;
        this._dbRelays = dbRelays;
        this._relayIndex = new Map();
        this._relayIndex.set(constant_1.Service.pubkey_indexer, settings.pubkey_relay_index);
        this._relayIndex.set(constant_1.Service.profile_indexer, settings.user_relay_index);
        this._relayIndex.set(constant_1.Service.note_indexer, settings.note_relay_index);
        this._relayIndex.set(constant_1.Service.file_indexer, settings.file_relay_index);
        this._relayIndex.set(constant_1.Service.relay_indexer, settings.relay_index);
    }
    loadRelays(_a) {
        return __awaiter(this, arguments, void 0, function* ({ pool, pubkeys, accumulateRelays }) {
            const uniqueRelays = new Set();
            let skip = this._settings.max_fetch_events;
            console.log("fetching relays from", pubkeys.length, "pubkeys");
            for (let i = 0; i < pubkeys.length; i += skip) {
                let events = yield pool.fechEvents({
                    authors: pubkeys.slice(i, i + skip),
                    kinds: [10002],
                    limit: skip
                });
                for (let i = 0; i < events.length; i++) {
                    let event = events[i];
                    let relays = RelayService.relaysFromEvent(event);
                    relays.forEach(relay => uniqueRelays.add(relay));
                }
                console.log("found relays.:", uniqueRelays.size);
            }
            accumulateRelays(Array.from(uniqueRelays));
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
            const limit = pLimit(12);
            const uniqueRelays = new Map();
            let betchSize = this._settings.relays_betch_size;
            const distinctRelays = (0, utils_1.distinct)(relayUrls);
            for (let i = 0; i < distinctRelays.length; i += betchSize) {
                console.log("validating,", betchSize, "relays");
                const betch = distinctRelays.slice(i, i + betchSize);
                const results = yield Promise.all(betch.map((url) => __awaiter(this, void 0, void 0, function* () { return limit(() => this.fetchRelayData(url)); })));
                const allRelays = results.flat().filter((r) => !!r);
                if (allRelays.length) {
                    console.log("valid relays...:", allRelays.filter(r => r.available).length);
                    allRelays.forEach(relay => uniqueRelays.set(relay.url, relay));
                }
            }
            yield this._dbRelays.upsert(Array.from(uniqueRelays.values()));
        });
    }
    fetchRelayData(url) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            const httpClient = axios_1.default.create({
                headers: { Accept: "application/nostr+json" },
                httpsAgent: new https.Agent({ rejectUnauthorized: false }),
                timeout: 3000
            });
            try {
                if (url.includes(".onion") || url.includes(".local"))
                    throw new Error("onion is not accessible");
                const relayUrl = url.replace("wss", "https")
                    .replace("ws", "http");
                const response = yield httpClient.get(relayUrl);
                if (response.status != 200)
                    throw new Error(`unreachable relay ${url}`);
                let relay_author = response.data.pubkey;
                if (relay_author && relay_author.startsWith("npub")) {
                    relay_author = (0, utils_1.npubToHex)(relay_author);
                }
                return {
                    url: url.slice(0, 100),
                    pubkey: (_a = relay_author === null || relay_author === void 0 ? void 0 : relay_author.slice(0, 64)) !== null && _a !== void 0 ? _a : null,
                    name: (_c = (_b = response.data.name) === null || _b === void 0 ? void 0 : _b.slice(0, 100)) !== null && _c !== void 0 ? _c : url,
                    description: (_d = response.data.description) !== null && _d !== void 0 ? _d : null,
                    contact: (_f = (_e = response.data.contact) === null || _e === void 0 ? void 0 : _e.slice(0, 250)) !== null && _f !== void 0 ? _f : null,
                    supported_nips: JSON.stringify((_g = response.data.supported_nips) !== null && _g !== void 0 ? _g : []),
                    software: (_j = (_h = response.data.software) === null || _h === void 0 ? void 0 : _h.slice(0, 250)) !== null && _j !== void 0 ? _j : null,
                    version: (_l = (_k = response.data.version) === null || _k === void 0 ? void 0 : _k.slice(0, 50)) !== null && _l !== void 0 ? _l : null,
                    icon: (_m = response.data.icon) !== null && _m !== void 0 ? _m : null,
                    created_at: new Date(),
                    available: true,
                    ref_count: 1
                };
            }
            catch (ex) {
                return {
                    url: url.slice(0, 100),
                    name: url.slice(0, 100),
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
        const relayIndex = new Map();
        relayIndex.set(constant_1.Service.pubkey_indexer, settings.pubkey_relay_index);
        relayIndex.set(constant_1.Service.profile_indexer, settings.user_relay_index);
        relayIndex.set(constant_1.Service.note_indexer, settings.note_relay_index);
        relayIndex.set(constant_1.Service.file_indexer, settings.file_relay_index);
        relayIndex.set(constant_1.Service.relay_indexer, settings.relay_index);
        return (_a = relayIndex.get(service)) !== null && _a !== void 0 ? _a : 0;
    }
}
exports.default = RelayService;
