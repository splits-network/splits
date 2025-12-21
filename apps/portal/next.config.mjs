import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@splits-network/shared-types', '@splits-network/shared-config'],
    serverExternalPackages: ['@supabase/supabase-js'],
    // Disable Turbopack via env var to avoid Windows symlink privilege issues
    // Set TURBOPACK_DISABLE=1 in environment or run with --no-turbopack flag
    // No rewrites needed - client-side API calls go directly to the gateway
};

export default withSentryConfig(nextConfig, {
    org: 'splitsnetwork',
    project: 'portal',
    silent: !process.env.CI,
    widenClientFileUpload: true,
    hideSourceMaps: true,
    disableLogger: true,
    automaticVercelMonitors: true,
});
