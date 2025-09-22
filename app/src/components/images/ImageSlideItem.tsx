import { NFile } from "@/types/types";
import { useState } from "react";
import AppImage from "../commons/AppImage";

type Props = { item: NFile; }

const ImageSlideItem = ({ item }: Props) => {
    const [loading, setLoading] = useState(true)
    return (
        <div className="relative flex items-center justify-center">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl z-10">
                    <div className="w-16 h-16 border-4 border-gray-300 border-t-purple-500 rounded-full animate-spin"></div>
                </div>
            )}
            <AppImage
                width={500}
                height={500}
                src={item.url}
                alt={item.title}
                className="w-auto max-w-[98%] md:max-w-[96%] h-auto max-h-[82vh] md:max-h-[86vh] rounded-xl shadow-lg bg-gray-900 bg-opacity-50"
                onError="/default-banner.jpg"
                onLoad={() => setLoading(false)}
            />
        </div>
    )
}

export default ImageSlideItem
