/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async redirects() {
        return [
            {
                source: "/status",
                destination: process.env.NEXT_PUBLIC_STATUS_URL || "https://status.splits.network",
                permanent: true,
            },
        ];
    },
    transpilePackages: [
        "@splits-network/shared-types",
        "@splits-network/shared-config",
        "@splits-network/shared-ui",
        "@splits-network/memphis-ui",
        "@splits-network/basel-ui",
    ],
    serverExternalPackages: ["@supabase/supabase-js"],
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**.supabase.co",
                pathname: "/storage/v1/object/public/**",
            },
            {
                protocol: "https",
                hostname: "img.clerk.com",
            },
        ],
    },
};

export default nextConfig;
