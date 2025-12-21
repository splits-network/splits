import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // No transpilePackages needed - corporate site has no workspace dependencies
};

export default withSentryConfig(nextConfig, {
    org: 'splitsnetwork',
    project: 'corporate',
    silent: !process.env.CI,
    widenClientFileUpload: true,
    hideSourceMaps: true,
    disableLogger: true,
    automaticVercelMonitors: true,
});
