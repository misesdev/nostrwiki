'use client'

import { useEffect, useState } from "react"
import { User } from "@/types/types"
import { npubToHex, nprofileToPubkey, neventToId, getMediaType } from "@/utils/utils"
import AppImage from "../commons/AppImage"
import SearchService from "@/services/api/SearchService"
import { parseContent } from "@konemono/nostr-content-parser"

type Props = { 
    content: string;
    rows?: number;
}

const TOKEN_REGEX = /(npub1[0-9a-z]+|nprofile1[0-9a-z]+|nevent1[0-9a-z]+|https?:\/\/[^\s]+)/g

const NoteContent = ({ content, rows }: Props) => {
    const [profiles, setProfiles] = useState<Record<string, User | null>>({})
    const [events, setEvents] = useState<Record<string, any>>({})

    useEffect(() => {
        const matches = content.match(TOKEN_REGEX) || []

        const fetchProfiles = async () => {
            const service = new SearchService()
            const profileResults: Record<string, User | null> = {}
            const eventResults: Record<string, any> = {}
            
            for (const token of matches) {
                try {
                    if (token.startsWith("npub1")) {
                        const pubkey = npubToHex(token)
                        const user = await service.profile(pubkey)
                        profileResults[token] = user 
                    } else if (token.startsWith("nprofile1")) {
                        const pubkey = nprofileToPubkey(token)
                        const user = await service.profile(pubkey)
                        profileResults[token] = user 
                    } else if (token.startsWith("nevent1")) {
                        const eventId = neventToId(token)
                        const res = await fetch(`/api/notes/${eventId}`)
                        eventResults[token] = res.ok ? await res.json() : null
                    }
                } catch {
                    profileResults[token] = null
                }
            }

            setProfiles(profileResults)
            setEvents(eventResults)
        }

        fetchProfiles()
    }, [content])

    const tokens = content.split(TOKEN_REGEX).filter(Boolean)

    return (
        <div className="prose dark:prose-invert max-w-none leading-relaxed">
            {tokens.map((token, i) => {
                // Usuário
                if (token.startsWith("npub1") || token.startsWith("nprofile1")) {
                    const profile = profiles[token]
                    return (
                        <span
                            key={i}
                            className="inline-flex m-2 p-0 items-center gap-1 px-2 py-0.5 text-sm cursor-pointer"
                        >
                            {profile?.picture && (
                                <AppImage
                                    width={100}
                                    height={100}
                                    src={profile.picture}
                                    onError="/default-avatar.png"
                                    alt={profile.display_name || profile.name}
                                    className="w-4 h-4 rounded-full object-cover"
                                />
                            )}
                            <span>{profile?.display_name || profile?.name || token}</span>
                        </span>
                    )
                }

                // Evento / nota
                if (token.startsWith("nevent")) {
                    const note = events[token]
                    return (
                        <span
                            key={i}
                            className="text-blue-600 dark:text-blue-400 underline cursor-pointer"
                        >
                            {note?.title || token}
                        </span>
                    )
                }

                // Links / mídia
                if (token.startsWith("http")) {
                    const type = getMediaType(token)

                    if (type === "image") {
                        return (
                            <AppImage
                                key={i}
                                width={600}
                                height={600}
                                src={token}
                                onError="/default-banner.jpg"
                                alt="image"
                                className="max-w-[100%] max-h-[90vh] my-2 rounded-xl"
                            />
                        )
                    }

                    if (type === "video") {
                        return (
                            <video
                                key={i}
                                loop
                                src={token}
                                controls
                                className="w-full h-auto max-w-[100%] max-h-[90vh] rounded-xl bg-gray-900 bg-opacity-35"
                            >
                                Your browser does not support the video tag.
                            </video>
                        )
                    }

                    return (
                        <a
                            key={i}
                            href={token}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 underline hover:opacity-80"
                        >
                            {token}
                        </a>
                    )
                }

                // Texto normal
                return (
                    <span 
                        key={i}
                        className={`text-gray-300 text-sm ${rows ? "line-clamp-"+rows:""}`} 
                    >
                        {token.replaceAll("nostr:", "")}
                    </span>
                )
            })}
        </div>
    )
}

export default NoteContent
