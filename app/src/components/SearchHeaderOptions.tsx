'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AiOutlineCamera, AiOutlineUser, AiOutlineFileText,
    AiOutlineVideoCamera, AiOutlineGlobal } from 'react-icons/ai';
import { motion } from 'framer-motion';

const tabs = [
    { key: 'articles', label: 'Articles', icon: AiOutlineFileText },
    { key: 'notes', label: 'Notes', icon: AiOutlineFileText },
    { key: 'users', label: 'Users', icon: AiOutlineUser },
    { key: 'images', label: 'Images', icon: AiOutlineCamera },
    { key: 'videos', label: 'Videos', icon: AiOutlineVideoCamera },
    { key: 'relays', label: 'Relays', icon: AiOutlineGlobal },
];

export default function SearchHeaderOptions() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const term = searchParams.get('term') ?? '';

    const selectTab = (tab: string) => {
        router.push(`/search/${tab}?term=${term}`);
    }

    return (
        <div className="h-12 w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
            <div className="flex px-4 space-x-2">
                {tabs.map(({ key, label, icon: Icon }) => {
                    const isActive = pathname?.includes(`/search/${key}`);
                    return (
                        <div
                            key={key}
                            onClick={() => selectTab(key)}
                            className="relative flex items-center space-x-2 md:cursor-pointer py-1 lg:py-2 px-1 lg:px-2 transition-all group"
                        >
                            {/* <Icon */}
                            {/*     className={`text-md lg:text-lg ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-400'}`} */}
                            {/* /> */}
                            <p className={`text-[12px] lg:text-sm font-medium transition-colors ${isActive ? 'text-blue-500' : 'text-gray-300 group-hover:text-blue-400'}`}>
                                {label}
                            </p>
                            {isActive && (
                                <motion.div
                                    layoutId="tab-indicator"
                                    className="absolute -bottom-1 -left-1 md:left-0 right-0 h-1 rounded-full bg-blue-500"
                                />
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
