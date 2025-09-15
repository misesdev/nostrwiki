import { bech32 } from "bech32";
import { NostrEvent } from "./modules/types/NostrEvent";
import { User } from "./modules/types/User";

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
    return events.filter((event, index, self) => {
        return index == self.findIndex(x => x.id == event.id)
    })
}

export const distinctUsers = (users: User[]): User[] => {
    const seen = new Map<string, User>();
    for (const user of users) {
        seen.set(user.pubkey, user);
    }
    return Array.from(seen.values());
}

export const distinct = (pubkeys: string[]) => {
    return pubkeys.filter((pubkey, index, self) => {
        return index == self.indexOf(pubkey)
    })
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
    return (content.match(urlRegex) || [])
        .map((u: string) => u.trim());
}

export const classifyUrl = (url: string): "image" | "video" | "audio" | "other" => {
    const lower = url.toLowerCase();
    if (/\.(jpg|jpeg|png|gif|webp|avif|svg)$/.test(lower)) return "image";
    if (/\.(mp4|webm|mkv|mov|avi)$/.test(lower)) return "video";
    if (/\.(mp3|wav|ogg|flac|m4a|aac)$/.test(lower)) return "audio";
    return "other";
}

export const extractTagsFromContent = (content: string): string[] => {
    const regex = /#(\w+)/g; 
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
        matches.push(match[1].toLowerCase()); 
    }
    return matches;
}

