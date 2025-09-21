
'use client'

import { useCallback, useEffect, useMemo, useState } from "react";
import BlurModal from "./BlurModal";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Note } from "@/types/types";
import NoteContent from "../note/NoteContent";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
    notes: Note[];
    noteIndex: number;
    isOpen: boolean;
    onClose: () => void;
    fetchMoreNotes: () => Promise<void>;
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

const PRELOAD_THRESHOLD = 3;

const NoteSlide = ({ notes, noteIndex, endOfResults, fetchMoreNotes, isOpen, onClose }: Props) => {
    
    const [index, setIndex] = useState(noteIndex);
    const [direction, setDirection] = useState<1 | -1>(1);
    const note = useMemo(() => notes[index], [index, notes]);
    const date = useMemo(() => {
        return format(new Date(notes[index].published_at * 1000), "dd MMM yyyy");
    }, [index, notes]);

    const onPrev = useCallback(() => {
        if (index > 0) {
            setDirection(-1);
            setIndex(prev => prev - 1);
        }
    }, [index]);

    const onNext = useCallback(async () => {
        const nextIndex = index + 1;
        setDirection(1);
        if (nextIndex < notes.length) {
            setIndex(prev => prev + 1);
        } else if (endOfResults && nextIndex === notes.length) {
            setIndex(0);
        }
        if (!endOfResults && notes.length - nextIndex <= PRELOAD_THRESHOLD) {
            await fetchMoreNotes();
        }
    }, [index, notes, endOfResults, fetchMoreNotes]);

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

    if (!note) return null;

    return (
        <BlurModal isOpen={isOpen} onClose={onClose}>

            {/* button latest */}
            <button
                onClick={onPrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-1 md:p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition hover:scale-110"
            >
                <ChevronLeft size={28} />
            </button>

            {/* button next */}
            <button
                onClick={onNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-1 md:p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition hover:scale-110"
            >
                <ChevronRight size={28} />
            </button>

            {/* animation content */}
            <div className="flex justify-center items-center px-0 py-10 w-full h-full">
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
                        className="relative bg-gray-800 bg-opacity-35 rounded-xl shadow-2xl text-gray-200 max-w-3xl w-full max-h-[90vh] min-h-[40vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent p-6 sm:p-10"
                    >
                        {/* Cabeçalho */}
                        <div className="flex items-center gap-4 mb-6">
                            <img
                                width={100}
                                height={100}
                                src={note.author.picture}
                                onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
                                alt={note.author.display_name || note.author.name}
                                className="w-14 h-14 rounded-full object-cover border-2 border-gray-700"
                            />
                            <div>
                                <p className="text-[14px] md:text-lg font-semibold">
                                    {note.author.display_name || note.author.name}
                                </p>
                                <p className="text-sm text-gray-400">{date}</p>
                            </div>
                        </div>

                        {/* Título */}
                        {note.title && (
                            <h2 className="text-[14px] md:text-2xl font-bold mb-4 text-white">{note.title}</h2>
                        )}

                        {/* Conteúdo */}
                        <div className="prose dark:prose-invert leading-relaxed">
                            <NoteContent note={note} />
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </BlurModal>
    );
};

export default NoteSlide;
