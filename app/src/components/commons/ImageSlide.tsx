'use client'

import { useCallback, useEffect, useMemo, useState } from "react";
import BlurModal from "./BlurModal";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NFile } from "@/types/types";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
    images: NFile[];         
    imageIndex: number;     
    isOpen: boolean;
    onClose: () => void;
    fetchMoreImages: () => Promise<void>;
    endOfResults: boolean;
};

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

const PRELOAD_THRESHOLD = 3

const ImageSlide = ({ images, imageIndex, endOfResults, fetchMoreImages, isOpen, onClose }: Props) => {

    const [loading, setLoading] = useState(true)
    const [index, setIndex] = useState(imageIndex)
    const [direction, setDirection] = useState<1 | -1>(1);
    const image = useMemo(() => images[index], [index, images]);

    const onPrev = useCallback(() => {
        if (index > 0) {
            setDirection(-1);
            setIndex(prev => prev - 1);
            setLoading(true)
        }
    }, [index]);

    const onNext = useCallback(async () => {
        setDirection(1);
        const nextIndex = index + 1;
        if (nextIndex < images.length) { 
            setIndex(prev => prev + 1)
            setLoading(true)
        } else if (endOfResults && nextIndex === images.length) {
            setIndex(0)
        }
        if (!endOfResults && images.length - nextIndex <= PRELOAD_THRESHOLD) {
            await fetchMoreImages();
        }
    }, [index, images, endOfResults, fetchMoreImages]);

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
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onPrev, onNext, isOpen]);

    if (!image) return null;

    return (
        <BlurModal isOpen={isOpen} onClose={onClose}>
                        {/* button latest */}
            <button
                onClick={onPrev}
                className="absolute left-1 top-1/2 -translate-y-1/2 z-20 p-1 md:p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition hover:scale-110"
            >
                <ChevronLeft size={28} />
            </button>
            {/* Loader */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl z-10">
                    <div className="w-16 h-16 border-4 border-gray-300 border-t-purple-500 rounded-full animate-spin"></div>
                </div>
            )}
            {/* button next */}
            <button
                onClick={onNext}
                className="absolute right-1 top-1/2 -translate-y-1/2 z-20 p-1 md:p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition hover:scale-110"
            >
                <ChevronRight size={28} />
            </button>

            {/* animation content */}
            <div className="p-0 m-0 flex justify-center items-center w-full h-full">
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
                        className="relative rounded-xl w-full overflow-y-auto overflow-visible scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent m-0 p-0"
                    >
                        <div className="relative flex items-center justify-center">
                            {/* Imagem */}
                            <img
                                onLoad={() => setLoading(false)}
                                src={image.url}
                                alt={image.title}
                                className="w-auto max-w-[98%] md:max-w-[96%] h-auto max-h-[82vh] md:max-h-[86vh] rounded-xl shadow-lg bg-gray-900 bg-opacity-50"
                            />
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </BlurModal>
    );
};

export default ImageSlide;
