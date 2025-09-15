"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FDisk_1 = require("../filesytem/FDisk");
class AppSettings {
    static get() {
        let file = new FDisk_1.default("./settings.local.json");
        const json = file.readJson();
        return JSON.parse(json);
    }
    static save(settings) {
        let file = new FDisk_1.default("./settings.local.json");
        file.writeJson(settings);
    }
}
exports.default = AppSettings;
