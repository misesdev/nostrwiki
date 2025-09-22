'use client'

import { NFile } from "@/types/types"
import toast from "react-hot-toast"
import { Copy, LinkIcon } from "lucide-react"
import AppImage from '../commons/AppImage';

type Props = {
    image: NFile;
    showInSlide: (f: NFile) => void;
}

export const ImageItem = ({ image, showInSlide }: Props) => {

    const handleCopy = () => {
        navigator.clipboard.writeText(image.url)
        toast.success("Copied image URL to clipboard!")
    }

    return (
        <div className="bg-gray-800/40 backdrop-blur-md shadow-lg rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:bg-gray-800/60">
            <div 
                onClick={() => showInSlide(image)}
                className="relative w-full h-72 md:h-64 lg:h-72 overflow-hidden group"
            >
                <AppImage
                    width={400}
                    height={400}
                    src={image.url}
                    alt={`Post ${image.note.title}`}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500"
                    onError="hidden"
                />

                {/* Overlay gradiente */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-70 group-hover:opacity-80 transition" />

                {/* Botões de ação sobre a imagem */}
                <div className="absolute top-3 right-3 flex gap-2 ">
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // impede abrir o slide
                            handleCopy();
                        }}
                        className="p-2 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 shadow-md transition"
                        title="Copiar URL"
                    >
                        <Copy className="w-5 h-5 text-gray-800 dark:text-gray-200" />
                    </button>
                    <a
                        onClick={(e) => e.stopPropagation()} // impede abrir o slide
                        target="_blank"
                        href={image.url}
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 shadow-md transition"
                        title="Open in new tab"
                    >
                        <LinkIcon className="w-5 h-5 text-gray-800 dark:text-gray-200" />
                    </a>
                </div>

                {image.note?.title && (
                    <span className="absolute bottom-3 left-3 text-xs px-3 py-1 bg-black/70 text-white rounded-md shadow-md line-clamp-1">
                        {image.note.title}
                    </span>
                )}
            </div>

            {/* Conteúdo abaixo */}
            <div className="p-4 flex flex-col gap-3">
                {/* Autor */}
                {image.author && (
                    <div className="flex items-center gap-3">
                        <AppImage
                            width={50}
                            height={50}
                            src={image.author.picture}
                            alt={image.author.display_name || image.author.name}
                            className="w-10 h-10 rounded-full object-cover border border-gray-700"
                            onError="/default-avatar.png"
                        />
                        <div>
                            <span className="text-gray-100 font-medium text-[12px] md:text-sm block">
                                {image.author.display_name || image.author.name}
                            </span>
                            <span className="text-xs text-gray-400">Autor</span>
                        </div>
                    </div>
                )}

                {/* {image.author && ( */}
                {/*     <span className="text-xs text-gray-500 dark:text-gray-400"> */}
                {/*         Posted by {image.author.display_name || image.author.name} */}
                {/*     </span> */}
                {/* )} */}
            </div>
        </div>
    )
}
