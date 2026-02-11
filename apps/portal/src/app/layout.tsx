import type { Metadata } from "next";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import CookieConsent from "@/components/cookie-consent";
import { ToastProvider } from "@/lib/toast-context";
import { ThemeInitializer } from "./theme-initializer";
import { ServiceStatusBanner } from "@splits-network/shared-ui";
import { JsonLd } from "@splits-network/shared-ui";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import "./globals.css";
import { UserProfileProvider } from "@/contexts";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

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
    const webAppJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Splits Network",
        url: "https://splits.network",
        applicationCategory: "BusinessApplication",
        description:
            "Split-fee recruiting marketplace platform. Collaborate with recruiters, share roles, and split fees while growing your recruiting business.",
        operatingSystem: "Web",
        sameAs: ["https://employment-networks.com", "https://applicant.network"],
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
            sameAs: ["https://employment-networks.com", "https://applicant.network"],
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
                    <meta
                        name="helpninja-verification"
                        content="b49754f5-9bd5-4f3d-895d-1ef14b050375"
                    />

                    <script
                        dangerouslySetInnerHTML={{
                            __html: `
                                (function() {
                                    try {
                                        var theme = localStorage.getItem('theme') || 'splits-light';
                                        document.documentElement.setAttribute('data-theme', theme);
                                    } catch (e) {
                                        document.documentElement.setAttribute('data-theme', 'splits-light');
                                    }
                                })();
                            `,
                        }}
                    />
                    <JsonLd data={webAppJsonLd} id="splits-webapp-jsonld" />

                    <link
                        rel="preload"
                        as="style"
                        href="https://kit.fontawesome.com/728c8ddec8.css"
                    />
                    <link
                        rel="stylesheet"
                        href="https://kit.fontawesome.com/728c8ddec8.css"
                        crossOrigin="anonymous"
                    />
                </head>
                <body className="flex flex-col min-h-screen bg-base-300">
                    <UserProfileProvider>
                        <ThemeInitializer />
                        <ServiceStatusBanner statusHref="/public/status" />
                        <ToastProvider>
                            <main className="grow">{children}</main>
                            <CookieConsent />
                        </ToastProvider>
                    </UserProfileProvider>

                    {/* HelpNinja widget loaded after page becomes interactive */}
                    {/** Commented out temporarily */}
                    {/* <Script
                        src="https://helpninja.app/api/widget?t=hn_pk_sGLps5fACfWmzntqum9f6dmR&s=45c1a756-0984-41c2-9b84-17ea5b558938&k=b49754f5-9bd5-4f3d-895d-1ef14b050375&voice=friendly"
                        strategy="afterInteractive"
                    /> */}

                    {/* Analytics scripts loaded after page becomes interactive */}
                    <Script
                        id="microsoft-clarity"
                        strategy="afterInteractive"
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
                        strategy="afterInteractive"
                    />

                    <Script
                        id="google-analytics"
                        strategy="afterInteractive"
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
