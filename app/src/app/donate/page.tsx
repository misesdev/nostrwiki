'use client'

import AppImage from "@/components/commons/AppImage";
import HomeHeader from "@/components/HomeHeader";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";

export default function DonatePage() {
    const router = useRouter();
    const lightningAddress = "greatasphalt42@walletofsatoshi.com";

    return (
        <>
            <HomeHeader />
            <div className="flex flex-col items-center px-4 sm:px-0">
                
                {/* Logo */}
                <AppImage
                    width={200}
                    height={200}
                    src="/logo.png"
                    onError="/logo.png"
                    alt="Nostr Book Users"
                    className="w-36 h-auto mb-6"
                />

                {/* Title */}
                <h2 className="text-2xl sm:text-3xl text-center text-gray-200 font-bold mb-4">
                    Support Nostr Book
                </h2>

                {/* Description */}
                <p className="text-gray-400 text-center max-w-xl mb-10">
                    You can support this project by sending sats to the Lightning Wallet address below. 
                    Simply scan the QR code or copy the address to your wallet.
                </p>

                {/* QR Code + Address */}
                <div className="flex flex-col items-center bg-gray-800 bg-opacity-50 p-8 rounded-xl shadow-lg">
                    <QRCodeCanvas 
                        value={`lightning:${lightningAddress}`} 
                        size={160} 
                        bgColor="#1f1f1f"
                        fgColor="#60a5fa"
                        level="H"
                    />
                    <h3 className="text-blue-400 text-lg mt-6 break-all">
                        {lightningAddress}
                    </h3>
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
            </div>
        </>
    );
}
