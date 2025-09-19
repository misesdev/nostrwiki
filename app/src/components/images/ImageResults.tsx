'use client'

import { NFile } from "@/types/types"
import { ImageItem } from "./ImageItem";

type ImageResultsProps = {
    images: NFile[];
}

const ImageResults = ({ images }: ImageResultsProps) => {
    if(!images.length) return null
    return (
        <div className='sm:pb-24 pb-40 my-5 lg:m-10'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-3 gap-4'>
                {images.map((result, key) => <ImageItem key={result.note_id+key} image={result} />)}
            </div>
        </div>
    );
}

export default ImageResults
