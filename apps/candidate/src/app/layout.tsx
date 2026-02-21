import type { Metadata } from "next";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Header from "@/components/navigation/header";
import Footer from "@/components/navigation/footer";
import { getHeaderNav, getFooterNav } from "@/lib/content";
import CookieConsent from "@/components/cookie-consent";
import {
    ThemeScript,
    ThemeProvider,
} from "@splits-network/basel-ui";
import { DevDebugPanel } from "@/components/dev-debug-panel";
import { CandidateActivityTrackerWrapper } from "@/components/activity-tracker-wrapper";
import { ToastProvider } from "@/lib/toast-context";
import { CandidateChatSidebar } from "@/components/candidate-chat-sidebar";
import { JsonLd } from "@splits-network/shared-ui";
import { UserProfileProvider } from "@/contexts";
import { getCurrentUserProfile } from "@/lib/current-user-profile";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import "./globals.css";

export const metadata: Metadata = {
    metadataBase: new URL(
        process.env.NEXT_PUBLIC_APP_URL || "https://applicant.network",
    ),
    title: {
        default: "Applicant Network - Find Your Next Career Opportunity",
        template: "%s | Applicant Network",
    },
    description:
        "Browse thousands of job opportunities and manage your job search on Applicant. Track applications, verify credentials, and connect with recruiters.",
    openGraph: {
        title: "Applicant Network - Find Your Next Career Opportunity",
        description:
            "Browse thousands of job opportunities and manage your job search on Applicant. Track applications, verify credentials, and connect with recruiters.",
        url: process.env.NEXT_PUBLIC_APP_URL || "https://applicant.network",
        siteName: "Applicant Network",
        images: [
            {
                url: `${process.env.NEXT_PUBLIC_APP_URL || "https://applicant.network"}/og-image.png`,
                width: 1200,
                height: 630,
                alt: "Applicant Network - Career Opportunities",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Applicant Network - Find Your Next Career Opportunity",
        description:
            "Browse thousands of job opportunities and manage your job search on Applicant.",
        images: [
            `${process.env.NEXT_PUBLIC_APP_URL || "https://applicant.network"}/og-image.png`,
        ],
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
    const appUrl =
        process.env.NEXT_PUBLIC_APP_URL || "https://applicant.network";

    // Fetch user profile server-side so UserProfileProvider has data immediately
    // on first render — eliminates loading flash across all authenticated pages.
    const { getToken, userId } = await auth();
    const initialProfile = userId
        ? await getCurrentUserProfile(getToken).catch(() => null)
        : null;
    const webAppJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Applicant Network",
        url: appUrl,
        applicationCategory: "BusinessApplication",
        description:
            "Browse thousands of job opportunities and manage your job search. Track applications, verify credentials, and connect with recruiters.",
        operatingSystem: "Web",
        sameAs: ["https://employment-networks.com", "https://splits.network"],
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
        },
        provider: {
            "@type": "Organization",
            name: "Employment Networks",
            url: "https://employment-networks.com",
            logo: `${appUrl}/logo.png`,
            sameAs: [
                "https://employment-networks.com",
                "https://splits.network",
            ],
        },
        featureList: [
            "Job search",
            "Application tracking",
            "Resume management",
            "Recruiter connections",
            "Career opportunities",
            "Profile management",
        ],
    };
    const websiteJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Applicant Network",
        url: appUrl,
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: `${appUrl}/jobs?search={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
        },
    };

    // Fetch CMS navigation data (ISR cached, 5 min)
    const [headerNav, footerNav] = await Promise.all([
        getHeaderNav(),
        getFooterNav(),
    ]);

    if (!publishableKey) {
        throw new Error(
            "Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable",
        );
    }
    return (
        <ClerkProvider publishableKey={publishableKey} afterSignOutUrl="/">
            <html lang="en" suppressHydrationWarning>
                <head>
                    <ThemeScript />
                    <JsonLd data={webAppJsonLd} id="applicant-webapp-jsonld" />
                    <JsonLd
                        data={websiteJsonLd}
                        id="applicant-website-jsonld"
                    />

                    {/* Preconnect to critical origins for faster API/auth requests */}
                    <link rel="preconnect" href="https://api.splits.network" />
                    <link
                        rel="dns-prefetch"
                        href="https://api.splits.network"
                    />
                    <link
                        rel="preconnect"
                        href="https://clerk.applicant.network"
                    />
                    <link
                        rel="dns-prefetch"
                        href="https://clerk.applicant.network"
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
                    <ThemeProvider>
                        <UserProfileProvider initialProfile={initialProfile}>
                            <ToastProvider>
                                <CandidateChatSidebar>
                                    <Header navItems={headerNav?.items} />
                                    <main className="flex-1">
                                        {children}
                                    </main>
                                    <Footer footerNav={footerNav} />
                                </CandidateChatSidebar>
                                {/* <CookieConsent /> */}
                            </ToastProvider>
                        </UserProfileProvider>
                    </ThemeProvider>
                    <DevDebugPanel />
                    <CandidateActivityTrackerWrapper />

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
                                })(window, document, "clarity", "script", "v5i844getp");
                            `,
                        }}
                    />

                    <Script
                        src="https://www.googletagmanager.com/gtag/js?id=G-9F24GB9QJQ"
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
                                gtag('config', 'G-9F24GB9QJQ');
                            `,
                        }}
                    />
                </body>
            </html>
        </ClerkProvider>
    );
}
