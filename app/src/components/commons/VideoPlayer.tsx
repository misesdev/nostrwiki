'use client'

import { useCallback, useEffect, useMemo, useState } from "react";
import BlurModal from "./BlurModal";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NFile } from "@/types/types";

type Props = {
    videos: NFile[];         
    videoIndex: number;     
    isOpen: boolean;
    onClose: () => void;
};

const VideoPlayer = ({ videos, videoIndex, isOpen, onClose }: Props) => {

    const [index, setIndex] = useState(videoIndex)
    const video = useMemo(() => videos[index], [index, videos]);

    const onPrev = useCallback(() => {
        if(index-1 >= 0) 
            setIndex(prev => prev-1)
    }, [setIndex, index])

    const onNext = useCallback(() => {
        if(index+1 < videos.length) 
            setIndex(prev => prev+1)
        else
            setIndex(0)
    }, [setIndex, index, videos])

    // Atalhos de teclado ← →
    useEffect(() => {
        if (!isOpen) return;
        window.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") {
                onPrev();
            } else if (e.key === "ArrowRight") {
                onNext();
            }
            console.log(e.key)
        });
    }, [isOpen, onPrev, onNext]);

    if (!video) return null;

    return (
        <BlurModal isOpen={isOpen} onClose={onClose}>
            <div className="relative flex items-center justify-center">
                {/* Botão voltar */}
                <button
                    onClick={onPrev}
                    className="absolute left-2 sm:left-6 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
                >
                    <ChevronLeft size={32} />
                </button>

                {/* Video */}
                <video
                    loop
                    src={video.url}
                    controls
                    autoPlay
                    className="w-full h-auto max-h-[95vh] rounded-xl bg-gray-900 bg-opacity-50"
                >
                    Your browser does not support the video tag.
                </video>

                {/* Botão próximo */}
                <button
                    onClick={onNext}
                    className="absolute right-2 sm:right-6 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
                >
                    <ChevronRight size={32} />
                </button>
            </div>
        </BlurModal>
    );
};

export default VideoPlayer;
