'use client'

import { Relay } from "@/types/types"
import { Copy } from "lucide-react"
import toast from "react-hot-toast"
import AppImage from "../commons/AppImage"

interface Props {
    relay: Relay
}

export const RelayItem = ({ relay }: Props) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(relay.url)
        toast.success(`Copied ${relay.url} to clipboard!`)
    }

    return (
        <div className="w-full rounded-2xl p-5 bg-gray-800/40 backdrop-blur-md shadow-md hover:shadow-xl hover:bg-gray-800/60 transition-all duration-300 flex flex-col md:flex-row gap-5">
            {/* Ícone */}
            <div className="flex-shrink-0">
                <AppImage
                    width={80}
                    height={80}
                    src={relay.icon ?? ""}
                    onError="/default-icon.jpg"
                    alt={relay.name || "Relay Icon"}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border border-gray-700 shadow-sm"
                />
            </div>

            {/* Conteúdo */}
            <div className="flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-xl font-bold text-gray-100">{relay.name}</h2>
                        <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                relay.available
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                                }`}
                        >
                            {relay.available ? "Active" : "Inactive"}
                        </span>
                    </div>

                    {relay.description && (
                        <p className="text-gray-400 mt-2 text-sm leading-snug line-clamp-3">
                            {relay.description}
                        </p>
                    )}

                    <div className="mt-3 space-y-1">
                        <p className="text-gray-300 text-sm">
                            <strong className="text-gray-400">URL:</strong> {relay.url}
                        </p>
                        {relay.software && (
                            <p className="text-gray-300 text-sm">
                                <strong className="text-gray-400">Software:</strong>{" "}
                                {relay.software}
                            </p>
                        )}
                        {relay.version && (
                            <p className="text-gray-300 text-sm">
                                <strong className="text-gray-400">Version:</strong>{" "}
                                {relay.version}
                            </p>
                        )}
                    </div>

                    {relay.author && (
                        <div className="flex items-center mt-4">
                            <AppImage
                                width={40}
                                height={40}
                                src={relay.author.picture}
                                onError="/default-avatar.png"
                                alt={relay.author.display_name}
                                className="w-8 h-8 rounded-full mr-2 object-cover border border-gray-600"
                            />
                            <span className="text-gray-300 text-sm">
                                <strong>
                                    {relay.author.display_name || relay.author.name}
                                </strong>{" "}
                                <span className="text-gray-500">(Maintainer)</span>
                            </span>
                        </div>
                    )}
                </div>

                {/* Rodapé */}
                <div className="mt-5 flex items-center justify-between border-t border-gray-700 pt-3">
                    <span className="text-xs text-gray-500">
                        {relay.ref_count} references
                    </span>
                    <button
                        onClick={handleCopy}
                        className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition"
                        title="Copy relay URL"
                    >
                        <Copy className="w-5 h-5 text-gray-300" />
                    </button>
                </div>
            </div>
        </div>
    )
}
