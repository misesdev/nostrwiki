'use client'

import RelaySearch from "@/components/search/RelaySearch";
import { useSearchParams } from "next/navigation";

const SearchRelayPage = () => {
    const searchParams = useSearchParams();
    const searchTerm = searchParams.get("term") ?? "";
    return <RelaySearch term={searchTerm} />
}

export default SearchRelayPage
