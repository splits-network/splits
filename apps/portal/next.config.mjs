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
        "@splits-network/shared-gamification",
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
