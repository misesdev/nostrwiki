'use client'

import SearchHeader from '@/components/SearchHeader';
import './../globals.css';

export default function layout({ children }: any) {
    return (
        <div className="mt-[25px] md:mt-0 bg-gray-900">
            <SearchHeader />
            {children}
        </div>
    )
}

