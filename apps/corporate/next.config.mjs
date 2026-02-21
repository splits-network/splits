/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // No transpilePackages needed - corporate site has no workspace dependencies
    async redirects() {
        return [
            {
                source: "/status",
                destination: process.env.NEXT_PUBLIC_STATUS_URL || "https://status.splits.network",
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
