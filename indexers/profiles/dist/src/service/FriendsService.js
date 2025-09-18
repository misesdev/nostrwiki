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
const DBFriends_1 = __importDefault(require("./database/DBFriends"));
class FriendsService {
    constructor(dbFriends = new DBFriends_1.default()) {
        this._dbFriends = dbFriends;
    }
    saveFriends(user, friends) {
        return __awaiter(this, void 0, void 0, function* () {
            const allfriends = friends.map((pubkey) => ({
                user_pubkey: user,
                friend_pubkey: pubkey
            }));
            yield this._dbFriends.upsert(allfriends);
            console.log(`saved ${friends.length} friends ${user}`);
        });
    }
}
exports.default = FriendsService;
