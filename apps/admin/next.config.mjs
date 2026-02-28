import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: [
        '@splits-network/shared-types',
        '@splits-network/shared-config',
        '@splits-network/shared-hooks',
        '@splits-network/shared-ui',
        '@splits-network/shared-charts',
        '@splits-network/basel-ui',
    ],
    serverExternalPackages: ['@supabase/supabase-js'],
    webpack: (config) => {
        // Force a single instance of react-query across CJS (shared-hooks dist)
        // and ESM (admin app) to share the same QueryClient context.
        config.resolve.alias['@tanstack/react-query'] = path.resolve(
            __dirname,
            '../../node_modules/@tanstack/react-query',
        );
        return config;
    },
};

export default nextConfig;
