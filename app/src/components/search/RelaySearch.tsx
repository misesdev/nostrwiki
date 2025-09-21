'use client'

import { Relay, SearchParams } from "@/types/types"
import { normalizeRelay } from "@/utils/utils"
import SearchService from "@/services/api/SearchService"
import { useCallback, useEffect, useRef, useState } from "react"
import EmptyResults from "./EmptyResults"
import RelayLoader from "../relay/RelayLoader"
import { RelayResults } from "../relay/RelayResults"

const RelaySearch = ({ term }: SearchParams) => {
    
    const take = 35
    const [skip, setSkip] = useState(0)
    const [loading, setLoading] = useState(true)
    const [relays, setRelays] = useState<Relay[]>([])
    const [endOfResults, setEndOfResults] = useState(false)
    const loaderRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => { 
        setSkip(0)
        setRelays([])
        setLoading(true)
        setEndOfResults(false)
        const load = async () => {
            const service = new SearchService()
            const relays = await service.search<Relay>("/search/relays", { term, skip: 0, take })
            setRelays(relays.map(v => normalizeRelay(v)))
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
        setRelays(prev => [...prev, ...relays.map(v => normalizeRelay(v))])
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

    if (!loading && !relays.length) 
        return <EmptyResults term={term} />

    return (
        <div className="w-full">
            {loading && <RelayLoader />}
            <RelayResults relays={relays} />
            {endOfResults && 
                <p className="text-center text-gray-500">No more results</p>
            }
            <div ref={loaderRef} className="h-[100px]" />
        </div>
    )
}

export default RelaySearch

