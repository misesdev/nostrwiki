'use client'

import { NFile } from "@/types/types"
import toast from "react-hot-toast"
import { Copy, LinkIcon, Play } from "lucide-react"
import AppImage from '../commons/AppImage';
import { AppVideo } from "../commons/AppVideo";
import { shortenString } from "@/utils/utils";

type Props = {
    video: NFile;
    playVideo: (f: NFile) => void;
}

export const VideoItem = ({ playVideo, video }: Props) => {

    const handleCopy = () => {
        navigator.clipboard.writeText(video.url)
        toast.success("Copied URL to clipboard!")
    }

    return (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl overflow-hidden flex flex-col transition hover:shadow-lg">
                {/* Video / capa */}
                <div
                    className="relative w-full h-64 md:h-48 lg:h-64 overflow-hidden cursor-pointer"
                >
                    <AppVideo url={video.url} />

                    {/* Botão de play */}
                    <button onClick={() => playVideo(video)}
                        className="absolute inset-0 m-auto w-16 h-16 bg-white/80 dark:bg-gray-700/80 rounded-full flex items-center justify-center opacity-80 hover:opacity-100 transition"
                        //onClick={() => window.open(video.url, "_blank")}
                    >
                        <Play className="w-8 h-8 text-gray-900 dark:text-gray-100" />
                    </button>
                </div>

                {/* Conteúdo abaixo */}
                <div className="p-4 flex flex-col gap-2">
                    {video.author &&
                        <div className="flex items-center gap-2">
                            <AppImage
                                width={50}
                                height={50}
                                src={video.author.picture}
                                alt={video.author.display_name || video.author.name}
                                className="w-8 h-8 rounded-full object-cover"
                                onError="/default-avatar.png"
                            />
                            <span className="text-gray-900 dark:text-gray-100 font-medium text-sm">
                                {video.author.display_name || video.author.name}
                            </span>
                        </div>
                    }

                    <div className="flex items-center gap-2">
                        <p className="text-gray-500 dark:text-gray-400 text-xs">
                            {shortenString(video.note.content, 100)} 
                        </p>
                    </div>

                    <div className="mt-2 flex justify-between items-center">
                        {video.author &&
                            <span className="text-gray-500 dark:text-gray-400 text-xs">
                                Post by: {video.author.display_name || video.author.name}
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
                                href={video.url}
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
