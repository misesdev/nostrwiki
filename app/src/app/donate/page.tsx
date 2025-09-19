'use client'

import AppImage from "@/components/commons/AppImage";
import HomeHeader from "@/components/HomeHeader";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import toast from "react-hot-toast";
import { Copy } from "lucide-react"; // ícone minimalista

export default function DonatePage() {

    const router = useRouter();
    const lightningAddress = "greatasphalt42@walletofsatoshi.com";

    const handleCopy = () => {
        navigator.clipboard.writeText(lightningAddress)
        toast.success(`Copied ${lightningAddress} to clipboard!`)
    }

    return (
        <>
            <HomeHeader />
            <div className="flex flex-col items-center px-4 sm:px-0">
                
                <h1 className="text-2xl sm:text-3xl text-center text-gray-200 font-bold mb-4">
                    Support Nostr Book
                </h1>

                <h2 className="text-gray-400 text-center max-w-xl mb-10">
                    You can support this project by sending sats to the Lightning Wallet address below. 
                    Simply scan the QR code or copy the address to your wallet.
                </h2>

                <div className="flex flex-col items-center bg-gray-800 bg-opacity-50 p-8 rounded-xl shadow-lg">
                    <QRCodeCanvas
                        value={lightningAddress} 
                        size={180}
                        bgColor="#fff"      
                        fgColor="#000"      
                        level="M"              
                        imageSettings={{
                            src: "/logo.png",   
                            x: undefined,       
                            y: undefined,
                            height: 48,         
                            width: 48,
                            excavate: true      
                        }}
                        className="rounded-lg shadow-xl"
                    />
                    <div className="flex items-center gap-2 mt-6">
                        <h3 className="text-blue-400 text-lg break-all">
                            {lightningAddress}
                        </h3>
                        <button 
                            onClick={handleCopy}
                            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
                            aria-label="Copy lightning address"
                        >
                            <Copy size={18} className="text-blue-400" />
                        </button>
                    </div>
                    <p className="text-gray-400 text-sm mt-2 text-center max-w-xs">
                        Scan the QR code with your Lightning Wallet or copy the address above to donate.
                    </p>
                </div>

                {/* Go Back Button */}
                <div className="mt-12">
                    <button 
                        onClick={() => router.push('/')} 
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:scale-105 transition-transform duration-200"
                    >
                        Go Back
                    </button>
                </div>
                <div className="h-[100px]" />
            </div>
        </>
    );
}
