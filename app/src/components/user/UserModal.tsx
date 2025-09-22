'use client'

import { useEffect, useState } from "react"
import { User, Note } from "@/types/types"
import BlurModal from "../commons/BlurModal"
import AppImage from "../commons/AppImage"
import SearchService from "@/services/api/SearchService"
import Content from "../note/Content"
import NoteViewr from "../note/NoteViwer"

type UserModalProps = {
    user: User
    isOpen: boolean
    onClose: () => void
}

const UserModal = ({ user, isOpen, onClose }: UserModalProps) => {

    const [notes, setNotes] = useState<Note[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!isOpen || !user) return

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
    }, [isOpen, user?.pubkey])

    return (
        <BlurModal isOpen={isOpen} onClose={onClose}>
            <div className="max-w-[100%] max-h-[90vh] overflow-y-auto px-2 py-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                {/* Header do usuário */}
                <div className="p-5 max-w-3xl mx-auto lg:mt-6 space-y-3">
                    <AppImage
                        width={100}
                        height={100}
                        src={user.picture}
                        alt={user.display_name || user.name}
                        className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800"
                        onError="/default-avatar.png"
                    />
                    <div className="flex-1 text-left w-full">
                        <h2 className="text-[16px] md:text-2xl font-bold text-gray-300">
                            {user.display_name || user.name}
                        </h2>
                        <div className="w-full max-w-full text-gray-300 mt-1">
                            <Content content={user.about || "Without Description"} />
                        </div>
                    </div>
                </div>
                {/* Lista de notas */}
                <div className="p-0 md:p-5 max-w-full md:max-w-3xl mx-auto lg:mt-6 space-y-3">
                    <div className="pl-2 m-1">
                        {loading && 
                            <p className="text-[12px] md:text-sm font-bold text-gray-500">
                                loading notes...
                            </p>
                        }
                        {!loading && !notes.length && (
                            <p className="text-[12px] md:text-sm font-bold text-gray-300">
                                No notes found
                            </p>
                        )}
                        {!loading && !!notes.length && (
                            <p className="text-[12px] md:text-sm font-bold text-gray-300">
                                Notes:
                            </p>
                        )}
                    </div>
                    <div className="p-0 md:p-5 max-w-full md:max-w-3xl mx-auto lg:mt-6 space-y-3">
                        {notes.map((note) => (<NoteViewr key={note.id} note={note}/>))}
                    </div>
                </div>
            </div>
        </BlurModal>
    )
}

export default UserModal
