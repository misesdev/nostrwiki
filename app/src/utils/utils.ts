import { NFile, Note, Relay, User } from "@/types/types"
import { bech32 } from "bech32"
import { nip19 } from "nostr-tools"
import { DecodedNprofile } from "nostr-tools/lib/types/nip19"

export type Hex = Uint8Array | string | number[]

export function bytesToHex(bytes: Hex): string {

    if (bytes.length <= 0)
    throw new Error("The byte array is empty!")
    if(typeof(bytes) == "string")
    throw new Error("Expected the type Uint8Array")

    let hexValue: string = ""

    bytes.forEach(byte => {
        let hexNumber = byte.toString(16)
        if (hexNumber.length == 1)
        hexNumber = "0" + hexNumber

        hexValue += hexNumber
    })

    return hexValue
}

export function hexToBytes(hex: string, hexadecimal: boolean = true): Uint8Array {
    if (!!!hex)
    throw new Error("hex is undefined or empty!")
    if (hexadecimal && hex.length % 2 !== 0)
    throw new Error("Invalid hex value!")

    let bytes = new Uint8Array(hexadecimal ? hex.length / 2 : hex.length)

    for (let i = 0; i <= hex.length; i += hexadecimal ? 2 : 1)
    if (hexadecimal)
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
    else
    bytes[i] = hex.charCodeAt(i)

    return bytes;
}

export const validatePubkey = (pubkey: string) => {
    try 
{
        let npub = bech32.decode(pubkey)

        let data = bech32.fromWords(npub.words)

        let hexpub = Buffer.from(data).toString('hex')

        return hexpub

    } catch { return '' }
}

export const hexToNpub = (hex: string) => {

    const bytes = hexToBytes(hex)

    const words = bech32.toWords(bytes)

    return bech32.encode('npub', words)
}

export const getClipedContent = (content: string, limit: number=50): string => {
    if(!content) return ""
    if(content.length > limit)
    return `${content.substring(0,limit)}...`
    return content
}

export const normalizeUser = (user: User): User => {
    if(!isValidImageUrl(user.picture))
    user.picture = "/default-avatar.png"
    if(!isValidImageUrl(user.banner))
    user.banner = "/default-banner.jpg"
    user.about = !!user.about?.trim() ? user.about : "User not have a description"
    user.display_name = getClipedContent(user.display_name || user.name, 25)
    user.name = getClipedContent(user.name || user.display_name, 25)
    return user
}

export const normalizeRelay = (relay: Relay): Relay => {
    if(!isValidImageUrl(relay.icon))
    relay.icon = "/default-icon.jpg"
    if(relay.author)
    relay.author = normalizeUser(relay.author)
    relay.name = getClipedContent(relay.name || relay.url, 25)
    return relay
}

export const normalizeNote = (note: Note): Note => {
    if(note.author)
    note.author = normalizeUser(note.author)
    return note
}

export const normalizeFile = (image: NFile): NFile => {
    if(image.author)
    image.author = normalizeUser(image.author)
    return image
}

function isValidImageUrl(url?: string): boolean {
    if (!url) return false;
    const VALID_IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".svg", ".avif"];
    try {
        const parsed = new URL(url);
        // precisa ser http ou https
        if (!["http:", "https:"].includes(parsed.protocol)) return false;

        // verificar extensão no final do pathname
        const lower = parsed.pathname.toLowerCase();
        return VALID_IMAGE_EXT.some(ext => lower.endsWith(ext));
    } catch {
        return false;
    }
}

export const getLanguage = () => {
    if (typeof navigator === "undefined") 
    return "english";

    const lang = (navigator.language || navigator.languages[0] || "en").toLowerCase()

    const shortLang = lang.toLowerCase().split("-")[0]

    switch (shortLang) {
        case "pt":
            return "portuguese";
        case "en":
        default:
            return "english";
    }
}

/**
 * Converte npub1… para hex (pubkey)
 */
export const npubToHex = (npub: string): string => {
    try {
        const { data } = nip19.decode(npub)
        return data as string
    } catch (err) {
        console.error("Error whn decoding npub:", err);
        return npub;
    }
}

export const nprofileToPubkey = (nprofile: string): string => {
    try {
        const { data } = nip19.decode(nprofile) as DecodedNprofile
        return data.pubkey as string
    } catch (err) {
        console.error("Error whn decoding nprofile:", err);
        return nprofile;
    }
}

/**
 * Converte nevent1… para event id (hex)
 */
export const neventToId = (nevent: string): string => {
    try {
        const { data } = nip19.decode(nevent)
        return data as string
    } catch (err) {
        console.error("Error whn decoding nevent:", err);
        return nevent;
    }
}

/**
 * Detecta se um link é imagem, vídeo ou link normal
 */
export const getMediaType = (url: string): "image" | "video" | "link" => {
    const imageExt = /\.(jpeg|jpg|png|gif|webp|avif)$/i
    const videoExt = /\.(mp4|webm|ogg|mov)$/i

    if (imageExt.test(url)) return "image"
    if (videoExt.test(url)) return "video"
    return "link"
}

export const downloadFile = (url: string, filename?: string) => {
    const link = document.createElement('a');
    link.href = url;

    // Se não passar um filename, extrai do final da URL
    link.download = filename || url.split('/').pop() || 'file';

    // Dispara o download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

function toHex(bytes: Uint8Array|number[]): string {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}
