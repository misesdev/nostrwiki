
import { ReactNode } from 'react';
import { NFile } from '@/types/types';
import { VideoItem } from '../video/VideoItem';

type Props = {
    results: NFile[]
}

export default function VideoSearchResults({ results }: Props): ReactNode {

    return (
        <div className='sm:pb-24 pb-40 m-12'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-3 gap-4'>
                {results.map((result, i) => <VideoItem key={result.note_id+i} video={result} />)}
            </div>
            <div className='h-12'></div>
        </div>
    );
}
