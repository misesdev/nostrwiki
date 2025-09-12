'use client';

import { ReactNode } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AiOutlineCamera, AiOutlineSearch } from 'react-icons/ai';

export default function SearchHeaderOptions(): ReactNode {
    
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const searchTerm = searchParams.get('searchTerm');

    const selectTab = (tab: string) => {
        router.push(`/search/${tab}?searchTerm=${searchTerm}`)
    }
    
    return (
        <div className='flex space-x-2 select-none w-full justify-start pl-5 lg:pl-10 text-gray-700 text-sm'>
            <div onClick={()=>selectTab("web")} 
                className={`text-[11px] lg:text-[14px] text-gray-200 flex items-center space-x-1 border-b-4 border-transparent active:text-blue-500 cursor-pointer pb-3 px-2 ${pathname === '/search/web' && '!text-blue-600 !border-blue-600'}`}>
                <AiOutlineSearch className='text-md' />
                <p>Profile</p>
            </div>
            <div onClick={()=>selectTab("image")} 
                className={`text-[11px] lg:text-[14px] text-gray-200 flex items-center space-x-1 border-b-4 border-transparent active:text-blue-500 cursor-pointer pb-3 px-2 ${pathname === '/search/image' && '!text-blue-600 !border-blue-600'}`}>
                <AiOutlineCamera className='text-md' />
                <p>Images</p>
            </div>
            <div onClick={()=>selectTab("video")} 
                className={`text-[11px] lg:text-[14px] text-gray-200 flex items-center space-x-1 border-b-4 border-transparent active:text-blue-500 cursor-pointer pb-3 px-2 ${pathname === '/search/video' && '!text-blue-600 !border-blue-600'}`}>
                <AiOutlineCamera className='text-md' />
                <p>Videos</p>
            </div>
            <div onClick={()=>selectTab("relays")} 
                className={`text-[11px] lg:text-[14px] text-gray-200 flex items-center space-x-1 border-b-4 border-transparent active:text-blue-500 cursor-pointer pb-3 px-2 ${pathname === '/search/relays' && '!text-blue-600 !border-blue-600'}`}>
                <AiOutlineCamera className='text-md' />
                <p>Relays</p>
            </div>
        </div>
    );
}



