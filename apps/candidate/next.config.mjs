/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: [
        '@splits-network/shared-types',
        '@splits-network/shared-config',
        '@splits-network/shared-ui',
    ],
    serverExternalPackages: ['@supabase/supabase-js'],
    async redirects() {
        return [
            {
                source: '/public/privacy',
                destination: '/public/privacy-policy',
                permanent: true,
            },
            {
                source: '/public/cookies',
                destination: '/public/cookie-policy',
                permanent: true,
            },
            {
                source: '/public/terms',
                destination: '/public/terms-of-service',
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
