'use client'

import { User } from "@/types/types"
import { hexToNpub } from "@/utils/utils"
import toast from "react-hot-toast"
import { Copy } from "lucide-react"
import AppImage from "../commons/AppImage"
import { useState } from "react"
import UserModal from "./UserModal"

type UserItemProps = {
    user: User
}

const UserItem = ({ user }: UserItemProps) => {

    const [isModalOpen, setIsModalOpen] = useState(false)
    const handleCopy = () => {
        navigator.clipboard.writeText(hexToNpub(user.pubkey))
        toast.success("Copied npub to clipboard!")
    }

    return (
        <>
            <div className="bg-gray-800 bg-opacity-35 shadow-md rounded-xl overflow-hidden flex flex-col transition hover:shadow-lg">
                {/* Banner */}
                <div className="relative h-32 w-full bg-cover bg-center">
                    <AppImage
                        width={350}
                        height={120}
                        src={user.banner}
                        alt="Banner"
                        className="h-32 w-full object-cover"
                        onError={"/default-banner.jpg"}
                    />
                </div>

                <div className="p-4 flex flex-col bg-gray-800 bg-opacity-35 sm:flex-row items-center sm:items-start gap-4">
                    {/* Foto */}
                    <button className="z-0" onClick={() => setIsModalOpen(true)}>
                        <AppImage
                            width={100}
                            height={100}
                            src={user.picture}
                            alt={user.display_name || user.name}
                            className="w-25 h-25 md:w-14 md:h-14 rounded-full border-4 border-white dark:border-gray-800 -mt-12 sm:mt-0"
                            onError={"/default-avatar.png"}
                        />
                    </button>

                    {/* Info */}
                    <div className="flex-1 text-left min-h-[3.8rem]">
                        <button onClick={() => setIsModalOpen(true)}
                            className="text-lg font-semibold text-gray-300">
                            {user.display_name || user.name}
                        </button>
                        <p className="max-w-[18rem] text-sm text-gray-500 dark:text-gray-400 min-h-[3.8rem] line-clamp-2">
                            {user.about}
                        </p>
                        {/* <span className=" text-xs text-gray-400 py-2"> */}
                        {/*     <strong>references</strong>: {user.ref_count} */}
                        {/* </span> */}
                    </div>

                    {/* Botão copiar chave */}
                    <button
                        onClick={handleCopy}
                        className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                        title="Copiar chave pública"
                    >
                        <Copy className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>
            </div>
            <UserModal
                user={user}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    )
}

export default UserItem
