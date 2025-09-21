'use client'

import { useEffect, useState } from "react"
import { User, Note } from "@/types/types"
import BlurModal from "../commons/BlurModal"
import AppImage from "../commons/AppImage"
import NoteContent from "../note/NoteContent"
import SearchService from "@/services/api/SearchService"
import Content from "../note/Content"
import { format } from "date-fns"

type UserModalProps = {
    user: User
    isOpen: boolean
    onClose: () => void
}

const UserModal = ({ user, isOpen, onClose }: UserModalProps) => {

    const [notes, setNotes] = useState<Note[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!isOpen) return

        const fetchNotes = async () => {
            setLoading(true)
            try {
                const service = new SearchService()
                const notes = await service.userNotes({
                    pubkey: user.pubkey, skip: 0, take: 35
                })
                setNotes(notes)
            } catch (err) {
                console.error("Erro ao buscar notas do usuário:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchNotes()
    }, [isOpen, user.pubkey])

    return (
        <BlurModal isOpen={isOpen} onClose={onClose}>
            <div className="max-h-[80vh] overflow-y-auto px-6 py-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                {/* Header do usuário */}
                <div className="flex p-5 flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
                    <AppImage
                        width={100}
                        height={100}
                        src={user.picture}
                        alt={user.display_name || user.name}
                        className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800"
                        onError="/default-avatar.png"
                    />
                    <div className="flex-1 text-left">
                        <h2 className="text-2xl font-bold text-gray-300">
                            {user.display_name || user.name}
                        </h2>
                        <p className="text-gray-300 mt-1 line-clamp-3">
                            <Content content={user.about || "Without Descriptino"} />
                        </p>
                    </div>
                </div>

                {/* Lista de notas */}
                <div className="flex flex-col gap-6">
                    {loading && <p className="text-gray-500">loading notes...</p>}
                    {!loading && notes.length === 0 && (
                        <p className="text-gray-300">No notes found</p>
                    )}
                    {notes.map((note) => (
                        <div key={note.id} className="overflow-hidden bg-gray-900 bg-opacity-50 rounded-xl p-4 shadow-md transition hover:shadow-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-500">
                                    {format(new Date(note.published_at * 1000), "dd MMM yyyy")}
                                </span>
                                {/* <span className="text-gray-400 text-sm"> */}
                                {/*     {note.author.display_name || note.author.name} */}
                                {/* </span> */}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-200 mb-2">
                                {note.title || "Without Title"}
                            </h3>
                            <NoteContent note={note} />
                        </div>
                    ))}
                </div>
            </div>
        </BlurModal>
    )
}

export default UserModal
