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
const _1 = require(".");
const AppSettings_1 = require("./src/settings/AppSettings");
function scheduleIndexer() {
    return __awaiter(this, void 0, void 0, function* () {
        const settings = AppSettings_1.default.get();
        try {
            console.log("Running indexer...");
            yield (0, _1.default)(settings);
        }
        catch (err) {
            console.error("Indexer error:", err);
        }
        finally {
            console.log("Indexer finished. Next run in", settings.indexer_interval, "minutes");
            setTimeout(scheduleIndexer, settings.indexer_interval * 60 * 1000);
        }
    });
}
// runs immediately and then every indexer_interval minutes
scheduleIndexer();
