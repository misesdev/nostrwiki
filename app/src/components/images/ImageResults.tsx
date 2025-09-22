'use client'

import { NFile } from "@/types/types"
import ImageItem from "./ImageItem";

type ImageResultsProps = {
    images: NFile[];
    showInSlide: (f: NFile) => void;
}

const ImageResults = ({ images, showInSlide }: ImageResultsProps) => {
    if(!images.length) return null
    return (
        <div className="w-full">
            <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-7 py-5 px-3 md:px-6'>
                {images.map((image, key) => (
                    <ImageItem key={key} image={image} showInSlide={showInSlide} />
                ))}
            </div>
        </div>
    );
}

export default ImageResults
