'use client'

import HomeHeader from '@/components/HomeHeader';
import HomeSearch from '@/components/HomeSearch';
import { ReactNode } from 'react';

const Home = () : ReactNode => {
    return (
        <>
            <HomeHeader />
            <div className='flex flex-col items-center'>
                <HomeSearch />
            </div>
        </>
    );
}

export default Home
