import './globals.css';
import Footer from '@/components/Footer';
import { Toaster } from 'react-hot-toast';

export const metadata = {
    title: "NostrWiki – Your Nostr Knowledge Hub",
    description: "Search and explore Nostr events, users, notes, active relays and more.",
    openGraph: {
        title: "NostrWiki – Your Nostr Knowledge Hub",
        description: "Search and explore Nostr events, users, notes, active relays and more.",
        url: "https://nostrwiki.org",
        siteName: "NostrWiki",
        images: [
            {
                url: "https://nostrwiki.org/og-image.png", // need stay public 
                width: 1200,
                height: 630,
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "NostrWiki – Your Nostr Knowledge Hub",
        description: "Search and explore Nostr events, users, and notes.",
        images: ["https://nostrwiki.org/og-image.png"],
    },
};


export default function RootLayout({ children }: any) {
    return (
        <html lang='en' className="bg-gray-900">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </head>
            <body className='bg-gray-900 bg-gradient-to-b relative min-h-screen pt-[120px] sm:pt-[165px] lg:pt-[110px] pb-16'>
                <Toaster position="bottom-center" />
                {children}
                <Footer />
            </body>
        </html>
    );
}


