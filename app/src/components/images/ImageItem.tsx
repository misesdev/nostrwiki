'use client'

import { NFile } from "@/types/types"
import toast from "react-hot-toast"
import { Copy, LinkIcon } from "lucide-react"
import AppImage from '../commons/AppImage';

type Props = {
    image: NFile
}

export const ImageItem = ({ image }: Props) => {

    const handleCopy = () => {
        navigator.clipboard.writeText(image.url)
        toast.success("Copied npub to clipboard!")
    }

    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl overflow-hidden flex flex-col transition hover:shadow-lg">
            {/* Imagem */}
            <div className="relative w-full h-64 md:h-48 lg:h-64 overflow-hidden">
                <AppImage
                    fill
                    src={image.url}
                    alt={`Post ${image.note.title}`}
                    className="w-full h-full object-cover"
                    onError="hidden"
                />
            </div>

            {/* Conteúdo abaixo da imagem */}
            <div className="p-4 flex flex-col gap-2">
                {/* Autor */}
                {image.author &&
                    <div className="flex items-center gap-2">
                        <AppImage
                            width={50}
                            height={50}
                            src={image.author.picture}
                            alt={image.author.display_name || image.author.name}
                            className="w-8 h-8 rounded-full object-cover"
                            onError="/default-avatar.png"
                        />
                        <span className="text-gray-900 dark:text-gray-100 font-medium text-sm">
                            {image.author.display_name || image.author.name}
                        </span>
                    </div>
                }

                <div className="flex items-center gap-2">
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                        {image.note.title} 
                    </p>
                </div>
                {/* Ações */}
                <div className="mt-2 flex justify-between items-center">
                    {image.author &&
                        <span className="text-gray-500 dark:text-gray-400 text-xs">
                            Post by: {image.author.display_name || image.author.name}
                        </span>
                    }
                    <div className="flex gap-2">
                        <button
                            onClick={handleCopy}
                            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                        >
                            <Copy className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </button>
                        <a
                            href={image.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                        >
                            <LinkIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
