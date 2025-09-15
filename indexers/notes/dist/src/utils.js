"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTagsFromContent = exports.classifyUrl = exports.extractUrls = exports.npubToHex = exports.getRelayDomain = exports.distinct = exports.distinctUsers = exports.distinctEvent = exports.getPubkeys = void 0;
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
    return events.filter((event, index, self) => {
        return index == self.findIndex(x => x.id == event.id);
    });
};
exports.distinctEvent = distinctEvent;
const distinctUsers = (users) => {
    const seen = new Map();
    for (const user of users) {
        seen.set(user.pubkey, user);
    }
    return Array.from(seen.values());
};
exports.distinctUsers = distinctUsers;
const distinct = (pubkeys) => {
    return pubkeys.filter((pubkey, index, self) => {
        return index == self.indexOf(pubkey);
    });
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
const classifyUrl = (url) => {
    const lower = url.toLowerCase();
    if (/\.(jpg|jpeg|png|gif|webp|avif|svg)$/.test(lower))
        return "image";
    if (/\.(mp4|webm|mkv|mov|avi)$/.test(lower))
        return "video";
    if (/\.(mp3|wav|ogg|flac|m4a|aac)$/.test(lower))
        return "audio";
    return "other";
};
exports.classifyUrl = classifyUrl;
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
