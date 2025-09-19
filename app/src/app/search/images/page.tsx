'use client'

import ImageSearch from '@/components/search/ImageSearch';
import { useSearchParams } from 'next/navigation';

const ImageSearchPage = () => {
    const searchParams = useSearchParams();
    const searchTerm = searchParams.get("term") ?? "";
    return <ImageSearch term={searchTerm} />
}

export default ImageSearchPage
