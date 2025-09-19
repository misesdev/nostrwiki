'use client'

import { NFile, SearchParams } from '@/types/types';
import SearchService from '@/services/api/SearchService';
import VideoLoader from '../video/VideoLoader';
import { useCallback, useEffect, useRef, useState } from 'react';
import EmptyResults from './EmptyResults';
import { normalizeFile } from '@/utils/utils';
import VideoResults from '../video/VideoResults';
import VideoSlide from '../commons/VideoSlide';

const VideoSearch = ({ term }: SearchParams) => {

    const take = 25
    const [skip, setSkip] = useState(0)
    const [loading, setLoading] = useState(true)
    const [videos, setVideos] = useState<NFile[]>([])
    const [endOfResults, setEndOfResults] = useState(false)
    const loaderRef = useRef<HTMLDivElement | null>(null);
    const [slideOpen, setSlideOpen] = useState(false)
    const [playIndex, setPlayIndex] = useState(0)

    useEffect(() => { 
        setSkip(0)
        setVideos([])
        setLoading(true)
        setEndOfResults(false)
        const load = async () => {
            const service = new SearchService()
            const videos = await service.search<NFile>("/search/videos", { term, skip:0, take })
            setVideos(prev => [...prev, ...videos.map(v => normalizeFile(v))])
            setEndOfResults(!videos.length)
            setSkip(prev => prev + take)
            setLoading(false)
        }
        load() 
    }, [term])

    const fetchVideos = useCallback(async () => {
        setLoading(true)
        if(skip != 0)
            console.log("load more videos")
        const service = new SearchService()
        const videos = await service.search<NFile>("/search/videos", { term, skip, take })
        setVideos(prev => [...prev, ...videos.map(v => normalizeFile(v))])
        setEndOfResults(!videos.length)
        setSkip(prev => prev + take)
        setLoading(false)
    }, [term, skip, take])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading && !endOfResults) {
                    fetchVideos();
                }
            },
            { threshold: 1 }
        );

        const target = loaderRef.current; 
        if (target) {
            observer.observe(target);
        }
        return () => {
            if (target) {
                observer.unobserve(target); 
            }
        };
    }, [loading, endOfResults, fetchVideos]);

    const playVideo = useCallback((video: NFile) => {
        setPlayIndex(videos.indexOf(video)??0)
        setSlideOpen(true)
    }, [videos])

    if (!loading && !videos.length) 
        return <EmptyResults term={term} /> 

    return (
        <>
            <div className='w-full'>
                {loading && <VideoLoader />}
                <VideoResults playVideo={playVideo} videos={videos} />
                {endOfResults && 
                    <p className="text-center text-gray-500">No more results</p>
                }
                <div ref={loaderRef} className="h-100" />
            </div>
            {/* Modal Player */}
            {slideOpen && (
                <VideoSlide
                    videos={videos}
                    isOpen={slideOpen}
                    onClose={() => setSlideOpen(false)}
                    playIndex={playIndex}
                    fetchMoreVideos={fetchVideos}
                    endOfResults={endOfResults}
                />
            )}
        </>
    )
}

export default VideoSearch
