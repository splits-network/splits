import { clerkMiddleware } from '@clerk/nextjs/server';

// Clerk middleware runs on both protected and semi-public routes
export default clerkMiddleware(async (auth, request) => {
    const path = request.nextUrl.pathname;

    // Protected routes that require authentication
    const isProtectedRoute = path.startsWith('/portal/') ||
        path.startsWith('/api/v2/') ||
        path.startsWith('/api/notifications/') ||
        path === '/api/healthcheck';

    if (isProtectedRoute) {
        await auth.protect();
    }
    // For other routes (like /jobs/*), auth is available but optional
});

export const config = {
    matcher: [
        // Protected routes that require authentication
        '/portal/(.*)',     // Main authenticated portal
        '/public/jobs/(.*)',       // Job pages (auth optional for personalization)
        // Protected API routes only
        '/api/v2/(.*)',     // V2 API routes
        '/api/notifications/(.*)', // Notification APIs
        '/api/healthcheck', // Internal health check
    ],
};

