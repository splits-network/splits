/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: [
        "@splits-network/shared-types",
        "@splits-network/shared-config",
        "@splits-network/shared-ui",
        "@splits-network/basel-ui",
    ],
    serverExternalPackages: ["@supabase/supabase-js"],
    async redirects() {
        return [
            {
                source: "/public/privacy",
                destination: "/privacy-policy",
                permanent: true,
            },
            {
                source: "/public/cookies",
                destination: "/cookie-policy",
                permanent: true,
            },
            {
                source: "/public/terms",
                destination: "/terms-of-service",
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
