'use client'

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react"
import { Note, User } from "@/types/types"
import SearchService from "@/services/api/SearchService"
import { parseContent, Token } from "@konemono/nostr-content-parser"
import { npubToHex, nprofileToPubkey, neventToId } from "@/utils/utils"
import MarkdownContent from "./MarkDownContent"
import UserModal from "../user/UserModal"
import { hashtagsFromContent, stripMarkdownLinks } from "@/utils/contents"
import LinkPreview from "../commons/LinkPreview"
import AppImage from "../commons/AppImage";

type Props = {
    note: Note;
    cliped?: boolean;
}

const NoteContent = ({ note, cliped=false }: Props) => {
    let filesCount = 0
    const [profiles, setProfiles] = useState<Record<string, User | null>>({})
    const [events, setEvents] = useState<Record<string, any>>({})
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [isUserOpen, setIsUserOpen] = useState(false)
    const videoRefs = useRef<HTMLVideoElement[]>([])

    const text = stripMarkdownLinks(note.content)
    const tags = hashtagsFromContent(note.content)
    const tokens: Token[] = parseContent(text, tags.map(t => ["t", t]))

    useEffect(() => {
        const fetchProfiles = async () => {
            const service = new SearchService()
            const profileResults: Record<string, User | null> = {}
            const eventResults: Record<string, any> = {}

            for (const token of tokens) {
                try {
                    if (token.type === "nip19" && token.content.includes("npub1")) {
                        const pubkey = npubToHex(token.content.replace("nostr:", ""))
                        profileResults[token.content] = await service.profile(pubkey)
                    } else if (token.type === "nip19" && token.content.includes("nprofile1")) {
                        const pubkey = nprofileToPubkey(token.content.replace("nostr:", ""))
                        profileResults[token.content] = await service.profile(pubkey)
                    } else if (token.type === "nip19" && token.content.includes("nevent1")) {
                        const eventId = neventToId(token.content.replace("nostr:", ""))
                        const note = await service.note(eventId)
                        eventResults[token.content] = note
                    }
                } catch {
                    profileResults[token.content] = null
                }
            }

            setProfiles(profileResults)
            setEvents(eventResults)
        }

        fetchProfiles()
    }, [note])

    // Pausar vídeos que saem da tela
    const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
        entries.forEach(entry => {
            const video = entry.target as HTMLVideoElement
            if (!entry.isIntersecting) {
                video.pause()
            }
        })
    }, [])

    useEffect(() => {
        const observer = new IntersectionObserver(handleIntersection, { threshold: 0.25 })
        videoRefs.current.forEach(v => observer.observe(v))
        return () => observer.disconnect()
    }, [tokens, handleIntersection])

    const renderToken = (token: Token, i: number) => {
        if (token.type === "text") {
            const clip = token.content
                .split(" ").slice(0, 65).join(" ")
            const content = cliped ? `${clip}...` : token.content
            return (
                <div className="prose dark:prose-invert max-w-none leading-relaxed break-words">
                    <MarkdownContent content={content.replaceAll("nostr:", "")} />
                </div>           
            )
        }
        if (token.type === "hashtag") {
            return (
                <span
                  key={i}
                  className="text-[12px] md:text-sm text-purple-400 hover:underline cursor-pointer mx-1 whitespace-nowrap break-normal"
                >
                    {token.content}
                </span>
            )
        }

        if (token.type === "nip19" &&
            (token.content.includes("npub1") || 
             token.content.includes("nprofile1"))) {
            const profile = profiles[token.content]
            const display = profile?.display_name || profile?.name || token.content.slice(0, 12) + "…"
            return (
                <span
                    key={i}
                    className="text-[12px] md:text-sm text-blue-400 cursor-pointer hover:underline mx-1 break-all"
                    onClick={() => {
                        if (profile) {
                          setSelectedUser(profile)
                          setIsUserOpen(true)
                        }
                    }}
                >
                    @{display}
                </span>
            )
        }

        // Events (nevent)
        if (token.type === "nip19" && token.content.startsWith("nevent1")) {
            const note = events[token.content]
            return (
                <span
                    key={i}
                    className="text-blue-500 underline hover:opacity-80 break-all"
                >
                    {note?.title || token.content.slice(0, 12) + "…"}
                </span>
            )
        }
        if(token.type == "relay") {
            const website = token.content
                .replace("wss", "https").replace("ws", "http")
            return (
                <Link
                    href={website}
                    className="mx-2 text-blue-400 hover:underline break-all"
                    target="_blank"
                    rel="noopener noreferrer"
                >{token.content}</Link>
            )
        }
        // Links / media
        if (token.type === "url") {
            if (token?.metadata?.type === "image") {
                if(cliped && filesCount > 0) return null;
                filesCount = filesCount + 1
                return (
                    <div className="w-full my-2 flex justify-center">
                        <img
                            key={i}
                            src={token.content}
                            onError={e => e.currentTarget.src = "/default-banner.jpg"}
                            className="rounded-xl object-contain"
                            alt="image"
                        />
                    </div>
                )
            }
            if (token?.metadata?.type === "video") {
                if(cliped && filesCount > 0) return null;
                filesCount = filesCount + 1
                return (
                    <div className="w-full my-2 flex justify-center">
                        <video
                            key={i}
                            loop
                            src={token.content}
                            controls
                            ref={el => { if (el) videoRefs.current[i] = el }}
                            className="w-full h-auto max-w-full max-h-[90vh] rounded-xl bg-gray-900 bg-opacity-35 my-2"
                        />
                    </div>
                )
            }
               
            return (
                <div key={i} className="flex w-full my-2">
                    <LinkPreview link={token.content} />
                </div>
            )
        }

        return null
    }

    return (
        <>
            <div className="max-w-none leading-relaxed break-words flex flex-wrap items-center">
                {tokens.map(renderToken)}
            </div>
            {selectedUser && isUserOpen && (
                <UserModal
                  user={selectedUser}
                  isOpen={isUserOpen}
                  onClose={() => setIsUserOpen(false)}
                />
            )}
        </>
    )
}

export default NoteContent
