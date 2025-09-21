'use client'

import { Note } from "@/types/types"
import BlurModal from "../commons/BlurModal"
import NoteContent from "./NoteContent"
import AppImage from "../commons/AppImage"
import { format } from "date-fns"

type NoteModalProps = {
    note: Note
    isOpen: boolean
    onClose: () => void
}

const NoteModal = ({ note, isOpen, onClose }: NoteModalProps) => {
    const date = format(new Date(note.published_at * 1000), "dd MMM yyyy")
    return (
        <BlurModal isOpen={isOpen} onClose={onClose}>
            <div className="bg-gray-800 bg-opacity-35 text-gray-400 p-8 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                
                {/* Cabeçalho com perfil */}
                <div className="flex items-center gap-4 mb-6">
                    <AppImage
                        width={100}
                        height={100}
                        src={note.author.picture}
                        onError="/default-avatar.png"
                        alt={note.author.display_name || note.author.name}
                        className="w-14 h-14 rounded-full object-cover"
                    />
                    <div>
                        <p className="text-lg font-semibold">
                            {note.author.display_name || note.author.name}
                        </p>
                        <p className="text-sm text-gray-500">
                            {date}
                        </p>
                    </div>
                </div>

                {/* Título */}
                <h2 className="text-2xl font-bold mb-4">{note.title}</h2>

                {/* Conteúdo formatado */}
                <div className="prose dark:prose-invert max-w-none leading-relaxed">
                    {/* {note.content.split("\n").map((line, i) => ( */}
                    {/*     <p key={i}>{line}</p> */}
                    {/* ))} */}
                    <NoteContent note={note} />
                </div>
            </div>
        </BlurModal>
    )
}

export default NoteModal
