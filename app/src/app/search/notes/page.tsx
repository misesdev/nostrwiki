'use client'

import NoteSearch from '@/components/search/NoteSearch';
import { useSearchParams } from 'next/navigation';

const NotesSearchPage = () => {
    const searchParams = useSearchParams();
    const searchTerm = searchParams.get("term") ?? "";
    return <NoteSearch term={searchTerm} />
}

export default NotesSearchPage
