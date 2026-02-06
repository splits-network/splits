import { clerkMiddleware } from '@clerk/nextjs/server';

// Clerk middleware only runs on protected routes, preventing redirect loops for crawlers
export default clerkMiddleware(async (auth, request) => {
    // All routes matched by config.matcher require authentication
    await auth.protect();
});

export const config = {
    matcher: [
        // Protected routes that require authentication
        '/portal/(.*)',     // Main authenticated portal
        //'/sign-in(.*)',     // Auth routes
        //'/sign-up(.*)',
        //'/forgot-password(.*)',
        //'/sso-callback(.*)', // SSO callback
        '/accept-invitation(.*)', // Invitation acceptance
        // Protected API routes only
        // Note: /api/v2/plans is excluded as it's a public endpoint for pricing page
        '/api/v2/applications/(.*)',
        '/api/v2/candidates/(.*)',
        '/api/v2/companies/(.*)',
        '/api/v2/jobs/(.*)',
        '/api/v2/placements/(.*)',
        '/api/v2/subscriptions/(.*)',
        '/api/v2/payouts/(.*)',
        '/api/v2/recruiters/(.*)',
        '/api/v2/assignments/(.*)',
        '/api/v2/notifications/(.*)',
        '/api/v2/documents/(.*)',
        '/api/v2/users/(.*)',
        '/api/v2/organizations/(.*)',
        '/api/v2/memberships/(.*)',
        '/api/v2/invitations/(.*)',
        '/api/notifications/(.*)', // V1 notification APIs
        '/api/healthcheck', // Internal health check
    ],
};

