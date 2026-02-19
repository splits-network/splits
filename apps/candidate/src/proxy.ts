import { clerkMiddleware } from '@clerk/nextjs/server';

// Clerk middleware runs on both protected and semi-public routes
export default clerkMiddleware(async (auth, request) => {
    const path = request.nextUrl.pathname;

    // Public routes - Clerk context available but auth not required
    const isPublicRoute =
        path === '/' ||
        path.startsWith('/sign-in') ||
        path.startsWith('/sign-up') ||
        path.startsWith('/sso-callback');

    if (isPublicRoute) {
        return;
    }

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
        // Root and auth routes (for auth-based redirect and Clerk context)
        '/',
        '/sign-in(.*)',
        '/sign-up(.*)',
        '/sso-callback(.*)',

        // All public pages — layout.tsx calls auth() on every route so Clerk
        // middleware must run here even though auth is not required
        '/public/(.*)',

        // Protected routes that require authentication
        '/portal/(.*)',     // Main authenticated portal

        // Protected API routes only
        '/api/v2/(.*)',     // V2 API routes
        '/api/notifications/(.*)', // Notification APIs
        '/api/healthcheck', // Internal health check
    ],
};

