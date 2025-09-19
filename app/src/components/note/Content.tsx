
'use client'

import { useCallback, useEffect, useRef, useState } from "react"
import { User } from "@/types/types"
import AppImage from "../commons/AppImage"
import SearchService from "@/services/api/SearchService"
import { parseContent, Token } from "@konemono/nostr-content-parser"
import { npubToHex, nprofileToPubkey, neventToId } from "@/utils/utils"
import MarkdownContent from "./MarkDownContent"

type Props = {
    content: string;
    cliped?: boolean;
}

const Content = ({ content, cliped = false }: Props) => {
    const [profiles, setProfiles] = useState<Record<string, User | null>>({})
    const [events, setEvents] = useState<Record<string, any>>({})
    const videoRefs = useRef<HTMLVideoElement[]>([])
    const tokens: Token[] = parseContent((content))

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
    }, [content])

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
        // Texto normal
        if (token.type === "text") {
            const clip = token.content.split(" ").slice(0, 38).join(" ")
            const content = cliped ? `${clip.replaceAll("nostr:", "")}...` : 
                token.content.replaceAll("nostr:", "")
            return (
                <MarkdownContent key={i} content={content} />
            )
        }
        // Hashtags
        if (token.type === "hashtag") {
            return (
                <strong
                    key={i}
                    className="text-purple-400 hover:underline cursor-pointer mr-1"
                >
                    #{token.content}
                </strong>
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
                    className="text-blue-400 cursor-pointer hover:underline mr-1"
                    onClick={() => {
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
                    className="text-blue-500 underline hover:opacity-80"
                    onClick={() => {
                        // TODO: abrir modal da nota
                        console.log("Abrir modal note:", note)
                    }}
                >
                    {note?.title || token.content.slice(0, 12) + "…"}
                </span>
            )
        }

        // Links / media
        if (token.type === "url") {
            if (token?.metadata?.type === "image") {
                if(cliped) return null
                return (
                    <AppImage
                        key={i}
                        width={600}
                        height={600}
                        src={token.content}
                        onError="hidden"
                        alt="image"
                        className="max-w-[100%] max-h-[90vh] my-2 rounded-xl"
                    />
                )
            }
            if (token?.metadata?.type === "video") {
                if(cliped) return null
                return (
                    <video
                        key={i}
                        loop
                        src={token.content}
                        controls
                        ref={el => { if (el) videoRefs.current[i] = el }}
                        className="w-full h-auto max-w-[100%] max-h-[90vh] rounded-xl bg-gray-900 bg-opacity-35 my-2"
                    />
                )
            }
            return (
                <MarkdownContent key={i} content={token.content} />
            )
        }

        return null
    }

    return (
        <div className="prose dark:prose-invert max-w-none leading-relaxed">
            {tokens.map(renderToken)}
        </div>
    )
}

export default Content
