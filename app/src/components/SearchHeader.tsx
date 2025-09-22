'use client'

import Link from 'next/link';
import SearchBox from './SearchBox';
import SearchHeaderOptions from './SearchHeaderOptions';
import AppImage from './commons/AppImage';
import { useRouter } from 'next/navigation';

const SearchHeader = () => {

    const router = useRouter()
    const urlApiDocs = (process.env.NEXT_PUBLIC_API_ENGINE_URL??"").replace("api", "")

    const handleSearch = (searchTerm: string) => {
        router.push(`${window.location.pathname}?term=${searchTerm.trim()}`)
    }

    return (
        <header className="fixed top-0 left-0 w-full bg-gray-900/90 backdrop-blur-md z-50 shadow-md">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center lg:items-stretch p-2 lg:p-6 gap-4 lg:gap-0">
                
                <div className="flex items-center justify-between w-full lg:w-auto">
                    <Link href="/">
                        <div className="flex items-center gap-3">
                            <AppImage
                                priority
                                src="/logo.png"
                                alt="Nosbook Logo"
                                width={40}
                                height={40}
                                className="w-8 h-8 md:w-15 md:h-15 rounded-full"
                                onError="hidden"
                            />
                            <h1 className="text-sm md:text-lg font-bold text-gray-200 ">Nosbook</h1>
                        </div>
                    </Link>

                    {/* Mobile API Docs */}
                    <Link
                        target="_blank"
                        href={urlApiDocs}
                        className="text-[10px] lg:hidden bg-[#3e2eb3] text-white px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base font-medium rounded-md hover:brightness-105 hover:shadow-md transition"
                    >
                        API Docs
                    </Link>
                </div>

                <div className="flex-1 w-full lg:mx-8">
                    <SearchBox handleSearch={handleSearch} />
                </div>

                <div className="hidden lg:flex items-center gap-4">
                    <Link target="_blank" 
                        href={urlApiDocs} 
                        className='bg-[#3e2eb3] text-white px-6 py-2 font-medium rounded-md hover:brightness-105 hover:shadow-md transition-shadow'>
                        API Docs
                    </Link>
                </div>
            </div>

            <div className="w-full">
                <SearchHeaderOptions />
            </div>
        </header>
    )
}

export default SearchHeader
