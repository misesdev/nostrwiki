/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        missingSuspenseWithCSRBailout: false 
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**", // qualquer host
            },
            {
                protocol: "http",
                hostname: "**", // qualquer host
            },
        ],
        //unoptimized: true
    },
};

module.exports = nextConfig;
