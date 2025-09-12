import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type Props = {
    url: string;
    isOpen: boolean;
    onClose: () => void;
}

const ModalVideoPlayer = ({ url, isOpen, onClose }: Props) => {

    if(!isOpen) return <></>

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => onClose()}
                >
                    <motion.div
                        className="relative w-full max-w-[1400px] mx-4 rounded-xl overflow-hidden shadow-xl"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.8 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => onClose()}
                            className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/20 transition z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <video
                            muted
                            src={url}
                            controls
                            autoPlay
                            className="w-full h-auto max-h-[95vh] rounded-xl bg-black"
                        >
                            Your browser does not support the video tag.
                        </video>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}


export default ModalVideoPlayer
