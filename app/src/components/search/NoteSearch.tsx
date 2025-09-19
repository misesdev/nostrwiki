'use client'

import { Note, SearchParams } from "@/types/types";
import SearchService from "@/services/api/SearchService";
import { useCallback, useEffect, useRef, useState } from "react";
import EmptyResults from "./EmptyResults";
import { normalizeNote } from "@/utils/utils";
import NoteResults from "../note/NoteResults";
import NoteLoader from "../note/NoteLoader";

const NoteSearch = ({ term }: SearchParams) => {
 
    const take = 25
    const [skip, setSkip] = useState(0)
    const [loading, setLoading] = useState(true)
    const [notes, setNotes] = useState<Note[]>([])
    const [endOfResults, setEndOfResults] = useState(false)
    const loaderRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => { 
        setSkip(0)
        setNotes([])
        setLoading(true)
        setEndOfResults(false)
        const load = async () => {
            const service = new SearchService()
            const notes = await service.search<Note>("/search/notes", { term, skip:0, take })
            setNotes(prev => [...prev,...notes.map(n => normalizeNote(n))])
            setEndOfResults(!notes.length)
            setSkip(prev => prev + take)
            setLoading(false)
        }
        load() 
    }, [term])

    const fetchNotes = useCallback(async () => {
        setLoading(true)
        const service = new SearchService()
        const notes = await service.search<Note>("/search/notes", { term, skip, take })
        setNotes(prev => [...prev,...notes.map(n => normalizeNote(n))])
        setEndOfResults(!notes.length)
        setSkip(prev => prev + take)
        setLoading(false)
    }, [term, skip, take])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading && !endOfResults) {
                    fetchNotes();
                }
            },
            { threshold: 1 }
        )
        const target = loaderRef.current; 
        if (target) {
            observer.observe(target);
        }
        return () => {
            if (target) {
                observer.unobserve(target); 
            }
        };
    }, [loading, endOfResults, fetchNotes]);

    if (!loading && !notes.length) 
        return <EmptyResults term={term} /> 

    return (
        <div className="w-full">
            {loading && <NoteLoader />}
            <NoteResults notes={notes} />
            {endOfResults && 
                <p className="text-center text-gray-500">No more results</p>
            }
            <div ref={loaderRef} className="h-100" />
        </div>
    )
}

export default NoteSearch 
