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
const DBUsers_1 = __importDefault(require("./database/DBUsers"));
const PubkeyService_1 = __importDefault(require("./PubkeyService"));
const RelayService_1 = __importDefault(require("./RelayService"));
class UserService {
    constructor(settings, dbUsers = new DBUsers_1.default()) {
        this._dbUsers = dbUsers;
        this._settings = settings;
    }
    listUsers(service) {
        return __awaiter(this, void 0, void 0, function* () {
            const index = PubkeyService_1.default.getPubkeyIndex(this._settings, service);
            return yield this._dbUsers.list(index, this._settings.pubkeys_per_process);
        });
    }
    loadUsers(_a) {
        return __awaiter(this, arguments, void 0, function* ({ pool, pubkeys, accumulateRelays }) {
            const relayUrls = [];
            let skipe = this._settings.max_fetch_events;
            for (let i = 0; i <= pubkeys.length; i += skipe) {
                let users = new Map();
                let events = yield pool.fechEvents({
                    authors: pubkeys.slice(i, i + skipe),
                    limit: skipe,
                    kinds: [0]
                });
                console.log("users...:", events.length);
                for (let i = 0; i < events.length; i++) {
                    try {
                        const user = this.userFromEvent(events[i]);
                        users.set(events[i].pubkey, user);
                        const urls = RelayService_1.default.relaysFromEvent(events[i]);
                        relayUrls.push(...urls);
                    }
                    catch (_b) { }
                }
                const distincts = Array.from(users.values());
                yield this._dbUsers.upsert(distincts);
            }
            accumulateRelays(relayUrls);
        });
    }
    userFromEvent(event) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        let user = JSON.parse(event.content);
        if ((!user.name && !user.display_name) || user["deleted"])
            throw new Error("invalid user");
        let properties = [
            "name", "pubkey", "display_name", "picture", "banner", "about",
            "website", "nip05", "lud06", "lud16", "zapService"
        ];
        if (!user.display_name && user["displayName"])
            user.display_name = user["displayName"];
        if (!user.name && user.display_name)
            user.name = user.display_name;
        if (!user.display_name && user.name)
            user.display_name = user.name;
        if (!user.picture && user["profile"])
            user.picture = user["profile"];
        if (((_a = user.name) === null || _a === void 0 ? void 0 : _a.length) >= 100)
            user.name = `${user.name.substring(0, 95)}...`;
        if (((_b = user.display_name) === null || _b === void 0 ? void 0 : _b.length) >= 100)
            user.display_name = `${user.display_name.substring(0, 95)}...`;
        if (((_c = user.picture) === null || _c === void 0 ? void 0 : _c.length) >= 512)
            user.picture = `${user.picture.substring(0, 508)}...`;
        if (((_d = user.banner) === null || _d === void 0 ? void 0 : _d.length) >= 512)
            user.banner = `${user.banner.substring(0, 508)}...`;
        if (((_e = user.website) === null || _e === void 0 ? void 0 : _e.length) >= 512)
            user.website = `${user.website.substring(0, 508)}...`;
        if (((_f = user.nip05) === null || _f === void 0 ? void 0 : _f.length) >= 512)
            user.nip05 = `${user.nip05.substring(0, 508)}...`;
        if (((_g = user.lud06) === null || _g === void 0 ? void 0 : _g.length) >= 512)
            user.lud06 = `${user.lud06.substring(0, 508)}...`;
        if (((_h = user.lud16) === null || _h === void 0 ? void 0 : _h.length) >= 512)
            user.lud16 = `${user.lud16.substring(0, 508)}...`;
        if (((_j = user.zapService) === null || _j === void 0 ? void 0 : _j.length) >= 512)
            user.zapService = `${user.zapService.substring(0, 508)}...`;
        for (let property in user) {
            if (!properties.includes(property))
                delete user[property];
        }
        user.created_at = new Date();
        user.pubkey = event.pubkey;
        return user;
    }
}
exports.default = UserService;
