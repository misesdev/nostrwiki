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
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center lg:items-stretch p-4 lg:p-6 gap-4 lg:gap-0">
                
                {/* Logo */}
                <div className="hidden sm:flex items-center justify-between w-full lg:w-auto">
                    <Link href="/">
                        <div className="flex items-center gap-3">
                            <AppImage
                                src="/logo.png"
                                alt="Nosbook Logo"
                                width={40}
                                height={40}
                                className="rounded-full"
                                onError="hidden"
                            />
                            <h1 className="text-lg font-bold text-gray-200 lg:hidden">Nosbook</h1>
                        </div>
                    </Link>

                    {/* Mobile API Docs */}
                    <Link
                        target="_blank"
                        href={urlApiDocs}
                        className="lg:hidden bg-[#3e2eb3] text-white px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base font-medium rounded-md hover:brightness-105 hover:shadow-md transition"
                    >
                        API Docs
                    </Link>
                </div>

                {/* Search */}
                <div className="flex-1 w-full lg:mx-8">
                    <SearchBox handleSearch={handleSearch} />
                </div>

                {/* Desktop Actions */}
                <div className="hidden lg:flex items-center gap-4">
                    <Link target="_blank" 
                        href={urlApiDocs} 
                        className='bg-[#3e2eb3] text-white px-6 py-2 font-medium rounded-md hover:brightness-105 hover:shadow-md transition-shadow'>
                        API Docs
                    </Link>
                </div>
            </div>

            {/* Header options / tabs */}
            <div className="w-full">
                <SearchHeaderOptions />
            </div>
        </header>
    )
}

export default SearchHeader
