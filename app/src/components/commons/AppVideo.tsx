import { useEffect, useRef, useState } from "react";

type Props = {
    url: string;
}

export const AppVideo = ({ url }: Props) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [poster, setPoster] = useState<string>("");

    useEffect(() => {
        if (!videoRef.current) return;
        const vid = videoRef.current;

        const captureFrame = () => {
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

        vid.addEventListener("loadeddata", captureFrame, { once: true });
        return () => vid.removeEventListener("loadeddata", captureFrame);
    }, [url]);

    const handleMouseEnter = () => {
        videoRef.current?.play();
    }

    const handleMouseLeave = () => {
        videoRef.current?.pause();
        //videoRef.current!.currentTime = 0; // reset para o início
    }

    return (
        <video
            ref={videoRef}
            src={url}
            poster={poster}
            muted
            playsInline
            preload="metadata"
            controls={false}
            className="w-full h-full object-cover"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            crossOrigin="anonymous"
        />
    );
};
