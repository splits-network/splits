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
        // Protected API routes only
        '/api/v2/(.*)',     // V2 API routes
        '/api/notifications/(.*)', // Notification APIs
        '/api/healthcheck', // Internal health check
    ],
};

