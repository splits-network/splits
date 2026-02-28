import { clerkMiddleware } from '@clerk/nextjs/server';

// Clerk middleware protects /secure/* routes, allows public access to / and /sign-in
export default clerkMiddleware(async (auth, request) => {
    const pathname = request.nextUrl.pathname;

    const isPublicEndpoint =
        pathname === '/' ||
        pathname.startsWith('/sign-in') ||
        pathname.startsWith('/sso-callback') ||
        pathname.startsWith('/unauthorized');

    if (isPublicEndpoint) {
        return;
    }

    // All other matched routes require authentication
    await auth.protect();
}, { secretKey: process.env.ADMIN_CLERK_SECRET_KEY });

export const config = {
    matcher: [
        '/',
        '/sign-in(.*)',
        '/sso-callback',
        '/unauthorized',
        '/secure/(.*)',
    ],
};
