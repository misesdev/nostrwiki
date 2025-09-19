'use client'

import UserSearch from '@/components/search/UserSearch';
import { useSearchParams } from 'next/navigation';

const UserSearchPage = () => {
    const searchParams = useSearchParams();
    const searchTerm = searchParams.get("term") ?? "";
    return <UserSearch term={searchTerm} />
}

export default UserSearchPage
