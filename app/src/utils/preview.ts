'use client'

import axios from "axios"

export type UrlMetadata = {
    title: string | null;
    subtitle: string | null; 
    image: string | null;
    url: string;
    domain: string;
}

export const getPreviewData = async (url: string) : Promise<UrlMetadata> => {
    const { data } = await axios.get(`/api/preview?url=${encodeURIComponent(url)}`)
    return data;
}
