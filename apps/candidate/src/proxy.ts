import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Clerk middleware runs on both protected and semi-public routes
export default clerkMiddleware(async (auth, request) => {
    const path = request.nextUrl.pathname;

    // Capture rec_code from URL and store in cookie for persistence across navigations
    const recCode = request.nextUrl.searchParams.get('rec_code');
    let response: NextResponse | undefined;
    if (recCode) {
        response = NextResponse.next();
        response.cookies.set('rec_code', recCode, {
            maxAge: 30 * 24 * 60 * 60, // 30 days
            path: '/',
            sameSite: 'lax',
        });
    }

    // Public routes - Clerk context available but auth not required
    const isPublicRoute =
        path === '/' ||
        path.startsWith('/sign-in') ||
        path.startsWith('/sign-up') ||
        path.startsWith('/sso-callback') ||
        path.startsWith('/api/v3/') ||
        path.startsWith('/api/v2/');

    if (isPublicRoute) {
        return response;
    }

    // Protected routes that require authentication
    const isProtectedRoute = path.startsWith('/portal/') ||
        path.startsWith('/onboarding') ||
        path.startsWith('/api/notifications/') ||
        path === '/api/healthcheck';

    if (isProtectedRoute) {
        await auth.protect();
    }

    return response;
    // For other routes (like /jobs/*), auth is available but optional
});

export const config = {
    // layout.tsx calls auth() on every route, so Clerk middleware must run on
    // all page routes. Use the Clerk-recommended catch-all that excludes only
    // static assets and Next.js internals.
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api)(.*)',
    ],
};

