'use client'

import Link from "next/link";
import { ReactNode } from "react";

const HomeHeader = (): ReactNode => {
    const urlApiDocs = (process.env.NEXT_PUBLIC_API_ENGINE_URL??"").replace("api", "docs/api")
    return (
        <header className='flex justify-end p-5 text-sm'>
            <div className="flex space-x-4 items-center">
                <Link target="_blank" 
                    href={urlApiDocs} 
                    className='bg-[#3e2eb3] text-white px-6 py-2 font-medium rounded-md hover:brightness-105 hover:shadow-md transition-shadow'>
                    API Docs
                </Link>
            </div>
        </header>
    )
}

export default HomeHeader
