import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Clerk middleware protects /secure/* routes, allows public access to / and /sign-in
// Uses CLERK_SECRET_KEY + NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (standard Clerk env vars)
// Each app deploys with its own Clerk instance values via K8s secrets
export default clerkMiddleware(async (auth, request) => {
    const pathname = request.nextUrl.pathname;

    const isPublicEndpoint =
        pathname === "/" ||
        pathname.startsWith("/sign-in") ||
        pathname.startsWith("/sso-callback") ||
        pathname.startsWith("/unauthorized");

    if (isPublicEndpoint) {
        return NextResponse.next();
    }

    // All other matched routes require authentication
    await auth.protect();

    return NextResponse.next();
});

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
