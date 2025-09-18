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
exports.checkMediaAccessible = exports.extractTagsFromContent = exports.mediaType = exports.extractUrls = exports.npubToHex = exports.getRelayDomain = exports.distinct = exports.distinctFiles = exports.distinctUsers = exports.distinctNotes = exports.distinctEvent = exports.getPubkeys = void 0;
const bech32_1 = require("bech32");
const getPubkeys = (event) => {
    let pubkeys = event.tags.map((tag) => {
        // if not have a value
        if (!!!tag[1])
            return null;
        // if not have a pubkey value
        if (tag[1].length < 64)
            return null;
        if (tag[1].includes(":")) {
            tag[1] = tag[1]
                .substring(tag[1].indexOf(":") + 1, tag[1].lastIndexOf(":"));
        }
        return tag[1];
    });
    return pubkeys.filter((f) => {
        return f != null && (f === null || f === void 0 ? void 0 : f.length) == 64;
    });
};
exports.getPubkeys = getPubkeys;
const distinctEvent = (events) => {
    const seen = new Map();
    for (let event of events) {
        seen.set(event.id, event);
    }
    return Array.from(seen.values());
};
exports.distinctEvent = distinctEvent;
const distinctNotes = (notes) => {
    const seen = new Map();
    for (let note of notes) {
        if (note)
            seen.set(note.id, note);
    }
    return Array.from(seen.values());
};
exports.distinctNotes = distinctNotes;
const distinctUsers = (users) => {
    const seen = new Map();
    for (const user of users) {
        if (user)
            seen.set(user.pubkey, user);
    }
    return Array.from(seen.values());
};
exports.distinctUsers = distinctUsers;
const distinctFiles = (files) => {
    const seen = new Map();
    for (const file of files) {
        if (file)
            seen.set(file.url, file);
    }
    return Array.from(seen.values());
};
exports.distinctFiles = distinctFiles;
const distinct = (pubkeys) => {
    const seen = new Set();
    for (let pubkey of pubkeys)
        seen.add(pubkey);
    return Array.from(seen);
};
exports.distinct = distinct;
const getRelayDomain = (relay) => {
    try {
        if (relay.length >= 75)
            throw new Error("invalid domain size");
        if (!relay.includes("ws://") && !relay.includes("wss://"))
            throw new Error("invalid domain not is wss protocol");
        const url = new URL(relay);
        // invalid domains
        if (!url.hostname.includes(".") || url.hostname.length <= 2)
            throw new Error("invalid domain");
        // not accept ips
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (ipRegex.test(url.hostname))
            throw new Error("invalid domain is an IP");
        let privateIpRegex = /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|127\.)/;
        if (privateIpRegex.test(url.hostname))
            throw new Error("invalid domain is an IP");
        privateIpRegex = /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/;
        if (privateIpRegex.test(url.hostname))
            throw new Error("invalid domain is an IP");
        return `${url.protocol}//${url.hostname}`;
    }
    catch (_a) {
        return null;
    }
};
exports.getRelayDomain = getRelayDomain;
const npubToHex = (npub) => {
    const decoded = bech32_1.bech32.decode(npub);
    const data = bech32_1.bech32.fromWords(decoded.words);
    return Buffer.from(data).toString("hex");
};
exports.npubToHex = npubToHex;
const extractUrls = (content) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return (content.match(urlRegex) || [])
        .map((u) => u.trim());
};
exports.extractUrls = extractUrls;
const mediaType = (url) => {
    const lower = url.toLowerCase();
    if (/\.(jpg|jpeg|png|gif|webp|avif|svg)$/.test(lower))
        return "image";
    if (/\.(mp4|webm|mkv|mov|avi)$/.test(lower))
        return "video";
    if (/\.(mp3|wav|ogg|flac|m4a|aac)$/.test(lower))
        return "audio";
    if (lower.includes("youtube.com") ||
        lower.includes("youtu.be") ||
        lower.includes("vimeo.com") ||
        lower.includes("dailymotion.com") ||
        lower.includes("soundcloud.com") ||
        lower.includes("twitch.tv")) {
        return "iframe";
    }
    return "iframe";
};
exports.mediaType = mediaType;
const extractTagsFromContent = (content) => {
    const regex = /#(\w+)/g;
    const matches = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
        matches.push(match[1].toLowerCase());
    }
    return matches;
};
exports.extractTagsFromContent = extractTagsFromContent;
const checkMediaAccessible = (url) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch(url, { method: "HEAD" }); // HEAD evita baixar todo o conteúdo
        if (!response.ok)
            return false;
        const contentType = response.headers.get("content-type");
        if (!contentType)
            return false;
        if (contentType.startsWith("image/") || contentType.startsWith("video/")) {
            return true;
        }
        if (url.includes("youtube.com/watch") || url.includes("youtu.be/")) {
            return response.status === 200; // só checa se a página existe
        }
        return false;
    }
    catch (err) {
        return false;
    }
});
exports.checkMediaAccessible = checkMediaAccessible;
