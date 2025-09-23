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
exports.RelayPool = void 0;
const ws_1 = require("ws");
const utils_1 = require("../utils");
const RelayService_1 = __importDefault(require("../service/RelayService"));
const DBRelays_1 = __importDefault(require("../service/database/DBRelays"));
const AppSettings_1 = __importDefault(require("../settings/AppSettings"));
class RelayPool {
    constructor(relays) {
        this.timeout = 3200;
        this.subscription = "3da9794398579582309458";
        if (relays.length < 1)
            throw Error("expected relays");
        this.relays = relays;
        this.websockets = [];
    }
    connectRelay(relay) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                let websock = new ws_1.WebSocket(relay);
                websock.on("open", () => resolve(websock));
                websock.on("close", () => resolve(null));
                websock.on("error", () => resolve(null));
                setTimeout(() => resolve(null), this.timeout);
            });
        });
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            let websockets = this.relays.map((relay) => __awaiter(this, void 0, void 0, function* () { return yield this.connectRelay(relay); }));
            const allwebsockets = yield Promise.all(websockets);
            const connectedRelays = allwebsockets.filter((socket) => socket != null);
            this.websockets.push(...connectedRelays);
            console.log("connected relays", this.websockets.length);
        });
    }
    disconectRelay(websocket) {
        return __awaiter(this, void 0, void 0, function* () {
            new Promise((resolve) => {
                let timeout;
                websocket.send(`[\"CLOSE\", ${this.subscription}]`);
                const handleMessage = (message) => {
                    let data = JSON.parse(message.toString());
                    if (data[0] == "EOSE") {
                        websocket.removeListener("message", handleMessage);
                        clearTimeout(timeout);
                        resolve();
                    }
                    websocket.on("message", handleMessage);
                    timeout = setTimeout(() => {
                        websocket.removeListener("message", handleMessage);
                        resolve();
                    }, this.timeout);
                };
            });
        });
    }
    disconect() {
        return __awaiter(this, void 0, void 0, function* () {
            let promises = this.websockets.map(websocket => this.disconectRelay(websocket));
            yield Promise.all(promises);
        });
    }
    fetchEventRelay(websocket, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!filter.since)
                delete filter["since"];
            return new Promise((resolve) => {
                let timeout;
                let events = [];
                // send the message
                websocket.send(`[
                "REQ", 
                "${this.subscription}", 
                ${JSON.stringify(filter)}
            ]`);
                // receive the event and return
                const handleMessage = (message) => {
                    let data = JSON.parse(message.toString());
                    if (data[0] == "EVENT") {
                        let event = data[2];
                        events.push(event);
                    }
                    if (data[0] == "EOSE") {
                        websocket.removeListener("message", handleMessage);
                        clearTimeout(timeout);
                        resolve(events);
                    }
                };
                websocket.on("message", handleMessage);
                // remove the listener in timeout
                timeout = setTimeout(() => {
                    websocket.removeAllListeners("message");
                    resolve(events);
                }, this.timeout);
            });
        });
    }
    fechEvents(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            let eventPromises = this.websockets.map((websocket) => __awaiter(this, void 0, void 0, function* () {
                return this.fetchEventRelay(websocket, filter).catch((error) => {
                    console.log(error);
                    return [];
                });
            }));
            let allEvents = yield Promise.all(eventPromises);
            let events = allEvents.flat();
            return (0, utils_1.distinctEvent)(events);
        });
    }
    fechUser(pubkey) {
        return __awaiter(this, void 0, void 0, function* () {
            let events = yield this.fechEvents({
                kinds: [0],
                authors: [pubkey],
                limit: 1
            });
            if (events.length > 0)
                return events[0];
            return null;
        });
    }
    addRelays(relay) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("connecting more relays");
            this.relays = relay.filter(r => !this.relays.some(i => i == r));
            yield this.connect();
        });
    }
    static getInstance(settings, service) {
        return __awaiter(this, void 0, void 0, function* () {
            const dbRelays = new DBRelays_1.default();
            const appSettings = new AppSettings_1.default();
            let currentIndex = RelayService_1.default.getRelayIndex(settings, service);
            const relays = yield dbRelays.list(currentIndex, settings.relays_connections);
            if (!relays.length) {
                const list = yield dbRelays.list(0, settings.relays_connections);
                yield appSettings.updateRelayIndex(service, 0);
                relays.push(...list);
                currentIndex = 0;
            }
            const pool = new RelayPool(relays.map(r => r.url));
            yield pool.connect();
            while (pool.websockets.length <= settings.relays_connections) {
                currentIndex += settings.relays_connections;
                const relays = yield dbRelays.list(currentIndex, settings.relays_connections);
                if (relays.length)
                    yield appSettings.updateRelayIndex(service, currentIndex);
                if (!relays.length) {
                    const list = yield dbRelays.list(0, settings.relays_connections);
                    yield appSettings.updateRelayIndex(service, 0);
                    relays.push(...list);
                    currentIndex = 0;
                }
                yield pool.addRelays(relays.map(r => r.url));
            }
            return pool;
        });
    }
}
exports.RelayPool = RelayPool;
