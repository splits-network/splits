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
        '/accept-invitation(.*)', // Invitation acceptance

        // V2 API routes - exclude public endpoints using negative lookahead
        // Public endpoints (no auth): GET /api/v2/plans*, GET /api/v2/jobs*, GET /api/v2/recruiters*, /api/v2/status-contact*
        // Note: This regex excludes the public endpoints from even running the middleware
        '/api/v2/(?!plans|jobs|recruiters|status-contact).*', // All V2 routes except public endpoints

        '/api/notifications/(.*)', // V1 notification APIs
        '/api/healthcheck', // Internal health check
    ],
};

