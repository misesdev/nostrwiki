'use client'

import { Relay, SearchParams, User } from "@/types/types"
import { normalizeRelay, normalizeUser } from "@/utils/utils"
import SearchService from "@/services/api/SearchService"
import { useCallback, useEffect, useRef, useState } from "react"
import EmptyResults from "./EmptyResults"
import RelayLoader from "../relay/RelayLoader"
import { RelayResults } from "../relay/RelayResults"
import UserModal from "../user/UserModal"

const RelaySearch = ({ term }: SearchParams) => {
    
    const take = 16
    const [skip, setSkip] = useState(0)
    const [isOpen, setIsOpen] = useState(true)
    const [loading, setLoading] = useState(true)
    const [relays, setRelays] = useState<Relay[]>([])
    const [endOfResults, setEndOfResults] = useState(false)
    const loaderRef = useRef<HTMLDivElement | null>(null)
    const uniques = useRef(new Map<string, Relay>())
    const [author, setAuthor] = useState<User|null>(null)

    useEffect(() => { 
        setSkip(0)
        setRelays([])
        setLoading(true)
        setEndOfResults(false)
        uniques.current = new Map<string, Relay>()
        const load = async () => {
            const service = new SearchService()
            const relays = await service.search<Relay>("/search/relays", { term, skip: 0, take })
            relays.forEach(relay => {
                uniques.current.set(relay.url, normalizeRelay(relay))
            })
            setRelays(Array.from(uniques.current.values()))
            setSkip(prev => prev + take)
            setEndOfResults(!relays.length)
            setLoading(false)
        }
        load()
    }, [term])

    const fetchRelays = useCallback(async () => {
        setLoading(true)
        const service = new SearchService()
        const relays = await service.search<Relay>("/search/relays", { term, skip, take })
        relays.forEach(relay => {
            uniques.current.set(relay.url, normalizeRelay(relay))
        })
        setRelays(Array.from(uniques.current.values()))
        setEndOfResults(!relays.length)
        setSkip(prev => prev + take)
        setLoading(false)
    }, [term, skip, take])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading && !endOfResults) {
                    fetchRelays();
                }
            },
            { threshold: 1 }
        );
        const target = loaderRef.current; 
        if (target) {
            observer.observe(target);
        }
        return () => {
            if (target) {
                observer.unobserve(target); 
            }
        };
    }, [loading, endOfResults, fetchRelays]);

    const viewManteiner = useCallback((user: User) => {
        setAuthor(normalizeUser(user))
        setIsOpen(true)
    }, [isOpen])

    if (!loading && !relays.length) 
        return <EmptyResults term={term} />

    return (
        <>
            <div className="w-full text-[12px] md:text-sm">
                {!!relays.length && (
                    <RelayResults viewManteiner={viewManteiner} relays={relays} />
                )}
                {loading && <RelayLoader />}
                {endOfResults && 
                    <p className="text-center text-gray-500">No more results</p>
                }
                <div ref={loaderRef} className="h-[100px]" />
            </div>
            {isOpen && !!author?.pubkey && (
                <UserModal
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    user={author as User}
                />
            )}
        </>
    )
}

export default RelaySearch

