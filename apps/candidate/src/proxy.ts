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
        path.startsWith('/onboarding') ||
        path.startsWith('/api/v2/') ||
        path.startsWith('/api/notifications/') ||
        path === '/api/healthcheck';

    if (isProtectedRoute) {
        await auth.protect();
    }
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

