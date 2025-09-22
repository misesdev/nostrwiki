'use client'

import SearchHeader from '@/components/SearchHeader';
import './../globals.css';

export default function layout({ children }: any) {
    return (
        <div className="my-[55px] sm:my-[65px] md:my-[65px] lg:my-[40px] bg-gray-900">
            <SearchHeader />
            {children}
        </div>
    )
}

