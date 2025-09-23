import { bech32 } from "bech32";
import { NostrEvent } from "./modules/types/NostrEvent";
import { User } from "./modules/types/User";
import { Note } from "./modules/types/Note";
import { NFile } from "./modules/types/File";
import axios from "axios"

export const getPubkeys = (event: NostrEvent): string[] => {
    let pubkeys = event.tags.map((tag: any) => { 
        // if not have a value
        if(!!!tag[1]) return null;
        // if not have a pubkey value
        if(tag[1].length < 64) return null;
        if(tag[1].includes(":")) {
            tag[1] = tag[1]
                .substring(tag[1].indexOf(":") + 1, 
                    tag[1].lastIndexOf(":"))
        } 
        return tag[1];
    });
    return pubkeys.filter((f: string) => {
        return f != null && f?.length == 64
    })
}

export const distinctEvent = (events: NostrEvent[]) => {
    const seen = new Map<string, NostrEvent>();
    for(let event of events) {
        seen.set(event.id, event)
    }
    return Array.from(seen.values());
}

export const distinctNotes = (notes: Note[]) => {
    const seen = new Map<string, Note>();
    for(let note of notes) {
        if(note)
        seen.set(note.id, note)
    }
    return Array.from(seen.values());
}

export const distinctUsers = (users: User[]): User[] => {
    const seen = new Map<string, User>();
    for (const user of users) {
        if(user)
        seen.set(user.pubkey, user);
    }
    return Array.from(seen.values());
}

export const distinctFiles = (files: NFile[]): NFile[] => {
    const seen = new Map<string, NFile>();
    for (const file of files) {
        if(file)
        seen.set(file.url, file);
    }
    return Array.from(seen.values());
}

export const distinct = (pubkeys: string[]) => {
    const seen = new Set<string>()
    for(let pubkey of pubkeys)
    seen.add(pubkey)
    return Array.from(seen)
}

export const getRelayDomain = (relay: string) => {
    try 
{
        if(relay.length >= 75)
        throw new Error("invalid domain size")
        if(!relay.includes("ws://") && !relay.includes("wss://"))
        throw new Error("invalid domain not is wss protocol")

        const url = new URL(relay)
        // invalid domains
        if(!url.hostname.includes(".") || url.hostname.length <= 2)
        throw new Error("invalid domain")
        // not accept ips
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (ipRegex.test(url.hostname))
        throw new Error("invalid domain is an IP")

        let privateIpRegex = /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|127\.)/;
        if (privateIpRegex.test(url.hostname))
        throw new Error("invalid domain is an IP")

        privateIpRegex = /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/;
        if (privateIpRegex.test(url.hostname))
        throw new Error("invalid domain is an IP")

        return `${url.protocol}//${url.hostname}`
    } catch {
        return null
    }
}

export const npubToHex = (npub: string): string => {
    const decoded = bech32.decode(npub);
    const data = bech32.fromWords(decoded.words);
    return Buffer.from(data).toString("hex");
}

export const extractUrls = (content: string): string[] => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = (content.match(urlRegex) || [])
    .map((u: string) => u.trim());
    return distinct(urls)
}

export const mediaType = (url: string): "image" | "video" | "audio" | "iframe" => {
    const lower = url.toLowerCase();
    if (/\.(jpg|jpeg|png|gif|webp|avif|svg)$/.test(lower)) return "image";
    if (/\.(mp4|webm|mkv|mov|avi)$/.test(lower)) return "video";
    if (/\.(mp3|wav|ogg|flac|m4a|aac)$/.test(lower)) return "audio";
    if (
        lower.includes("youtube.com") ||
            lower.includes("youtu.be") ||
            lower.includes("vimeo.com") ||
            lower.includes("dailymotion.com") ||
            lower.includes("soundcloud.com") ||
            lower.includes("twitch.tv")
    ) {
        return "iframe";
    }

    return "iframe";
}

export const extractTagsFromContent = (content: string): string[] => {
    // Regex: Search for a #word that:
    // - is NOT at the beginning of the line followed by a space (# Heading)
    // - is NOT ## or ### (Markdown headings)
    // - We allow letters, numbers, underscores, and hyphens in the hashtag
    const regex = /(^|\s)#(?!#)([a-zA-Z0-9_-]+)/g;
    const matches: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
        matches.push(match[2].toLowerCase());
    }

    return matches;
}

export const checkMediaAccessible = async (url: string): Promise<boolean> => {
    try
    {
        const { headers } = await axios.head(url, { timeout: 2500 })
        
        if(!headers) return false;
        
        const contentType = headers["content-type"]
        if (!contentType) return false;

        const types = ["image", "video"]
        if (types.some(t => contentType.includes(t))) 
            return true;
        
        return false;
    } catch {
        return false;
    }
}

