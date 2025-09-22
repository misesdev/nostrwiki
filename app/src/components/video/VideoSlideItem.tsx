import { NFile } from "@/types/types";

type Props = { item: NFile; }

const VideoSlideItem = ({ item }: Props) => {
    return (
        <video
            loop
            src={item.url}
            controls
            autoPlay
            className="w-full h-auto max-h-[95vh] rounded-xl bg-gray-900 bg-opacity-50"
        >
            Your browser does not support the video tag.
        </video> 
    )
}

export default VideoSlideItem
