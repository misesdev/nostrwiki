'use client';

import Link from "next/link";
import { ReactNode, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchBox from './SearchBox';
import AppImage from './commons/AppImage';

export default function HomeSearch(): ReactNode {

    const router = useRouter()
    const handleSearch = (searchTerm: string) => {
        router.push(`/search/notes?term=${searchTerm.trim()}`);
    }

    return (
        <div className="w-full flex flex-col items-center justify-center px-4 sm:px-8">
            <div className='flex flex-col items-center pb-5'>
                <AppImage
                    priority
                    src='/logo.png'
                    onError='/logo.png'
                    alt='Nostr Wiki - Explorer'
                    width={300}
                    height={300}
                    className='w-[80px] md:w-[120px] lg:w-[140px]'
                />
                <h1 className="text-[18px] md:text-[24px] text-gray-400 mt-2 font-bold">
                    Nostr Wiki - Explorer
                </h1>
            </div>
            {/* Search Box */}
            <div className="w-full max-w-3xl">
                <SearchBox handleSearch={handleSearch} />
            </div>

            <h2 className="mt-6 text-gray-400 text-[12px] md:text-sm text-center max-w-xl">
                Search notes, users, images, videos and relays Nostr. Explore millions of posts!
            </h2>

            {/* Botões de ação */}
            <div className="text-[12px] flex flex-col sm:flex-row gap-4 mt-8">
                <button
                    onClick={() => router.push('/donate')}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:scale-105 transition-transform duration-200"
                >
                    Donate
                </button>
                <Link target='_blank'
                    href='https://github.com/misesdev/nostrwiki'
                    className="bg-gray-700 text-gray-200 font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-600 transition-colors"
                >
                    Github
                </Link>
            </div>

        </div>
    );
}
