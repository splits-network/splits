import type { Metadata } from "next";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/navigation/header";
import Footer from "@/components/navigation/footer";
import CookieConsent from "@/components/cookie-consent";
import { ServiceStatusBanner } from "@splits-network/shared-ui";
import { ToastProvider } from "@/lib/toast-context";
import { JsonLd } from "@splits-network/shared-ui";
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

export default function RootLayout({
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
    const webAppJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Applicant Network",
        url: appUrl,
        applicationCategory: "BusinessApplication",
        description:
            "Browse thousands of job opportunities and manage your job search. Track applications, verify credentials, and connect with recruiters.",
        operatingSystem: "Web",
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
                urlTemplate: `${appUrl}/public/jobs?search={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
        },
    };

    if (!publishableKey) {
        throw new Error(
            "Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable",
        );
    }
    return (
        <ClerkProvider publishableKey={publishableKey} afterSignOutUrl="/">
            <html lang="en" suppressHydrationWarning>
                <head>
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `
                                (function() {
                                    try {
                                        var theme = localStorage.getItem('theme') || 'applicant-light';
                                        document.documentElement.setAttribute('data-theme', theme);
                                    } catch (e) {
                                        document.documentElement.setAttribute('data-theme', 'applicant-light');
                                    }
                                })();
                            `,
                        }}
                    />
                    <JsonLd data={webAppJsonLd} id="applicant-webapp-jsonld" />
                    <JsonLd data={websiteJsonLd} id="applicant-website-jsonld" />

                    <link
                        rel="stylesheet"
                        href="https://kit.fontawesome.com/728c8ddec8.css"
                        crossOrigin="anonymous"
                    />
                </head>
                <body className="flex flex-col min-h-screen bg-base-300">
                    <ServiceStatusBanner statusHref="/status" />
                    <ToastProvider>
                        <Header />
                        <main className="flex-1">{children}</main>
                        <Footer />
                        {/* <CookieConsent /> */}
                    </ToastProvider>

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
                                })(window, document, "clarity", "script", "v5i844getp");
                            `,
                        }}
                    />

                    <Script
                        src="https://www.googletagmanager.com/gtag/js?id=G-9F24GB9QJQ"
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
                                gtag('config', 'G-9F24GB9QJQ');
                            `,
                        }}
                    />
                </body>
            </html>
        </ClerkProvider>
    );
}
