import { Suspense } from 'react';
import VideoSearch from '@/components/search/VideoSearch';
import { SearchParams } from '@/types/types';
import LoadingVideo from './loading';

const ImageSearchPage = async ({ searchParams }: { searchParams: SearchParams }) => {

    const searchTerm = searchParams.searchTerm;

    return (
        <Suspense fallback={<LoadingVideo/>}>
            <VideoSearch searchTerm={searchTerm} />
        </Suspense>
    )    
}

export default ImageSearchPage
