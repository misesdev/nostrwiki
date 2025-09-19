'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import SearchBox from './SearchBox';
import AppImage from './commons/AppImage';

export default function HomeSearch(): ReactNode {

    const router = useRouter();

    const handleSearch = (searchTerm: string) => {
        router.push(`/search/notes?term=${searchTerm.trim()}`);
    }

    return (
        <div className="w-full min-h-[60vh] flex flex-col items-center justify-center px-4 sm:px-8">
            {/* <h1 className="text-3xl sm:text-4xl font-bold text-gray-100 text-center mb-6"> */}
            {/*     Explore Nostr Content */}
            {/* </h1> */}
            <div className='flex flex-col items-center py-10'>
                <AppImage
                    src='/logo.png'
                    onError='/logo.png'
                    alt='Nostr Book - Search Users'
                    width={130}
                    height={100}
                    className='w-130 lg:w-200'
                />
                <h1 
                    style={{ fontSize: 24 }}
                    className="text-[20px] lg:text-[24px] text-gray-400 mt-5 font-bold"
                >
                    Nostr Wiki - Explore Nostr Content
                </h1>
            </div>
            {/* Search Box */}
            <div className="w-full max-w-3xl">
                <SearchBox handleSearch={handleSearch} />
            </div>

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                    onClick={() => router.push('/donate')}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:scale-105 transition-transform duration-200"
                >
                    Donate
                </button>
                <a target='_blank'
                    href='https://github.com/misesdev/nostrwiki'
                    className="bg-gray-700 text-gray-200 font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-600 transition-colors"
                >
                    Github
                </a>
            </div>

            {/* Sugestão visual ou footer */}
            <h2 className="mt-6 text-gray-400 text-sm text-center max-w-xl">
                Search notes, users, images, videos and relays Nostr. Explore millions of posts!
            </h2>
        </div>
    );
}
