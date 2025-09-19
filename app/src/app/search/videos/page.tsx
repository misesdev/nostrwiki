'use client'

import VideoSearch from '@/components/search/VideoSearch';
import { useSearchParams } from 'next/navigation';

const VideoSearchPage = () => {
    const searchParams = useSearchParams();
    const searchTerm = searchParams.get("term") ?? "";
    return <VideoSearch term={searchTerm} />  
}

export default VideoSearchPage
