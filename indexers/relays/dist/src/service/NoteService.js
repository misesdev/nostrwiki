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
const DBFiles_1 = require("./database/DBFiles");
const DBNotes_1 = require("./database/DBNotes");
const DBUsers_1 = require("./database/DBUsers");
const RelayService_1 = require("./RelayService");
class NoteService {
    constructor(settings, dbNotes = new DBNotes_1.default(), dbFiles = new DBFiles_1.default(), dbUsers = new DBUsers_1.default()) {
        this._settings = settings;
        this._dbNotes = dbNotes;
        this._dbFiles = dbFiles;
        this._dbUsers = dbUsers;
    }
    loadNotes(_a) {
        return __awaiter(this, arguments, void 0, function* ({ pool, pubkeys, accumulateRelays }) {
            if (!pubkeys.length)
                return;
            let skipe = this._settings.pubkeys_per_notes;
            console.log(`loading notes...`);
            for (let i = 0; i < pubkeys.length; i += skipe) {
                let events = yield pool.fechEvents({
                    authors: pubkeys.slice(i, i + skipe),
                    limit: this._settings.max_fetch_notes,
                    kinds: [1, 30023, 30818]
                });
                console.log("found notes...:", events.length);
                // indexing notes
                const notes = this.notesFromEvents(events);
                yield this._dbNotes.upsert(notes);
                // indexing user references
                const pubkeyRefs = this.refPubkeys(events);
                yield this._dbUsers.upRefs(pubkeyRefs);
                // indexing references
                const eventRefs = this.refEvents(events);
                yield this._dbNotes.upRefs(eventRefs);
                // indexing files
                yield this.loadFiles(notes);
                const relays = events.map(event => RelayService_1.default.relaysFromEvent(event));
                accumulateRelays(relays.flat());
            }
        });
    }
    loadFiles(events) {
        return __awaiter(this, void 0, void 0, function* () {
            const files = [];
            for (let event of events) {
                const urls = (0, utils_1.extractUrls)(event.content);
                if (!urls.length)
                    continue;
                for (const url of urls) {
                    const type = (0, utils_1.classifyUrl)(url);
                    if (type != "other") {
                        files.push({
                            url,
                            type,
                            title: event.title,
                            description: "",
                            published_by: event.published_by,
                            published_at: event.published_at,
                            note_id: event.id,
                            pubkey: event.pubkey,
                            tags: event.tags,
                            created_at: new Date(),
                            ref_count: 1
                        });
                    }
                }
            }
            yield this._dbFiles.upsert(files);
        });
    }
    notesFromEvents(events) {
        const notes = [];
        for (const event of events) {
            const tags = (0, utils_1.extractTagsFromContent)(event.content);
            for (const tag of event.tags) {
                if (tag[0] == "t") {
                    tag.forEach((t, i) => {
                        if (i >= 1)
                            tags.push(t);
                    });
                }
                if (tag[0] == "alt") {
                    tags.push(tag[1]);
                }
            }
            notes.push({
                id: event.id,
                kind: event.kind,
                pubkey: event.pubkey,
                title: this.extractTitle(event),
                content: event.content,
                published_by: "",
                published_at: event.created_at,
                tags: (0, utils_1.distinct)(tags).join(", "),
                created_at: new Date(),
                ref_count: 1
            });
        }
        return notes;
    }
    refPubkeys(events) {
        var _a;
        const counts = new Map();
        for (const event of events) {
            for (const tag of event.tags) {
                if (tag[0] !== "p")
                    continue;
                const pubkey = tag[1];
                if (!pubkey || pubkey.length !== 64)
                    continue;
                counts.set(pubkey, ((_a = counts.get(pubkey)) !== null && _a !== void 0 ? _a : 0) + 1);
            }
        }
        return Array.from(counts.entries())
            .map(([pubkey, count]) => ({ pubkey, count }));
    }
    refEvents(events) {
        var _a;
        const counts = new Map();
        for (const event of events) {
            for (const tag of event.tags) {
                if (tag[0] !== "e")
                    continue;
                const id = tag[1];
                if (!id || id.length !== 64)
                    continue;
                counts.set(id, ((_a = counts.get(id)) !== null && _a !== void 0 ? _a : 0) + 1);
            }
        }
        return Array.from(counts.entries())
            .map(([id, count]) => ({ id, count }));
    }
    filesFromEvents(events) {
        const files = [];
        events.forEach(event => {
            let urls = [];
            event.tags.forEach(item => {
                if (item[0] == "imeta") {
                    for (let tag of item) {
                        const pick = tag.split(" ");
                        if (pick[0] == "url")
                            urls.push(pick[0]);
                    }
                }
                if (item[0] == "image")
                    urls.push(item[1]);
            });
        });
        return files;
    }
    extractTitle(event) {
        const pick = (key) => {
            var _a;
            const tag = event.tags.find(t => t[0] === key);
            return (_a = tag === null || tag === void 0 ? void 0 : tag[1]) === null || _a === void 0 ? void 0 : _a.trim();
        };
        // Hierarquia: title -> summary -> subject -> description
        const raw = pick("title") ||
            pick("summary") ||
            pick("subject") ||
            pick("description");
        const limit = raw ? 255 : 100; // 255 para título/tag, 100 para fallback
        let text = raw || event.content.split("\n")[0].trim();
        // Remove markdown básico
        text = text.replace(/[#*_`>]+/g, "").trim();
        if (!text)
            return "(sem título)";
        // Se já couber no limite, retorna direto
        if (text.length <= limit)
            return text;
        // Truncar em limite, sem cortar palavra
        const truncated = text.slice(0, limit);
        const lastSpace = truncated.lastIndexOf(" ");
        return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated).trim() + "…";
    }
}
exports.default = NoteService;
