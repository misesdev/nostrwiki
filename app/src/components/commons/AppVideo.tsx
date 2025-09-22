import { useEffect, useRef, useState } from "react";

type Props = {
    url: string;
};

export const AppVideo = ({ url }: Props) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [poster, setPoster] = useState<string>("");

    useEffect(() => {
        const vid = videoRef.current;
        if (!vid) return;

        const handleLoadedMetadata = () => {
            // tentar pular meio segundo para evitar frame preto
            try {
                vid.currentTime = Math.min(0.5, vid.duration / 10);
            } catch {
                // fallback: se não der para mudar currentTime, vai capturar no início mesmo
            }
        };

        const handleSeeked = () => {
            try {
                const canvas = document.createElement("canvas");
                canvas.width = vid.videoWidth;
                canvas.height = vid.videoHeight;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
                    const dataUrl = canvas.toDataURL("image/jpeg");
                    setPoster(dataUrl);
                }
            } catch (e) {
                console.warn("Não foi possível capturar frame", e);
            }
        };

        vid.addEventListener("loadedmetadata", handleLoadedMetadata);
        vid.addEventListener("seeked", handleSeeked, { once: true });

        return () => {
            vid.removeEventListener("loadedmetadata", handleLoadedMetadata);
            vid.removeEventListener("seeked", handleSeeked);
        };
    }, [url]);

    const handleMouseEnter = () => {
        videoRef.current?.play();
    };

    const handleMouseLeave = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    return (
        <video
            ref={videoRef}
            src={url}
            poster={poster}
            muted
            playsInline
            preload="metadata"
            controls={false}
            className="w-full h-full object-cover rounded-xl bg-black"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            crossOrigin="anonymous"
        />
    );
};
