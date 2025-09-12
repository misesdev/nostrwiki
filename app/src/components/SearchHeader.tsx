'use client'

import Link from 'next/link';
import SearchBox from './SearchBox';
import SearchHeaderOptions from './SearchHeaderOptions';
import { ReactNode } from 'react';
import AppImage from './commons/AppImage';

export default function SearchHeader(): ReactNode {

    return (
        <header className='top-0 bg-gray-800'>
            <div className='lg:flex w-full p-4 lg:p-6'>
                <div className='hidden lg:flex'>
                    <Link href='/'>
                        <AppImage
                            src='/logo.png'
                            alt='Nostr Book Users'
                            width={40}
                            height={40}
                            onError='hidden'
                        />
                    </Link>
                </div>
                <div className='lg:hidden w-full mb-4 flex px-2'>
                    <Link href='/'>
                        <div className='flex'>
                            <AppImage
                                src='/logo.png'
                                alt='Nostr Book Users'
                                width={32}
                                height={32}
                                priority
                                onError='hidden'
                            />
                            <h3 className='text-[16px] font-bold mt-1 ml-5 text-gray-400'>Nosbook</h3>
                        </div>
                    </Link>
                </div>
                <div className='flex-1'>
                    <SearchBox />
                </div>
                <div className='hidden lg:flex items-center'>
                    <Link target='_blank'
                        href="https://find.nosbook.org" 
                        className='bg-[#3e2eb3] text-gray-300 px-6 py-2 font-medium rounded-md hover:brightness-105 hover:shadow-md transition-shadow'
                    >
                        API Documentation
                    </Link>
                </div>
            </div>
            <SearchHeaderOptions />
        </header>
    );
}
