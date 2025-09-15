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
const utils_1 = require("../utils");
const DBSettings_1 = require("./database/DBSettings");
const DBRelays_1 = require("./database/DBRelays");
const https = require("node:https");
const pLimit = require("p-limit");
const axios_1 = require("axios");
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
            const relays = [];
            let betchSize = this._settings.relays_betch_size;
            const distinctRelays = (0, utils_1.distinct)(relayUrls);
            console.log("fetching data relays...:", distinctRelays.length);
            for (let i = 0; i < distinctRelays.length; i += betchSize) {
                const betch = distinctRelays.slice(i, i + betchSize);
                const results = yield Promise.all(betch.map((url) => __awaiter(this, void 0, void 0, function* () { return limit(() => this.fetchRelayData(url)); })));
                const allRelays = results.flat();
                if (allRelays.length)
                    relays.push(...allRelays.filter(r => !!r));
            }
            yield this._dbRelays.upsert(relays);
            console.log("saved relays", relays.length);
        });
    }
    fetchRelayData(url) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const httpClient = axios_1.default.create({
                headers: { Accept: "application/nostr+json" },
                httpsAgent: new https.Agent({ rejectUnauthorized: false }),
                timeout: 3500
            });
            try {
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
                    pubkey: relay_author,
                    name: (_a = response.data.name) !== null && _a !== void 0 ? _a : url,
                    description: response.data.description,
                    contact: response.data.contact,
                    supported_nips: JSON.stringify((_b = response.data.supported_nips) !== null && _b !== void 0 ? _b : []),
                    software: response.data.software,
                    version: response.data.version,
                    icon: response.data.icon,
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
    static currentRelays(settings) {
        return __awaiter(this, void 0, void 0, function* () {
            const dbRelays = new DBRelays_1.default();
            const appSettings = new DBSettings_1.default();
            let relays = yield dbRelays.list(settings.relay_index, settings.relays_connections);
            if (!relays.length) {
                relays = yield dbRelays.list(0, settings.relays_connections);
                yield appSettings.update(Object.assign(Object.assign({}, settings), { relay_index: 0 }));
            }
            return relays;
        });
    }
}
exports.default = RelayService;
