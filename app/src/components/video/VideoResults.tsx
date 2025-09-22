'use client'

import { NFile } from '@/types/types';
import { VideoItem } from './VideoItem';

type Props = {
    videos: NFile[];
    playVideo: (v: NFile) => void;
}

export default function VideoResults({ videos, playVideo }: Props) {
    if(!videos.length) return null 
    return (
        <div className="my-5 lg:m-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-3 gap-6">
                {videos.map((video, key) => (
                    <VideoItem key={key} video={video} playVideo={playVideo} />
                ))}
            </div>
        </div>
    );
}
