/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: [
        '@splits-network/shared-types',
        '@splits-network/shared-config',
        '@splits-network/shared-ui',
    ],
    serverExternalPackages: ['@supabase/supabase-js'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.supabase.co',
                pathname: '/storage/v1/object/public/**',
            },
            {
                protocol: 'https',
                hostname: 'img.clerk.com',
            },
        ],
    },
};

export default nextConfig;
