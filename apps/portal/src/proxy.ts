import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Clerk middleware only runs on protected routes, preventing redirect loops for crawlers
export default clerkMiddleware(async (auth, request) => {
    const pathname = request.nextUrl.pathname;

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

    // Skip authentication for public routes and API endpoints
    const isPublicEndpoint =
        pathname === '/' ||
        pathname.startsWith('/sign-up') ||
        pathname.startsWith('/sign-in') ||
        pathname.startsWith('/sso-callback') ||
        pathname.startsWith('/accept-invitation') ||
        pathname.startsWith('/api/v2/plans') ||
        pathname.startsWith('/api/v2/jobs') ||
        pathname.startsWith('/api/v2/recruiters') ||
        pathname.startsWith('/api/v2/status-contact');

    if (isPublicEndpoint) {
        return response; // Allow unauthenticated access, return response with cookie if set
    }

    // All other matched routes require authentication
    await auth.protect();

    return response;
});

export const config = {
    matcher: [
        // Root and auth routes (for rec_code capture)
        '/',
        '/sign-up(.*)',
        '/sign-in(.*)',
        '/sso-callback(.*)',

        // Protected routes that require authentication
        '/portal/(.*)',     // Main authenticated portal
        '/accept-invitation(.*)', // Invitation acceptance
        //'/join(.*)', // Join platform (handled conditionally in page)

        // V2 API routes (authentication handled conditionally in middleware)
        '/api/v2/(.*)', // All V2 routes - public endpoints handled conditionally above

        '/api/notifications/(.*)', // V1 notification APIs
        '/api/healthcheck', // Internal health check
    ],
};

