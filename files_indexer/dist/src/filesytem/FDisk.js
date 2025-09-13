"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
class FDisk {
    constructor(fileName) {
        if (fileName.length < 2)
            throw Error("invalid file name");
        this.filePath = fileName;
    }
    readJson() {
        try {
            const data = fs.readFileSync(this.filePath, "utf-8");
            return data;
        }
        catch (err) {
            console.error(err);
            return "";
        }
    }
    writeJson(data) {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf-8");
        }
        catch (err) {
            console.error(err);
        }
    }
    writeLine(line) {
        try {
            fs.appendFileSync(this.filePath, line + "\n", "utf-8");
        }
        catch (err) {
            console.error(err);
        }
    }
}
exports.default = FDisk;
