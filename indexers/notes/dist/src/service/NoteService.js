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
const DBFiles_1 = __importDefault(require("./database/DBFiles"));
const DBNotes_1 = __importDefault(require("./database/DBNotes"));
const DBUsers_1 = __importDefault(require("./database/DBUsers"));
const RelayService_1 = __importDefault(require("./RelayService"));
const pLimit = require("p-limit");
class NoteService {
    constructor(settings, dbNotes = new DBNotes_1.default(), dbFiles = new DBFiles_1.default(), dbUsers = new DBUsers_1.default()) {
        this._settings = settings;
        this._dbNotes = dbNotes;
        this._dbFiles = dbFiles;
        this._dbUsers = dbUsers;
    }
    loadNotes(_a) {
        return __awaiter(this, arguments, void 0, function* ({ pool, users, accumulateRelays }) {
            if (!users.length)
                return;
            let skipe = this._settings.pubkeys_per_notes;
            let oldestSince = undefined;
            const allHaveSince = users.every(user => user.since !== null);
            if (allHaveSince)
                oldestSince = users
                    .map(user => user.since)
                    .filter((s) => s !== null && s !== undefined)
                    .reduce((min, s) => Math.min(min, s), Number.MAX_SAFE_INTEGER);
            console.log(`loading notes...`);
            for (let i = 0; i < users.length; i += skipe) {
                const authors = users.slice(i, i + skipe);
                let events = yield pool.fechEvents({
                    authors: authors.map(u => u.pubkey),
                    limit: this._settings.max_fetch_notes,
                    kinds: [1, 30023, 30818],
                    since: oldestSince
                });
                console.log("found notes...:", events.length);
                // indexing notes
                const notes = this.notesFromEvents(events, authors);
                console.log("saving", notes.length, "notes and indexing on elastic search");
                yield this._dbNotes.upsert(notes);
                // indexing user references
                const pubkeyRefs = this.refPubkeys(events);
                console.log("update", pubkeyRefs.length, "pubkey references");
                yield this._dbUsers.upRefs(pubkeyRefs);
                // indexing references
                const eventRefs = this.refEvents(events);
                console.log("update", eventRefs.length, "notes references");
                yield this._dbNotes.upRefs(eventRefs);
                // indexing files
                const metaUrls = this.urlsFromEvents(events);
                yield this.loadFiles(notes, metaUrls);
                const relays = events.map(event => RelayService_1.default.relaysFromEvent(event));
                accumulateRelays(relays.flat());
            }
        });
    }
    notesFromEvents(events, authors) {
        var _a;
        const notes = new Map();
        for (const event of events) {
            // nao indexar notas muito curtas sem links
            if (!this.isIndexable(event))
                continue;
            let tags = (0, utils_1.extractTagsFromContent)(event.content);
            for (const tag of event.tags) {
                if (tag[0] == "t") {
                    tag.forEach((t, i) => {
                        if (i >= 1)
                            tags.push(t);
                    });
                }
                if (tag[0] == "alt")
                    tags.push(tag[1]);
            }
            if (!tags.length) {
                tags = event.content.split(" ")
                    .filter(l => l.length <= 12)
                    .slice(0, 6);
            }
            const author = authors.find(u => u.pubkey == event.pubkey);
            notes.set(event.id, {
                id: event.id,
                kind: event.kind,
                pubkey: event.pubkey,
                title: this.extractTitle(event).substring(0, 255),
                content: event.content,
                published_by: (_a = ((author === null || author === void 0 ? void 0 : author.display_name) || (author === null || author === void 0 ? void 0 : author.name))) === null || _a === void 0 ? void 0 : _a.substring(0, 100),
                published_at: event.created_at,
                tags: (0, utils_1.distinct)(tags).slice(0, 10).join(" "),
                created_at: new Date(),
                ref_count: 1
            });
        }
        return Array.from(notes.values());
    }
    loadFiles(events, metaUrls) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const files = new Map();
            for (let event of events) {
                const links = metaUrls
                    .filter(l => l.id == event.id && !!(l === null || l === void 0 ? void 0 : l.link)).map(l => l.link);
                links.push(...(0, utils_1.extractUrls)(event.content));
                if (!links.length)
                    continue;
                for (const url of links) {
                    if (!url)
                        continue;
                    const type = (0, utils_1.mediaType)(url);
                    if (type != "iframe") {
                        const description = event.content
                            .split(" ").filter(t => t.length <= 15).slice(0, 25).join(" ");
                        files.set(url, {
                            url,
                            type,
                            note_id: event.id,
                            title: event.title.substring(0, 255),
                            description: description,
                            published_by: (_a = event.published_by) === null || _a === void 0 ? void 0 : _a.substring(0, 100),
                            published_at: event.published_at,
                            pubkey: event.pubkey,
                            tags: (_b = event.tags) === null || _b === void 0 ? void 0 : _b.substring(0, 512),
                            created_at: new Date(),
                            ref_count: 1
                        });
                    }
                }
            }
            let betch = 100;
            const limit = pLimit(15);
            const validFiles = [];
            const uniqueFiles = Array.from(files.values());
            console.log("validating files...:", uniqueFiles.length);
            for (let i = 0; i < uniqueFiles.length; i += betch) {
                const betchFiles = uniqueFiles.slice(i, i + betch);
                const results = yield Promise.all(betchFiles.map((file) => __awaiter(this, void 0, void 0, function* () {
                    return limit(() => __awaiter(this, void 0, void 0, function* () {
                        const valid = yield (0, utils_1.checkMediaAccessible)(file.url);
                        if (valid)
                            return file;
                        return null;
                    }));
                })));
                const allFiles = results.flat().filter((f) => !!(f === null || f === void 0 ? void 0 : f.url));
                console.log("valid files...:", allFiles.length);
                validFiles.push(...allFiles);
            }
            if (validFiles.length) {
                console.log("saving", validFiles.length, "files from notes");
                yield this._dbFiles.upsert(validFiles);
            }
        });
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
    urlsFromEvents(events) {
        let urls = new Map();
        events.forEach(event => {
            event.tags.forEach(item => {
                if (item[0] == "imeta") {
                    for (let tag of item) {
                        const pick = tag.split(" ");
                        if (pick[0] == "url")
                            urls.set(pick[1], { link: pick[1], id: event.id });
                    }
                }
                if (item[0] == "image")
                    urls.set(item[1], { link: item[1], id: event.id });
            });
        });
        return Array.from(urls.values())
            .filter(link => !!(link === null || link === void 0 ? void 0 : link.link));
    }
    isIndexable(event) {
        const MIN_CONTENT_LENGTH = 50;
        // Sempre indexar se tiver links de arquivos/media
        const hasFile = (/https?:\/\/\S+\.(jpg|jpeg|png|gif|mp4|webm|pdf|mp3|ogg|wav)/i.test(event.content) ||
            !!this.urlsFromEvents([event]).length);
        // Ignorar se for comentário/reply (tags tipo "e" indicam referências a outros eventos)
        const isReply = event.tags.some(t => t[0] === "e");
        // Conteúdo muito curto sem arquivos não vale a pena indexar
        const isTooShort = event.content.trim().length < MIN_CONTENT_LENGTH;
        // Filtro de conteúdo vazio ou só links de npub/nprofile/note/nevent/naddr
        const cleaned = event.content
            .replace(/\b(npub|nprofile|note|nevent|naddr)1[0-9a-z]{50,}\b/g, "")
            .replace(/\s+/g, " ")
            .trim();
        const isEmptyAfterClean = cleaned.length === 0;
        // Decisão final
        return !isReply && (hasFile || (!isTooShort && !isEmptyAfterClean));
    }
    extractTitle(event) {
        const pickTag = (key) => {
            var _a;
            const tag = event.tags.find(t => t[0] === key);
            return (_a = tag === null || tag === void 0 ? void 0 : tag[1]) === null || _a === void 0 ? void 0 : _a.trim();
        };
        // Hierarquia: title -> summary -> subject -> description
        let raw = pickTag("title") ||
            pickTag("summary") ||
            pickTag("subject") ||
            pickTag("description") ||
            event.content.split("\n")[0].trim();
        // Se ainda estiver vazio, usar tags curtas como fallback
        if (!raw) {
            const shortTag = event.tags
                .map(t => t[1])
                .filter(Boolean)
                .find(t => t.length <= 25); // tags curtas
            raw = shortTag || "";
        }
        // Remove markdown, links, npub/nprofile/mentions
        let text = raw
            .replace(/`{1,3}[^`]*`{1,3}/g, "") // inline code/block code
            .replace(/!\[.*?\]\(.*?\)/g, "") // images
            .replace(/\[.*?\]\(.*?\)/g, "") // links
            .replace(/[#*_>~]+/g, "") // outros markdown
            .replace(/\b(npub|nprofile|note|nevent|naddr)1[0-9a-z]{50,}\b/g, "") // Nostr refs
            .replace(/@\w+/g, "") // mentions simples
            .replace(/\s+/g, " ") // múltiplos espaços
            .trim();
        if (!text)
            return "(without title)";
        // Pegar apenas até o primeiro ponto relevante dentro das primeiras 10–15 palavras
        let truncatedWords = text.split(" ").slice(0, 12);
        // Procurar ponto que não faça parte de abreviações
        for (let i = 0; i < truncatedWords.length; i++) {
            const w = truncatedWords[i];
            if (/\.$/.test(w) && !/\d+\.$/.test(w) && !/\w+\-\d+\.$/.test(w)) {
                truncatedWords = truncatedWords.slice(0, i + 1);
                break;
            }
        }
        const finalText = truncatedWords.join(" ").trim();
        return finalText.split(" ").slice(0, 15).join(" ");
    }
}
exports.default = NoteService;
