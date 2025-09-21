import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { ReactNode } from "react";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
}

const BlurModal = ({ children, isOpen, onClose }: Props) => {

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
                    <button
                        onClick={() => onClose()}
                        className="absolute top-3 md:top-6 right-3 md:right-6 text-white p-2 rounded-full bg-white/10 bg-opacity-15 hover:bg-white/25 transition z-10"
                    >
                        <X className="w-4 md:w-6 h-4 md:h-6" />
                    </button>

                    <motion.div
                        className="relative w-full md:max-w-[90%] max-w-[96%] mx-4 rounded-xl overflow-hidden"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.8 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}


export default BlurModal
