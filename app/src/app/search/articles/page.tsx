'use client'

import ArticleSearch from '@/components/search/ArticleSearch';
import { useSearchParams } from 'next/navigation';

const NotesSearchPage = () => {
    const searchParams = useSearchParams();
    const searchTerm = searchParams.get("term") ?? "";
    return <ArticleSearch term={searchTerm} />
}

export default NotesSearchPage

