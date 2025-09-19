'use client'

import { NFile } from '@/types/types';
import VideoPlayer from '../commons/VideoPlayer';
import { useState } from 'react';
import { AppVideo } from '../commons/AppVideo';
import { Copy, LinkIcon, Play } from 'lucide-react';
import AppImage from '../commons/AppImage';
import toast from 'react-hot-toast';

type Props = {
    videos: NFile[];
}

export default function VideoResults({ videos }: Props) {
   
    const [videoIndex, setVideoIndex] = useState(0)
    const [playOpen, setPlayOpen] = useState(false)

    const playVideo = (video: NFile) => {
        const videoIndex = videos.indexOf(video)
        setVideoIndex(videoIndex)
        setPlayOpen(true)
    }

    const handleCopy = (video: NFile) => {
        navigator.clipboard.writeText(video.url)
        toast.success("Copied URL to clipboard!")
    }

    return (
        <>
            <div className="pb-32 sm:pb-24 my-5 lg:m-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-3 gap-6">
                    {videos.map((video, key) => (
                        <div
                            key={key}
                            className="bg-gray-800/40 backdrop-blur-md shadow-lg rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:bg-gray-800/60"
                        >
                            {/* Thumbnail */}
                            <div
                                className="relative w-full h-64 md:h-48 lg:h-60 overflow-hidden group cursor-pointer"
                            >
                                <AppVideo url={video.url} />

                                {/* Gradiente escuro para destacar título */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-70 group-hover:opacity-80 transition" />

                                {/* Botão play */}
                                <button
                                    onClick={() => playVideo(video)}
                                    className="absolute inset-0 m-auto w-16 h-16 bg-white/90 dark:bg-gray-700/90 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all"
                                >
                                    <Play className="w-8 h-8 text-gray-900 dark:text-gray-100" />
                                </button>

                                {/* Badge com título */}
                                {video.note?.title && (
                                    <span className="absolute bottom-2 left-2 text-xs px-2 py-1 bg-black/70 text-white rounded-md line-clamp-1">
                                        {video.note.title}
                                    </span>
                                )}
                            </div>

                            {/* Conteúdo */}
                            <div className="p-4 flex flex-col gap-3">
                                {/* Autor */}
                                {video.author && (
                                    <div className="flex items-center gap-3">
                                        <AppImage
                                            width={50}
                                            height={50}
                                            src={video.author.picture}
                                            alt={video.author.display_name || video.author.name}
                                            className="w-9 h-9 rounded-full object-cover border border-gray-700"
                                            onError="/default-avatar.png"
                                        />
                                        <span className="text-gray-100 font-medium text-sm">
                                            {video.author.display_name || video.author.name}
                                        </span>
                                    </div>
                                )}

                                {/* Ações */}
                                <div className="flex justify-between items-center border-t border-gray-700 pt-3">
                                    {video.author && (
                                        <span className="text-gray-500 dark:text-gray-400 text-xs">
                                            Posted by {video.author.display_name || video.author.name}
                                        </span>
                                    )}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleCopy(video)}
                                            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition"
                                            title="Copy URL"
                                        >
                                            <Copy className="w-5 h-5 text-gray-300" />
                                        </button>
                                        <a
                                            href={video.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition"
                                            title="Open video"
                                        >
                                            <LinkIcon className="w-5 h-5 text-gray-300" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal Player */}
            {playOpen && (
                <VideoPlayer
                    videos={videos}
                    isOpen={playOpen}
                    onClose={() => setPlayOpen(false)}
                    videoIndex={videoIndex}
                />
            )}
        </>
    );
}
