'use client'

import { NFile, SearchParams } from '@/types/types';
import SearchService from '@/services/api/SearchService';
import VideoLoader from '../video/VideoLoader';
import { useCallback, useEffect, useRef, useState } from 'react';
import EmptyResults from './EmptyResults';
import { normalizeFile } from '@/utils/utils';
import VideoResults from '../video/VideoResults';

const VideoSearch = ({ term }: SearchParams) => {

    const take = 35
    const [skip, setSkip] = useState(0)
    const [loading, setLoading] = useState(true)
    const [videos, setVideos] = useState<NFile[]>([])
    const [endOfResults, setEndOfResults] = useState(false)
    const loaderRef = useRef<HTMLDivElement | null>(null);

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

    if (!loading && !videos.length) 
    return <EmptyResults term={term} /> 

    return (
        <div className='w-full'>
            {loading && <VideoLoader />}
            <VideoResults videos={videos} />
            {endOfResults && 
                <p className="text-center text-gray-500">No more results</p>
            }
            <div ref={loaderRef} className="h-100" />
        </div>
    )
}

export default VideoSearch
