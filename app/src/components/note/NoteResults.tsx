'use client'

import { Note } from "@/types/types"
import NoteItem from "./NoteItem";

type NoteResultsProps = {
    notes: Note[];
}

const NoteResults = ({ notes }: NoteResultsProps) => {
    if (!notes.length) return null
    return (
        <div className="p-5 max-w-4xl mx-auto lg:mt-6 space-y-3">
            {notes.map((note, i) => (
                <NoteItem key={note.id+i} note={note} />
            ))}
        </div>
    )
}

export default NoteResults
