'use client'

import { Note } from "@/types/types"
import NoteItem from "./NoteItem";

type NoteResultsProps = {
    notes: Note[];
    showInSlide: (f: Note) => void;
}

const NoteResults = ({ notes, showInSlide }: NoteResultsProps) => {
    if (!notes.length) return null
    return (
        <div className="p-4 max-w-3xl mx-auto lg:mt-6 space-y-3">
            {notes.map((note, i) => (
                <NoteItem
                    key={note.id+i} 
                    showInSlide={showInSlide}
                    note={note} 
                />
            ))}
        </div>
    )
}

export default NoteResults
