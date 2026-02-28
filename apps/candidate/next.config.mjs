import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
    webpack: (config) => {
        config.resolve.alias["@tanstack/react-query"] = path.resolve(
            __dirname,
            "../../node_modules/@tanstack/react-query",
        );
        return config;
    },
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
            {
                source: "/privacy",
                destination: "/privacy-policy",
                permanent: true,
            },
            {
                source: "/cookies",
                destination: "/cookie-policy",
                permanent: true,
            },
            {
                source: "/terms",
                destination: "/terms-of-service",
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
