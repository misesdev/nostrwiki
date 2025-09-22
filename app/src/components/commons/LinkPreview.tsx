
"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getPreviewData, UrlMetadata } from "@/utils/preview"; 
import Image from "next/image"


interface Props {
    link: string;
}

const clipText = (text: string, size = 32) => {
    if (!text) return "";
    return text.length > size ? `${text.substring(0, size)}...` : text;
};

export default function LinkPreview({ link }: Props) {
    const [data, setData] = useState<UrlMetadata>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [notPreview, setNotPreview] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const metadata = await getPreviewData(link);
                if (!metadata?.title && !metadata?.image) {
                    setNotPreview(true);
                } else {
                    setData(metadata);
                }
            } catch (err) {
                console.error(err);
                setNotPreview(true);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [link]);

    if (notPreview) return (
        <Link
            href={link}
            className="text-[12px] md:text-sm mx-2 text-blue-400 hover:underline break-all"
            target="_blank"
            rel="noopener noreferrer"
        >{link}</Link>
    )

    if (loading)
        return (
            <div className="flex justify-center py-4">
                <Loader2 className="animate-spin text-blue-500" />
            </div>
        );

    return (
        <div className="w-full my-2 flex justify-center">
            <Link
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full max-w-full block rounded-xl bg-gray-500 bg-opacity-15 overflow-hidden hover:shadow-md transition"
            >
                {data?.image && !error && (
                    <div className="relative h-32 md:h-48 w-full bg-cover bg-center">
                        <img
                            src={data.image}
                            alt={data.title || "Preview image"}
                            className="h-full w-full object-cover"
                            onError={() => setError(true)}
                        />
                        <div className="flex absolute top-0 left-0 bg-white bg-opacity-15" />
                    </div>
                )}
                <div className="w-full p-2 md:p-4">
                    {data?.domain && (
                        <p className="text-[12px] md:text-xs text-gray-400 mb-1">{clipText(data.domain)}</p>
                    )}
                    <p className="font-semibold text-[12px] md:text-sm text-gray-200">
                        {clipText(data?.title ?? "", 60)}
                    </p>
                    {data?.subtitle && (
                        <p className="text-[12px] md:text-xs text-gray-300 mt-1">
                            {clipText(data.subtitle, 100)}
                        </p>
                    )}
                </div>
            </Link>
        </div>
    );
}
