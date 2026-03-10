import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: [
        "@splits-network/shared-types",
        "@splits-network/shared-ui",
        "@splits-network/shared-video",
        "@splits-network/basel-ui",
    ],
    serverExternalPackages: ["@supabase/supabase-js"],
    webpack: (config) => {
        config.resolve.alias["@tanstack/react-query"] = path.resolve(
            __dirname,
            "../../node_modules/@tanstack/react-query",
        );
        config.resolve.alias["@livekit/components-react"] = path.resolve(
            __dirname,
            "../../node_modules/@livekit/components-react",
        );
        config.resolve.alias["livekit-client"] = path.resolve(
            __dirname,
            "../../node_modules/livekit-client",
        );
        return config;
    },
};

export default nextConfig;
