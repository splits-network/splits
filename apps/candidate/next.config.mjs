import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@splits-network/shared-types', '@splits-network/shared-config'],
    serverExternalPackages: ['@supabase/supabase-js'],
    // No rewrites needed - client-side API calls go directly to the gateway
};

export default withSentryConfig(nextConfig, {
    org: 'splitsnetwork',
    project: 'candidate',
    silent: !process.env.CI,
    widenClientFileUpload: true,
    hideSourceMaps: true,
    disableLogger: true,
    automaticVercelMonitors: true,
});
