'use client'

import { useCallback, useEffect, useMemo, useState } from "react";
import BlurModal from "./BlurModal";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NFile } from "@/types/types";

type Props = {
    videos: NFile[];         
    playIndex: number;     
    isOpen: boolean;
    onClose: () => void;
    fetchMoreVideos: () => Promise<void>;
    endOfResults: boolean;
};

const PRELOAD_THRESHOLD = 3

const VideoPlayer = ({ videos, playIndex, endOfResults, fetchMoreVideos, isOpen, onClose }: Props) => {

    const [index, setIndex] = useState(playIndex)
    const video = useMemo(() => videos[index], [index, videos]);

    const onPrev = useCallback(() => {
        if (index > 0) {
            setIndex(prev => prev - 1);
        }
    }, [setIndex, index])

    const onNext = useCallback(async () => {
        const nextIndex = index + 1;
        if(nextIndex < videos.length) { 
            setIndex(prev => prev+1)
        } else if(endOfResults && nextIndex == videos.length) {
            setIndex(0)
        }
        if (!endOfResults && videos.length - nextIndex <= PRELOAD_THRESHOLD) {
            await fetchMoreVideos();
        }
    }, [setIndex, index, videos, endOfResults, fetchMoreVideos])

    // Atalhos de teclado ← →
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") {
                e.preventDefault();
                onPrev();
            } else if (e.key === "ArrowRight") {
                e.preventDefault();
                onNext();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onPrev, onNext]);

    if (!video) return null;

    return (
        <BlurModal isOpen={isOpen} onClose={onClose}>
            <div className="relative flex items-center justify-center">
                <button
                    onClick={onPrev}
                    className="absolute left-2 sm:left-6 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
                >
                    <ChevronLeft size={32} />
                </button>

                <video
                    loop
                    src={video.url}
                    controls
                    autoPlay
                    className="w-full h-auto max-h-[95vh] rounded-xl bg-gray-900 bg-opacity-50"
                >
                    Your browser does not support the video tag.
                </video>

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
