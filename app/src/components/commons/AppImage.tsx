import { useState } from "react"
import Image from "next/image"

type AppImageProps = {
    src: string;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
    alt: string;
    fill?: boolean;
    onError: string|"hidden";
    onLoad?: () => void;
}

const AppImage = ({ 
    src, onError, alt, width, height, fill, className, priority=false, onLoad
}: AppImageProps) => {
    const [source, setSource] = useState(src)
    if(source.includes("hidden")) return <></>
    return (
        <Image
            alt={alt}
            fill={fill}
            src={source} 
            width={width}
            height={height}
            priority={priority}
            className={className}
            onError={() => setSource(onError)}
            onLoad={onLoad}
        />
    )
}

export default AppImage
