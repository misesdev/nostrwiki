'use client'

import { Note } from "@/types/types"
import { format } from "date-fns"
import AppImage from "../commons/AppImage"
import { useState } from "react"
import NoteModal from "./NoteModal"
import UserModal from "../user/UserModal"
import NoteContent from "./NoteContent"

type Props = {
    note: Note;
    showInSlide: (f: Note) => void;
}

const NoteItem = ({ note, showInSlide }: Props) => {

    const [isUserOpen, setIsUserOpen] = useState(false)
    const date = format(new Date(note.published_at * 1000), "dd MMM yyyy")

    return (
        <>
            <div className="bg-gray-800 bg-opacity-35 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden transition hover:shadow-2xl hover:-translate-y-1 duration-300">

                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsUserOpen(true)}>
                            <AppImage
                                width={40}
                                height={40}
                                src={note.author.picture || "/default-avatar.png"}
                                onError="/default-avatar.png"
                                alt={note.author.display_name || note.author.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
                            />
                        </button>
                        <div className="flex flex-col">
                            <span className="text-gray-100 font-semibold text-sm">
                                {note.author.display_name || note.author.name}
                            </span>
                            <span className="text-gray-400 text-xs">{date}</span>
                        </div>
                    </div>
                </div>

                <div className="p-4 flex flex-col gap-2">
                    {note.title && (
                        <button onClick={() => showInSlide(note)}>
                            <h3 className="text-lg font-bold text-blue-500 dark:text-blue-400 hover:text-blue-400 dark:hover:text-blue-300 hover:underline line-clamp-2 transition">
                                {note.title}
                            </h3>
                        </button>
                    )}

                    <div className="text-gray-200 dark:text-gray-300 text-sm line-clamp-2">
                        <NoteContent note={note} cliped />
                    </div>
                </div>

                <div className="px-4 pb-4 flex justify-end text-gray-400 text-xs">
                    {/* adicionar botões de ação, likes, etc */}
                </div>
            </div>

            {/* Modais */}
            {/* {isOpen && ( */}
            {/*     <NoteModal note={note} isOpen={isOpen} onClose={() => setIsOpen(false)} /> */}
            {/* )} */}
            {isUserOpen && (
                <UserModal
                    user={note.author}
                    isOpen={isUserOpen}
                    onClose={() => setIsUserOpen(false)}
                />
            )}
        </>
    )
}

export default NoteItem
