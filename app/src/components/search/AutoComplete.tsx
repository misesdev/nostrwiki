'use client'

import { AutocompleteNote, AutocompleteResult, AutocompleteUser, Note, User } from "@/types/types";
import { normalizeNote, normalizeUser } from "@/utils/utils";
import AppImage from "../commons/AppImage";
import { AiOutlineSearch } from "react-icons/ai";
import { useEffect, useState } from "react";
import { textSimilarity } from "@/utils/string";

type AutoCompleteProps = {
    term: string;
    results: AutocompleteResult[];
    onSearch: (t: string) => void;
}

type ResultProps = {
    term: string;
    item: AutocompleteUser | AutocompleteNote;
    onSearch: (t: string) => void;
}

/** Helpers **/
const safeSplitTokens = (text?: string) => {
    if (!text) return [];
    // split por espaços, remover pontuação de borda, manter #/@, decode entities mínimas
    return text
        .replaceAll(/\n/g, " ")
        .split(/\s+/)
        .map(t => t.replaceAll(/^[^\w#@]+|[^\w#@]+$/g, "").trim())
        .map(t => t.replaceAll("#", "").trim())
        .filter(Boolean);
}

const isBadToken = (t: string) => {
    if (!t) return true;
    // tokens muito longos (hashes, urls codificados), npub/nprofile/nevent, nostr:, urls
    if (t.length > 12) return true;
    if (/^(npub|nprofile|nevent)/i.test(t)) return true;
    if (/^nostr:/i.test(t)) return true;
    if (/^https?:\/\//i.test(t)) return true;
    if (/%2F|%2f/.test(t)) return true; // encoded paths often part of long urls
    if (/\.(jpg|jpeg|png|webp|gif|mp4|mov|mkv)$/i.test(t)) return true;
    if (/^[0-9a-f]{20,}$/i.test(t)) return true; // long hex
    return false;
}

/**
 * Gera preview com base na prioridade: title -> content -> tags.
 * Remove tokens longos (npub, urls...) e limita pelo número de palavras (words).
 */
const buildNotePreview = (note: Note, words: number) => {
    const takeTokens = (text?: string) => {
        const tokens = safeSplitTokens(text);
        const filtered = tokens.filter(t => !isBadToken(t) && t.length <= 12);
        return filtered.slice(0, words);
    }
    const titleTokens = takeTokens(note.title);
    if (titleTokens.length)
        return titleTokens.slice(0, words).join(" ");

    const contentTokens = takeTokens(note.content);
    if (contentTokens.length) 
        return contentTokens.slice(0, words).join(" ");

    if (note.tags) {
        let tagsArr: string[] = [];
        if (Array.isArray(note.tags)) tagsArr = note.tags;
        else if (typeof note.tags === "string") tagsArr = note.tags.split(/[,;\s]+/);
        const goodTags = tagsArr.map(t => t.replace(/^[^\w#@]+|[^\w#@]+$/g, "")).filter(Boolean).slice(0, Math.max(1, Math.min(3, words)));
        if (goodTags.length)
            return goodTags.slice(0, words).map(t => t.replaceAll("#", "")).join(" ");
    }
    if (note.content) {
        const plain = note.content.replace(/https?:\/\/\S+/g, "").trim();
        if (plain.length > 0) {
            return plain.split(/\s+/).slice(0, words).join(" ");
        }
    }
    return null;
}

const UserResult = ({ item, onSearch }: ResultProps) => {
    const user: User = normalizeUser(item as any);
    return (
        <div
            className="flex items-center gap-3 p-3 hover:bg-gray-700 cursor-pointer"
            onClick={() => onSearch(user.display_name || user.name)}
        >
            <AppImage
                width={100}
                height={100}
                src={user.picture}
                alt={user.display_name || user.name}
                className="w-10 h-10 rounded-full border border-gray-700"
                onError="/default-avatar.png"
            />
            <div className="flex flex-col min-w-0">
                <span className="text-gray-200 font-medium truncate">
                    {user.display_name ?? user.name}
                </span>
                {user.about && (
                    <span className="text-gray-400 text-sm truncate max-w-xs">
                        {user.about}
                    </span>
                )}
            </div>
        </div>
    );
}

const NoteResult = ({ item, onSearch }: ResultProps) => {
    const note: Note = normalizeNote(item as any);

    return (
        <div
            className="flex items-start gap-2 p-3 hover:bg-gray-700 cursor-pointer"
            onClick={() => onSearch(note.title)}
        >
            <AiOutlineSearch className="text-sm my-1 mx-2 text-gray-500" />
            <div className="min-w-0">
                <div className="text-gray-200 text-sm truncate">
                    {note.title}
                </div>
                {/* uma linha pequena com origem/autor se existir */}
                {note.published_by && (
                    <div className="text-xs text-gray-400 mt-1 truncate">
                        {note.published_by}
                    </div>
                )}
            </div>
        </div>
    );
}

const AutoComplete = ({ term, results, onSearch }: AutoCompleteProps) => {

    const [items, setItems] = useState<AutocompleteResult[]>([])

    useEffect(() => {
        const load = () => {
            const uniqueResults = new Map<string, AutocompleteResult>()
            results.forEach(item => {
                if(item.type == "note") {
                    const note: Note = normalizeNote(item as any);
                    const words = term.split(" ").length + 1;
                    const preview = buildNotePreview(note, words);
                    if (preview) { 
                        let exits = false;
                        uniqueResults.forEach(value => {
                            const similarity = textSimilarity((value as AutocompleteNote).title, preview)
                            if(similarity >= 0.75) exits = true
                        })
                        if(!exits)
                            uniqueResults.set(preview, {...item, title: preview })
                    }
                } else if(item.type == "user") {
                    const user: User = normalizeUser(item as any);
                    uniqueResults.set(user.display_name, item) 
                }
            })
            setItems(Array.from(uniqueResults.values()))
        }
        load()        
    }, [results])

    return (
        <div className="text-[12px] md:text-sm w-full bg-gray-800 bg-opacity-15 mt-5 rounded-b-lg overflow-y-auto max-h-80 sm:max-h-64 z-50 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            {items.map((item, key) => {
                if(item.type == "user")
                    return <UserResult key={key} term={term} item={item} onSearch={onSearch} />
                else
                    return <NoteResult key={key} term={term} item={item} onSearch={onSearch} />
            })}
        </div>
    )
}

export default AutoComplete

