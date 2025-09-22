'use client'

import { NFile } from '@/types/types';
import { VideoItem } from './VideoItem';

type Props = {
    videos: NFile[];
    playVideo: (v: NFile) => void;
}

const VideoResults = ({ videos, playVideo }: Props) => {
    if(!videos.length) return null 
    return (
        <div className="w-full">
            <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-7 py-5 px-3 md:px-6'>
                {videos.map((video, key) => (
                    <VideoItem key={key} video={video} playVideo={playVideo} />
                ))}
            </div>
        </div>
    );
}

export default VideoResults
