/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: [
        '@splits-network/shared-types',
        '@splits-network/shared-config',
        '@splits-network/shared-ui',
    ],
    serverExternalPackages: ['@supabase/supabase-js'],
};

export default nextConfig;
