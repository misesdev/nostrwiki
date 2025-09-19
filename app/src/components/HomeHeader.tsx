'use client'

import Link from "next/link";
import { ReactNode } from "react";

const HomeHeader = (): ReactNode => {
    const urlApiDocs = (process.env.NEXT_PUBLIC_API_ENGINE_URL??"").replace("api", "")
    return (
        <header className='hidden sm:block fixed top-0 left-0 w-full bg-gray-900/90 backdrop-blur-md z-50 shadow-md'>
            <div className="flex flex-row justify-end p-2">
                <Link target="_blank" 
                    href={urlApiDocs} 
                    className='bg-[#3e2eb3] text-white px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base font-medium rounded-md hover:brightness-105 hover:shadow-md transition'>
                    API Docs
                </Link>
            </div>
        </header>
    )
}

export default HomeHeader
