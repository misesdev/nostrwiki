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
const pg_1 = require("pg");
class DBFactory {
    constructor() {
        var _a;
        this._db = new pg_1.Pool({
            host: process.env.DB_HOST || "db-engine",
            port: parseInt((_a = process.env.DB_PORT) !== null && _a !== void 0 ? _a : "5432"),
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE
        });
    }
    query(query, params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this._db.query(query, params);
                return result.rows;
            }
            catch (ex) {
                console.log(ex);
                return [];
            }
        });
    }
    exec(query, params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this._db.query(query, params);
            }
            catch (ex) {
                console.log(ex);
            }
        });
    }
}
exports.default = DBFactory;
