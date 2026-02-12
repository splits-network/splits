import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Clerk middleware runs on both protected and semi-public routes
export default clerkMiddleware(async (auth, request) => {
    const path = request.nextUrl.pathname;

    // Redirect authenticated users from home page to dashboard
    if (path === '/') {
        const { userId } = await auth();
        if (userId) {
            return NextResponse.redirect(new URL('/portal/dashboard', request.url));
        }
        return;
    }

    // Public auth routes - don't require authentication
    const isPublicRoute =
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

        // Protected routes that require authentication
        '/portal/(.*)',     // Main authenticated portal
        '/public/jobs/(.*)',       // Job pages (auth optional for personalization)
        // Protected API routes only
        '/api/v2/(.*)',     // V2 API routes
        '/api/notifications/(.*)', // Notification APIs
        '/api/healthcheck', // Internal health check
    ],
};

