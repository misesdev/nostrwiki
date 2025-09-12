'use client';

import { ReactNode, useState } from 'react';
import { AiOutlineSearch } from 'react-icons/ai';
import { useRouter } from 'next/navigation';

export default function HomeSearch() : ReactNode {
    
    const router = useRouter()
    const [input, setInput] = useState('')

    const handleSubmit = (form: any) => {
        form.preventDefault();
        if (!input.trim()) return;
        form.target.submit()
    }
            
    return (
        <>
            <form method='get'
                action="/search/web"
                onSubmit={handleSubmit}
                className='flex w-full mt-10 mx-auto max-w-[90%] border border-gray-500 px-5 py-3 rounded-full hover:shadow-md focus-within:shadow-md transition-shadow sm:max-w-xl lg:max-w-2xl'
            >
                <AiOutlineSearch className='text-[26px] text-gray-500 mr-3' />
                <input
                    type='text'
                    name="searchTerm"
                    placeholder="Search"
                    autoComplete='off'
                    minLength={3}
                    className='text-[16px] text-gray-200 bg-transparent flex-grow focus:outline-none'
                    onChange={(e) => setInput(e.target.value)}
                />
            </form>
            <div className='flex flex-col space-y-2 sm:space-y-0 justify-center sm:flex-row mt-8 sm:space-x-4'>
                <button
                    className='bg-[#3e2eb3] rounded-md text-sm text-gray-200 font-bold hover:ring-gray-200 focus:outline-none active:ring-gray-300 hover:shadow-md w-36 h-10 transition-shadow'
                    onClick={() => router.push('/donate')}
                >
                    Donate
                </button>
            </div>
        </>
    );
}
