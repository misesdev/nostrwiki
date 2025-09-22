
'use client'

import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import BlurModal from "./BlurModal";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Props<Entity> = {
    items: Entity[];
    currentIndex: number;
    isOpen: boolean;
    onClose: () => void;
    fetchMoreItems: () => Promise<void>;
    endOfResults: boolean;
    component: (props: { item: Entity }) => ReactNode;
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

const PRELOAD_THRESHOLD = 3;

function AppSlide<T>({ 
    items, currentIndex, endOfResults, fetchMoreItems, isOpen, onClose, component
}: Props<T>) {

    const [index, setIndex] = useState<number>(currentIndex);
    const [direction, setDirection] = useState<1 | -1>(1);
    const item: T = useMemo(() => items[index], [index, items]);

    const onPrev = useCallback(() => {
        if (index > 0) {
            setDirection(-1);
            setIndex(prev => prev - 1);
        }
    }, [index]);

    const onNext = useCallback(async () => {
        const nextIndex = index + 1;
        setDirection(1);
        if (nextIndex < items.length) {
            setIndex(prev => prev + 1);
        } else if (endOfResults && nextIndex === items.length) {
            setIndex(0);
        }
        if (!endOfResults && items.length - nextIndex <= PRELOAD_THRESHOLD) {
            await fetchMoreItems();
        }
    }, [index, items, endOfResults, fetchMoreItems]);

    // Teclado ← →
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") {
                e.preventDefault();
                onPrev();
            } else if (e.key === "ArrowRight") {
                e.preventDefault();
                onNext();
            } else if (e.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onPrev, onNext, onClose, isOpen]);

    return (
        <BlurModal isOpen={isOpen} onClose={onClose}>
            {/* button previus */}
            <button
                onClick={onPrev}
                className="absolute -left-1 top-1/2 -translate-y-1/2 z-20 p-1 md:p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition hover:scale-110"
            >
                <ChevronLeft size={28} />
            </button>
            {/* button next */}
            <button
                onClick={onNext}
                className="absolute -right-1 top-1/2 -translate-y-1/2 z-20 p-1 md:p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition hover:scale-110"
            >
                <ChevronRight size={28} />
            </button>
            {/* animation content */}
            <div className="flex justify-center items-center p-0 w-full h-full">
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
                        className="flex items-center justify-center rounded-xl w-full p-0"
                    >
                        {component({ item })}
                    </motion.div>
                </AnimatePresence>
            </div>
        </BlurModal>
    );
};

export default AppSlide;
