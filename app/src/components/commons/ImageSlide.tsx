'use client'

import { useCallback, useEffect, useMemo, useState } from "react";
import BlurModal from "./BlurModal";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NFile } from "@/types/types";
import Content from "../note/Content";
import AppImage from "./AppImage";

type Props = {
    images: NFile[];         
    imageIndex: number;     
    isOpen: boolean;
    onClose: () => void;
    fetchMoreImages: () => Promise<void>;
    endOfResults: boolean;
};

const PRELOAD_THRESHOLD = 3

const ImageSlide = ({ images, imageIndex, endOfResults, fetchMoreImages, isOpen, onClose }: Props) => {

    const [index, setIndex] = useState(imageIndex)
    const [loading, setLoading] = useState(true)
    const image = useMemo(() => images[index], [index, images]);

    const onPrev = useCallback(() => {
        if (index > 0) {
            setIndex(prev => prev - 1);
            setLoading(true)
        }
    }, [index]);

    const onNext = useCallback(async () => {
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
            <div className="relative flex items-center justify-center">
                {/* Botão voltar */}
                <button
                    onClick={onPrev}
                    className="absolute left-2 sm:left-6 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition"
                >
                    <ChevronLeft size={32} />
                </button>

                {/* Loader */}
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl z-10">
                        <div className="w-16 h-16 border-4 border-gray-300 border-t-purple-500 rounded-full animate-spin"></div>
                    </div>
                )}

                {/* Imagem */}
                <img
                    onLoad={() => setLoading(false)}
                    src={image.url}
                    alt={image.title}
                    className="max-w-[95%] h-auto max-h-[86vh] rounded-xl shadow-lg bg-gray-900 bg-opacity-50"
                />

                {/* Overlay do perfil e título */}
                {/* <div className="absolute bottom-0 z-0 bg-black/60 backdrop-blur-sm rounded-xl p-3 mx-auto flex items-start gap-3 max-w-[80%]"> */}
                {/*     {image.author && ( */}
                {/*         <AppImage */}
                {/*             width={50} */}
                {/*             height={50} */}
                {/*             src={image.author.picture} */}
                {/*             alt={image.author.display_name || image.author.name} */}
                {/*             className="w-10 h-10 rounded-full border border-gray-700" */}
                {/*             onError="/default-avatar.png" */}
                {/*         /> */}
                {/*     )} */}
                {/*     <div className="flex flex-col text-white text-sm line-clamp-2"> */}
                {/*         {image.author && ( */}
                {/*             <span className="font-semibold"> */}
                {/*                 {image.author.display_name || image.author.name} */}
                {/*             </span> */}
                {/*         )} */}
                {/*         {images[index].note?.content && ( */}
                {/*             <Content content={images[index].note.title} cliped /> */}
                {/*         )} */}
                {/*     </div> */}
                {/* </div> */}

                {/* Botão próximo */}
                <button
                    onClick={onNext}
                    className="absolute right-2 sm:right-6 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition"
                >
                    <ChevronRight size={32} />
                </button>
            </div>

            {/* Overlay do perfil e título */}
            <div className="m-2 max-w-[80%] lg:max-w-[38%] z-0 bg-black/60 backdrop-blur-sm rounded-xl p-3 mx-auto flex items-start gap-3">
                {image.author && (
                    <AppImage
                        width={50}
                        height={50}
                        src={image.author.picture}
                        alt={image.author.display_name || image.author.name}
                        className="w-10 h-10 rounded-full border border-gray-700"
                        onError="/default-avatar.png"
                    />
                )}
                <div className="flex flex-col text-white text-sm line-clamp-2">
                    {image.author && (
                        <span className="font-semibold">
                            {image.author.display_name || image.author.name}
                        </span>
                    )}
                    {images[index].note?.content && (
                        <Content content={images[index].note.title} cliped />
                    )}
                </div>
            </div>

        </BlurModal>
    );
};

export default ImageSlide;
