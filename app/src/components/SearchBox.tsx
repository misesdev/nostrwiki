'use client';

import { AiOutlineSearch } from 'react-icons/ai';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchService from '@/services/api/SearchService';
import AutoComplete from './search/AutoComplete';
import { AutocompleteResult } from '@/types/types';

type SearchBoxProps = {
    handleSearch: (t: string) => void;
}

const SearchBox = ({ handleSearch }: SearchBoxProps) => {

    const searchParams = useSearchParams()
    const [searchTerm, setSearchTerm] = useState(searchParams.get("term")??"")
    const [results, setResults] = useState<AutocompleteResult[]>([])
    const [showDropdown, setShowDropdown] = useState(false)
    const debounceRef = useRef<NodeJS.Timeout | null>(null)
    const containerRef = useRef<HTMLDivElement | null>(null)
    const inputRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowDropdown(false)
            }
        };
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            if (searchTerm.trim().length >= 3) {
                fetchResults(searchTerm);
            } else {
                setShowDropdown(false);
                setResults([]);
            }
        }, 500)
    }

    const fetchResults = async (q: string) => {
        try {
            const service = new SearchService()
            const results = await service.autocomplete(q.trim())
            if (inputRef.current?.matches(':focus'))
                setShowDropdown(!!results.length)
            setResults(results)
        } catch (err) {
            console.error('Error fetching autocomplete:', err)
        }
    }

    const onSearch = useCallback((searchTerm: string) => {
        inputRef.current?.blur()
        setSearchTerm(searchTerm.trim())
        handleSearch(searchTerm.trim())
        setShowDropdown(false)
    }, [searchTerm, inputRef, handleSearch])
    
    const handleFocus = async () => {
        if (results.length > 0 && searchTerm.length >= 3) {
            await fetchResults(searchTerm.trim())
        }
    }

    const handleBlur = () => {
        setTimeout(() => setShowDropdown(false), 200)
    }

    return (
        <div ref={containerRef} className="text-[12px] md:text-sm w-full lg:max-w-3xl mx-auto relative z-50">
            <form onSubmit={e => { 
                    e.preventDefault() 
                    onSearch(searchTerm) 
                }}
                className="text-[12px] md:text-sm relative flex items-center w-full bg-gray-900/70 backdrop-blur-md border border-gray-700 rounded-3xl shadow-lg px-4 py-2"
            >
                <AiOutlineSearch className="text-gray-400 text-2xl mr-3 cursor-pointer hover:text-gray-200 transition" />
                <input 
                    ref={inputRef}
                    type="search"
                    placeholder="Search..."
                    value={searchTerm}
                    autoComplete="off"
                    minLength={3}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className="text-[12px] md:text-sm bg-transparent text-gray-100 placeholder-gray-400 w-full focus:outline-none text-sm sm:text-base"
                />
            </form>

            {showDropdown && !!results.length && (
                <div className="absolute top-full mt-1 w-full bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-2xl shadow-xl max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 transition">
                    <AutoComplete
                        results={results}
                        term={searchTerm.trim()}
                        onSearch={onSearch} 
                    />
                </div>
            )}
        </div>
    );
}

export default SearchBox;
