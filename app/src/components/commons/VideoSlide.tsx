'use client'

import { useCallback, useEffect, useMemo, useState } from "react";
import BlurModal from "./BlurModal";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NFile } from "@/types/types";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
    videos: NFile[];         
    playIndex: number;     
    isOpen: boolean;
    onClose: () => void;
    fetchMoreVideos: () => Promise<void>;
    endOfResults: boolean;
};

const PRELOAD_THRESHOLD = 3

const variants = {
    enter: (direction: number) => ({
        x: direction === 1 ? 300 : -300,
        opacity: 0,
        position: "absolute" as const
    }),
    center: {
        x: 0,
        opacity: 1,
        position: "relative" as const
    },
    exit: (direction: number) => ({
        x: direction === 1 ? -300 : 300,
        opacity: 0,
        position: "absolute" as const
    }),
};

const VideoPlayer = ({ videos, playIndex, endOfResults, fetchMoreVideos, isOpen, onClose }: Props) => {

    const [index, setIndex] = useState(playIndex)
    const [direction, setDirection] = useState<1 | -1>(1);
    const video = useMemo(() => videos[index], [index, videos]);

    const onPrev = useCallback(() => {
        if (index > 0) {
            setDirection(-1);
            setIndex(prev => prev - 1);
        }
    }, [setIndex, index])

    const onNext = useCallback(async () => {
        setDirection(1);
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


            {/* button latest */}
            <button
                onClick={onPrev}
                className="absolute left-1 top-1/2 -translate-y-1/2 z-20 p-1 md:p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition hover:scale-110"
            >
                <ChevronLeft size={28} />
            </button>

            {/* button next */}
            <button
                onClick={onNext}
                className="absolute right-1 top-1/2 -translate-y-1/2 z-20 p-1 md:p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition hover:scale-110"
            >
                <ChevronRight size={28} />
            </button>

            {/* animation content */}
            <div className="flex justify-center items-center w-full h-full">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={index}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                            if (info.offset.x < -100) {
                                onNext();
                            } else if (info.offset.x > 100) {
                                onPrev();
                            }
                        }}
                        className="relative rounded-xl max-w-3xl w-full max-h-[90vh] min-h-[40vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent p-0"
                    >
                        <video
                            loop
                            src={video.url}
                            controls
                            autoPlay
                            className="w-full h-auto max-h-[95vh] rounded-xl bg-gray-900 bg-opacity-50"
                        >
                            Your browser does not support the video tag.
                        </video>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* <div className="relative flex items-center justify-center"> */}
            {/*     <button */}
            {/*         onClick={onPrev} */}
            {/*         className="absolute left-2 sm:left-6 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white" */}
            {/*     > */}
            {/*         <ChevronLeft size={32} /> */}
            {/*     </button> */}

            {/*     <video */}
            {/*         loop */}
            {/*         src={video.url} */}
            {/*         controls */}
            {/*         autoPlay */}
            {/*         className="w-full h-auto max-h-[95vh] rounded-xl bg-gray-900 bg-opacity-50" */}
            {/*     > */}
            {/*         Your browser does not support the video tag. */}
            {/*     </video> */}

            {/*     <button */}
            {/*         onClick={onNext} */}
            {/*         className="absolute right-2 sm:right-6 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white" */}
            {/*     > */}
            {/*         <ChevronRight size={32} /> */}
            {/*     </button> */}
            {/* </div> */}
        </BlurModal>
    );
};

export default VideoPlayer;
