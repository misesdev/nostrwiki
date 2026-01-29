'use client'

import { Note, SearchParams } from "@/types/types";
import SearchService from "@/services/api/SearchService";
import { useCallback, useEffect, useRef, useState } from "react";
import EmptyResults from "./EmptyResults";
import { normalizeNote } from "@/utils/utils";
import NoteResults from "../note/NoteResults";
import NoteLoader from "../note/NoteLoader";
import AppSlide from "../commons/AppSlide";
import NoteSlideItem from "../note/NoteSlideItem";

const ArticleSearch = ({ term }: SearchParams) => {
 
    const take = 16
    const [skip, setSkip] = useState(0)
    const [loading, setLoading] = useState(true)
    const [notes, setNotes] = useState<Note[]>([])
    const [endOfResults, setEndOfResults] = useState(false)
    const loaderRef = useRef<HTMLDivElement | null>(null);
    const [slideOpen, setSlideOpen] = useState(false)
    const [noteIndex, setNoteIndex] = useState(0)
    const uniques = useRef(new Map<string, Note>()) 
    const isFetching = useRef<boolean>(false) 

    useEffect(() => { 
        setSkip(0)
        setNotes([])
        setLoading(true)
        setEndOfResults(false)
        uniques.current = new Map<string, Note>()
        const load = async () => {
            const service = new SearchService()
            const results = await service.search<Note>("/search/articles", { term, skip:0, take })
            results.forEach(note => {
                uniques.current.set(note.id, normalizeNote(note))
            })
            setNotes(Array.from(uniques.current.values()))
            setEndOfResults(results.length < (take/2))
            setSkip(prev => prev + take)
            setLoading(false)
        }
        load() 
    }, [term])

    const fetchNotes = useCallback(async () => {
        if(isFetching.current) return;
        setLoading(true)
        isFetching.current = true
        const service = new SearchService()
        const results = await service.search<Note>("/search/notes", { term, skip, take })
        results.forEach(note => {
            uniques.current.set(note.id, normalizeNote(note))
        })
        setNotes(Array.from(uniques.current.values()))
        setEndOfResults(results.length < (take/2))
        setSkip(prev => prev + take)
        isFetching.current = false
        setLoading(false)
    }, [term, skip, take, isFetching.current])

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

    const showInSlide = useCallback((note: Note) => {
        setNoteIndex(notes.indexOf(note)??0)
        setSlideOpen(true)
    }, [notes])

    if (!loading && !notes.length) 
        return <EmptyResults term={term} /> 

    return (
        <>
            <div className="w-full text-[12px] md:text-sm">
                <NoteResults showInSlide={showInSlide} notes={notes} />
                {loading && !endOfResults && <NoteLoader />}
                {endOfResults && 
                    <p className="text-center text-gray-500">No more results</p>
                }
                <div ref={loaderRef} className="h-[50px]" />
            </div>
            {slideOpen && (
                <AppSlide
                    items={notes}
                    isOpen={slideOpen}
                    onClose={() => setSlideOpen(false)}
                    currentIndex={noteIndex}
                    fetchMoreItems={fetchNotes}
                    endOfResults={endOfResults}
                    component={NoteSlideItem}
                />
            )}
        </>
    )
}

export default ArticleSearch 
