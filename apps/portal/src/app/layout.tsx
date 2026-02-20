import type { Metadata } from "next";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import CookieConsent from "@/components/cookie-consent";
import { ToastProvider } from "@/lib/toast-context";
import {
    ServiceStatusProvider,
    ServiceStatusDebugger,
    ThemeScript,
    ThemeProvider,
} from "@splits-network/basel-ui";
import { DevDebugPanel } from "@/components/dev-debug-panel";
import { PortalActivityTrackerWrapper } from "@/components/activity-tracker-wrapper";
import { JsonLd } from "@splits-network/shared-ui";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import "./globals.css";
import { UserProfileProvider, type UserProfile } from "@/contexts";
import { getCurrentUserProfile } from "@/lib/current-user-profile";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getHeaderNav, getFooterNav } from "@/lib/content";
import { QueryProvider } from "@/providers/query-provider";

export const metadata: Metadata = {
    metadataBase: new URL("https://splits.network"),
    title: {
        default: "Splits Network - Recruiting Marketplace",
        template: "%s | Splits Network",
    },
    description:
        "Split-fee recruiting marketplace platform. Collaborate with recruiters, share roles, and split fees while growing your recruiting business.",
    openGraph: {
        title: "Splits Network - Recruiting Marketplace",
        description:
            "Split-fee recruiting marketplace platform. Collaborate with recruiters, share roles, and split fees while growing your recruiting business.",
        url: "https://splits.network",
        siteName: "Splits Network",
        images: [
            {
                url: "https://splits.network/og-image.png",
                width: 1200,
                height: 630,
                alt: "Splits Network - Recruiting Marketplace",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Splits Network - Recruiting Marketplace",
        description:
            "Split-fee recruiting marketplace platform. Collaborate with recruiters, share roles, and split fees.",
        images: ["https://splits.network/og-image.png"],
    },
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // For the portal (browser-facing app), we use environment variables directly
    // Backend services use Vault for secret management
    // Note: CLERK_SECRET_KEY is used automatically by Clerk SDK on the server
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

    if (!publishableKey) {
        throw new Error(
            "Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable",
        );
    }

    // Fetch user profile server-side so UserProfileProvider has data immediately
    // on first render — eliminates loading flash across all authenticated pages.
    // auth() requires clerkMiddleware() to have run on this route — public routes
    // (/*) are outside the middleware matcher, so we catch and fall back to null.
    let initialProfile: UserProfile | null = null;
    try {
        const { getToken, userId } = await auth();
        if (userId) {
            initialProfile = (await getCurrentUserProfile(getToken).catch(
                () => null,
            )) as unknown as UserProfile | null;
        }
    } catch {
        // Public route not covered by clerkMiddleware — profile not available server-side
    }

    // Fetch CMS navigation data (ISR cached, 5 min)
    const [headerNav, footerNav] = await Promise.all([
        getHeaderNav(),
        getFooterNav(),
    ]);

    const webAppJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Splits Network",
        url: "https://splits.network",
        applicationCategory: "BusinessApplication",
        description:
            "Split-fee recruiting marketplace platform. Collaborate with recruiters, share roles, and split fees while growing your recruiting business.",
        operatingSystem: "Web",
        sameAs: [
            "https://employment-networks.com",
            "https://applicant.network",
        ],
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
        },
        provider: {
            "@type": "Organization",
            name: "Employment Networks",
            url: "https://employment-networks.com",
            logo: "https://splits.network/logo.png",
            sameAs: [
                "https://employment-networks.com",
                "https://applicant.network",
            ],
        },
        featureList: [
            "Split-fee recruiting",
            "Collaborative hiring",
            "Job marketplace",
            "Candidate management",
            "Recruiter network",
            "Commission tracking",
            "Placement management",
        ],
    };

    return (
        <ClerkProvider publishableKey={publishableKey}>
            <html lang="en" suppressHydrationWarning>
                <head>
                    <ThemeScript />
                    <meta
                        name="helpninja-verification"
                        content="b49754f5-9bd5-4f3d-895d-1ef14b050375"
                    />
                    <JsonLd data={webAppJsonLd} id="splits-webapp-jsonld" />

                    {/* Preconnect to critical origins for faster API/auth requests */}
                    <link rel="preconnect" href="https://api.splits.network" />
                    <link
                        rel="dns-prefetch"
                        href="https://api.splits.network"
                    />
                    <link
                        rel="preconnect"
                        href="https://clerk.splits.network"
                    />
                    <link
                        rel="dns-prefetch"
                        href="https://clerk.splits.network"
                    />

                    <Script
                        src="https://kit.fontawesome.com/728c8ddec8.js"
                        crossOrigin="anonymous"
                        async
                        data-auto-replace-svg="nest"
                        strategy="afterInteractive"
                    ></Script>
                </head>
                <body className="flex flex-col min-h-screen bg-base-300">
                    <QueryProvider>
                        <ThemeProvider>
                            <UserProfileProvider
                                initialProfile={initialProfile}
                            >
                                <ToastProvider>
                                    <Header navItems={headerNav?.items} />
                                    <ServiceStatusProvider statusHref="/status" />
                                    <ServiceStatusDebugger />
                                    <main className="grow">{children}</main>
                                    <Footer footerNav={footerNav} />
                                    <CookieConsent />
                                </ToastProvider>
                                <DevDebugPanel />
                                <PortalActivityTrackerWrapper />
                            </UserProfileProvider>
                        </ThemeProvider>
                    </QueryProvider>

                    {/* HelpNinja widget loaded after page becomes interactive */}
                    {/** Commented out temporarily */}
                    {/* <Script
                        src="https://helpninja.app/api/widget?t=hn_pk_sGLps5fACfWmzntqum9f6dmR&s=45c1a756-0984-41c2-9b84-17ea5b558938&k=b49754f5-9bd5-4f3d-895d-1ef14b050375&voice=friendly"
                        strategy="afterInteractive"
                    /> */}

                    {/* Analytics scripts loaded after everything else (non-critical) */}
                    <Script
                        id="microsoft-clarity"
                        strategy="lazyOnload"
                        dangerouslySetInnerHTML={{
                            __html: `
                                (function(c,l,a,r,i,t,y){
                                    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                                    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                                    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                                })(window, document, "clarity", "script", "v5i71hg3lv");
                            `,
                        }}
                    />

                    <Script
                        src="https://www.googletagmanager.com/gtag/js?id=G-L49Q34QZQT"
                        strategy="lazyOnload"
                    />

                    <Script
                        id="google-analytics"
                        strategy="lazyOnload"
                        dangerouslySetInnerHTML={{
                            __html: `
                                window.dataLayer = window.dataLayer || [];
                                function gtag(){dataLayer.push(arguments);}
                                gtag('js', new Date());
                                gtag('config', 'G-L49Q34QZQT');
                            `,
                        }}
                    />
                </body>
            </html>
        </ClerkProvider>
    );
}
