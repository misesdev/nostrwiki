import { NFile } from "@/types/types";
import { useEffect, useState } from "react";

type Props = { item: NFile; }

const ImageSlideItem = ({ item }: Props) => {
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        setLoading(true)
    }, [item.url])
    return (
        <div className="relative flex items-center justify-center">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl z-10">
                    <div className="w-16 h-16 border-4 border-gray-300 border-t-purple-500 rounded-full animate-spin"></div>
                </div>
            )}
            <img
                src={item.url}
                alt={item.title}
                className="w-auto max-w-[98%] md:max-w-[96%] h-auto max-h-[82vh] md:max-h-[86vh] rounded-xl shadow-lg bg-gray-900 bg-opacity-50"
                onError={e => e.currentTarget.src = "/default-banner.jpg"}
                onLoad={() => setLoading(false)}            
            />
        </div>
    )
}

export default ImageSlideItem
