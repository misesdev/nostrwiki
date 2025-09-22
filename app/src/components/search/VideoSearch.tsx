'use client'

import { NFile, SearchParams } from '@/types/types';
import SearchService from '@/services/api/SearchService';
import VideoLoader from '../video/VideoLoader';
import { useCallback, useEffect, useRef, useState } from 'react';
import EmptyResults from './EmptyResults';
import { normalizeFile } from '@/utils/utils';
import VideoResults from '../video/VideoResults';
import AppSlide from '../commons/AppSlide';
import VideoSlideItem from '../video/VideoSlideItem';

const VideoSearch = ({ term }: SearchParams) => {

    const take = 16
    const [skip, setSkip] = useState(0)
    const [loading, setLoading] = useState(true)
    const [videos, setVideos] = useState<NFile[]>([])
    const [endOfResults, setEndOfResults] = useState(false)
    const loaderRef = useRef<HTMLDivElement | null>(null);
    const [slideOpen, setSlideOpen] = useState(false)
    const [playIndex, setPlayIndex] = useState(0)
    const uniques = useRef(new Map<string, NFile>()) 

    useEffect(() => { 
        setSkip(0)
        setVideos([])
        setLoading(true)
        setEndOfResults(false)
        uniques.current = new Map<string, NFile>()
        const load = async () => {
            const service = new SearchService()
            const videos = await service.search<NFile>("/search/videos", { term, skip:0, take })
            videos.forEach(video => {
                uniques.current.set(video.url, normalizeFile(video))
            })
            setVideos(Array.from(uniques.current.values()))
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
        videos.forEach(video => {
            uniques.current.set(video.url, normalizeFile(video))
        })
        setVideos(Array.from(uniques.current.values()))
        setEndOfResults(!videos.length)
        setSkip(prev => prev + take)
        setLoading(false)
    }, [term, take])

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
            <div className='w-full text-[12px] md:text-sm'>
                {!!videos.length && (
                    <VideoResults playVideo={playVideo} videos={videos} />
                )}
                {loading && <VideoLoader />}
                {endOfResults && 
                    <p className="text-center text-gray-500">No more results</p>
                }
                <div ref={loaderRef} className="h-[100px]" />
            </div>
            {/* Modal Player */}
            {slideOpen && (
                <AppSlide
                    items={videos}
                    isOpen={slideOpen}
                    onClose={() => setSlideOpen(false)}
                    currentIndex={playIndex}
                    fetchMoreItems={fetchVideos}
                    endOfResults={endOfResults}
                    component={VideoSlideItem}
                />
            )}
        </>
    )
}

export default VideoSearch
