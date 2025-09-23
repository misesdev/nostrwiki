'use client'

import SearchService from '@/services/api/SearchService';
import { NFile, SearchParams, User } from '@/types/types';
import { normalizeFile } from '@/utils/utils';
import EmptyResults from './EmptyResults';
import { useCallback, useEffect, useRef, useState } from 'react';
import ImageLoader from '../images/ImageLoader';
import ImageResults from '../images/ImageResults';
import AppSlide from '../commons/AppSlide';
import ImageSlideItem from '../images/ImageSlideItem';
import UserModal from '../user/UserModal';

const ImageSearch = ({ term }: SearchParams) => {

    const take = 16
    const [skip, setSkip] = useState(0)
    const [loading, setLoading] = useState(true)
    const [images, setImages] = useState<NFile[]>([])
    const [endOfResults, setEndOfResults] = useState(false)
    const loaderRef = useRef<HTMLDivElement | null>(null);
    const [author, setAuthor] = useState<User|null>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [slideOpen, setSlideOpen] = useState(false)
    const [imageIndex, setImageIndex] = useState(0)
    const uniques = useRef(new Map<string, NFile>()) 

    useEffect(() => { 
        setSkip(0)
        setImages([])
        setLoading(true)
        setEndOfResults(false)
        uniques.current = new Map<string, NFile>()
        const load = async () => {
            const service = new SearchService()
            const images = await service.search<NFile>("/search/images", { term, skip:0, take })
            images.forEach(image => {
                uniques.current.set(image.url, normalizeFile(image))
            })
            setImages(Array.from(uniques.current.values()))
            setEndOfResults(images.length < (take/2))
            setSkip(prev => prev + take)
            setLoading(false)
        }
        load() 
    }, [term])

    const fetchImages = useCallback(async () => {
        setLoading(true)
        const service = new SearchService()
        const images = await service.search<NFile>("/search/images", { term, skip, take })
        images.forEach(image => {
            uniques.current.set(image.url, normalizeFile(image))
        })
        setImages(Array.from(uniques.current.values()))
        setEndOfResults(images.length < (take/2))
        setSkip(prev => prev + take)
        setLoading(false)
    }, [term, skip, take])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading && !endOfResults) {
                    fetchImages();
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
    }, [loading, endOfResults, fetchImages]);

    const showInSlide = useCallback((video: NFile) => {
        setImageIndex(images.indexOf(video)??0)
        setSlideOpen(true)
    }, [images])

    const showAuthor = useCallback((user: User) => {
        setAuthor(user)
        setIsOpen(true)
    }, [isOpen, author])

    if (!loading && !images.length) 
        return <EmptyResults term={term} />

    return (
        <>
            <div className='w-full text-[12px] md:text-sm'>
                <ImageResults showAuthor={showAuthor} showInSlide={showInSlide} images={images} />
                {loading && !endOfResults && <ImageLoader />}
                {endOfResults && 
                    <p className="text-center text-gray-500">No more results</p>
                }
                <div ref={loaderRef} className="h-[50px]" />
            </div>
            {/* Modal Player */}
            {slideOpen && (
                <AppSlide
                    items={images}
                    isOpen={slideOpen}
                    onClose={() => setSlideOpen(false)}
                    currentIndex={imageIndex}
                    fetchMoreItems={fetchImages}
                    endOfResults={endOfResults}
                    component={ImageSlideItem}
                />
            )}
            {isOpen && !!author && (
                <UserModal 
                    isOpen={isOpen}
                    user={author as User}
                    onClose={() => setIsOpen(false)}
                    
                />
            )}
        </>
    )
}

export default ImageSearch
