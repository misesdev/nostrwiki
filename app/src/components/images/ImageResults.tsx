'use client'

import { NFile } from "@/types/types"
import { ImageItem } from "./ImageItem";

type ImageResultsProps = {
    images: NFile[];
    showInSlide: (f: NFile) => void;
}

const ImageResults = ({ images, showInSlide }: ImageResultsProps) => {
    if(!images.length) return null
    return (
        <div className='my-5 lg:m-10'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-3 gap-4'>
                {images.map((result, key) => (
                    <ImageItem 
                        showInSlide={showInSlide}
                        key={result.note_id+key} 
                        image={result} 
                    />
                ))}
            </div>
        </div>
    );
}

export default ImageResults
