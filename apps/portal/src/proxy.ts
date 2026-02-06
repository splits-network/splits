import { clerkMiddleware } from '@clerk/nextjs/server';

// Clerk middleware only runs on protected routes, preventing redirect loops for crawlers
export default clerkMiddleware(async (auth, request) => {
    const pathname = request.nextUrl.pathname;

    // Skip authentication for public API endpoints (matches API Gateway behavior)
    const isPublicEndpoint =
        pathname.startsWith('/api/v2/plans') ||
        pathname.startsWith('/api/v2/jobs') ||
        pathname.startsWith('/api/v2/recruiters') ||
        pathname.startsWith('/api/v2/status-contact');

    if (isPublicEndpoint) {
        return; // Allow unauthenticated access
    }

    // All other matched routes require authentication
    await auth.protect();
});

export const config = {
    matcher: [
        // Protected routes that require authentication
        '/portal/(.*)',     // Main authenticated portal
        '/accept-invitation(.*)', // Invitation acceptance

        // V2 API routes (authentication handled conditionally in middleware)
        '/api/v2/(.*)', // All V2 routes - public endpoints handled conditionally above

        '/api/notifications/(.*)', // V1 notification APIs
        '/api/healthcheck', // Internal health check
    ],
};

