'use client';

import { AiOutlineSearch } from 'react-icons/ai';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchService from '@/services/api/SearchService';
import AutoComplete from './search/AutoComplete';
import { AutocompleteResult } from '@/types/types';

type SearchBoxProps = {
    handleSearch: (t: string) => void;
}

const SearchBox = ({ handleSearch }: SearchBoxProps) => {

    const searchParams = useSearchParams()
    const [term, setTerm] = useState(searchParams.get("term") ?? "")
    const [results, setResults] = useState<AutocompleteResult[]>([])
    const [showDropdown, setShowDropdown] = useState(false)
    const debounceRef = useRef<NodeJS.Timeout | null>(null)
    const containerRef = useRef<HTMLDivElement | null>(null)

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
        const value = e.target.value;
        setTerm(value)

        if (debounceRef.current) clearTimeout(debounceRef.current)

        debounceRef.current = setTimeout(() => {
            if (value.length >= 3) {
                fetchResults(value);
            } else {
                setShowDropdown(false);
                setResults([]);
            }
        }, 400)
    }

    const fetchResults = async (q: string) => {
        try {
            const service = new SearchService()
            const results = await service.autocomplete(q.trim())
            setShowDropdown(!!results.length)
            setResults(results)
        } catch (err) {
            console.error('Error fetching autocomplete:', err)
        }
    }

    const onSearch = (searchTerm: string) => {
        handleSearch(searchTerm.trim())
        setTerm(searchTerm.trim())
        setShowDropdown(false)
    }

    return (
        <div ref={containerRef} className="w-full lg:max-w-3xl mx-auto relative z-50">
            <form
                onSubmit={e => { e.preventDefault(); onSearch(term) }}
                className="relative flex items-center w-full bg-gray-900/70 backdrop-blur-md border border-gray-700 rounded-3xl shadow-lg px-4 py-2"
            >
                <AiOutlineSearch className="text-gray-400 text-2xl mr-3 cursor-pointer hover:text-gray-200 transition" />
                <input
                    type="text"
                    placeholder="Search..."
                    value={term}
                    autoComplete="off"
                    minLength={3}
                    onChange={handleChange}
                    onFocus={() => setShowDropdown(!results.length)}
                    className="bg-transparent text-gray-100 placeholder-gray-400 w-full focus:outline-none text-sm sm:text-base"
                />
            </form>

            {/* Dropdown de sugestões */}
            {showDropdown && results.length && (
                <div className="absolute top-full mt-1 w-full bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-2xl shadow-xl max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 transition">
                    <AutoComplete term={term} results={results} onSearch={onSearch} />
                </div>
            )}
        </div>
    );
}

export default SearchBox;
