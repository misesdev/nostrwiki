'use client'

import { User } from "@/types/types"
import { hexToNpub, shortenString } from "@/utils/utils"
import toast from "react-hot-toast"
import { Copy, Globe } from "lucide-react"
import AppImage from "../commons/AppImage"
import { useState } from "react"
import UserModal from "./UserModal"

type UserItemProps = {
    user: User
}

const UserItem = ({ user }: UserItemProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleCopy = (label: string, value: string) => {
        navigator.clipboard.writeText(value)
        toast.success(`${label} copied to clipboard!`)
    }

    const npub = hexToNpub(user.pubkey)
    const lightning = user.lud16 || user.lud06 || ""

    return (
        <>
            <div className="bg-gray-800 bg-opacity-35 shadow-md rounded-xl overflow-hidden flex flex-col transition hover:shadow-lg">
                {/* Banner */}
                <div className="relative h-28 md:h-32 w-full bg-cover bg-center">
                    <AppImage
                        width={350}
                        height={120}
                        src={user.banner}
                        alt="Banner"
                        className="h-full w-full object-cover"
                        onError={"/default-banner.jpg"}
                    />
                </div>

                {/* Content */}
                <div className="p-2 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    {/* Avatar */}
                    <button className="z-0" onClick={() => setIsModalOpen(true)}>
                        <AppImage
                            width={100}
                            height={100}
                            src={user.picture}
                            alt={user.display_name || user.name}
                            className="w-20 h-20 md:w-16 md:h-16 rounded-full border-4 border-white dark:border-gray-800 -mt-12 md:mt-0"
                            onError={"/default-avatar.png"}
                        />
                    </button>

                    {/* Info */}
                    <div className="flex-1 max-w-[70%] text-center sm:text-left">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="text-lg font-semibold text-gray-200 hover:text-white transition"
                        >
                            {user.display_name || user.name}
                        </button>
                        <p className="text-[12px] md:text-sm text-gray-400 mt-1 line-clamp-3">
                            {user.about}
                        </p>

                        {/* Website */}
                        {user.website && (
                            <a
                                href={user.website.startsWith("http") ? user.website : `https://${user.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center sm:justify-start gap-2 text-[12px] md:text-sm text-blue-400 hover:underline mt-2"
                            >
                                <Globe className="w-4 h-4" /> {user.website}
                            </a>
                        )}

                        {/* Lightning */}
                        {lightning && (
                            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                                <span className="text-[12px] md:text-sm text-yellow-400 break-all">
                                    {shortenString(lightning, 24)}
                                </span>
                                <button
                                    onClick={() => handleCopy("Lightning address", lightning)}
                                    className="p-1 rounded bg-gray-700 hover:bg-gray-600 transition"
                                >
                                    <Copy className="w-4 h-4 text-gray-200" />
                                </button>
                            </div>
                        )}

                        {/* npub */}
                        <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                            <span className="text-[12px] md:text-sm text-purple-300 break-all">
                                {shortenString(npub, 26)}
                            </span>
                            <button
                                onClick={() => handleCopy("Npub", npub)}
                                className="p-1 rounded bg-gray-700 hover:bg-gray-600 transition"
                            >
                                <Copy className="w-4 h-4 text-gray-200" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <UserModal
                user={user}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    )
}

export default UserItem
