
type Props = {
    url: string;
}

export const AppVideo = ({ url }: Props) => {
    return (
        <video
            src={url}
            muted
            playsInline
            preload="metadata"
            controls={false}
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
        />
    );
};
