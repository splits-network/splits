import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ServiceStatusBanner } from "@splits-network/shared-ui";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
    metadataBase: new URL("https://employment-networks.com"),
    title: {
        default:
            "Employment Networks - Modern Recruiting & Candidate Experience",
        template: "%s | Employment Networks",
    },
    description:
        "Powering the future of recruiting with Splits (collaborative recruiting platform) and Applicant (modern candidate portal). Transform your hiring process with our innovative platforms.",
    openGraph: {
        title: "Employment Networks - Modern Recruiting & Candidate Experience",
        description:
            "Powering the future of recruiting with Splits (collaborative recruiting platform) and Applicant (modern candidate portal). Transform your hiring process.",
        url: "https://employment-networks.com",
        siteName: "Employment Networks",
        images: [
            {
                url: "https://employment-networks.com/og-image.png",
                width: 1200,
                height: 630,
                alt: "Employment Networks - The Future of Recruiting",
                type: "image/png",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Employment Networks - Modern Recruiting & Candidate Experience",
        description:
            "Powering the future of recruiting with Splits and Applicant. Transform your hiring process.",
        images: ["https://employment-networks.com/og-image.png"],
    },
    // Additional meta tags that Teams may look for
    other: {
        image: "https://employment-networks.com/og-image.png",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" data-theme="splits-light">
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Organization",
                            name: "Employment Networks",
                            url: "https://employment-networks.com",
                            logo: "https://employment-networks.com/logo.png",
                            description:
                                "Powering the future of recruiting with Splits (collaborative recruiting platform) and Applicant (modern candidate portal). Transform your hiring process with our innovative platforms.",
                            sameAs: [
                                "https://splits.network",
                                "https://applicant.network",
                            ],
                            contactPoint: {
                                "@type": "ContactPoint",
                                contactType: "Customer Service",
                                email: "support@employment-networks.com",
                            },
                            founder: {
                                "@type": "Organization",
                                name: "Employment Networks",
                            },
                        }),
                    }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "SoftwareApplication",
                            name: "Splits Network",
                            applicationCategory: "BusinessApplication",
                            operatingSystem: "Web",
                            offers: {
                                "@type": "AggregateOffer",
                                lowPrice: "0",
                                highPrice: "249",
                                priceCurrency: "USD",
                                offerCount: "3",
                            },
                            aggregateRating: {
                                "@type": "AggregateRating",
                                ratingValue: "4.8",
                                ratingCount: "150",
                            },
                        }),
                    }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "WebSite",
                            name: "Employment Networks",
                            url: "https://employment-networks.com",
                            potentialAction: {
                                "@type": "SearchAction",
                                target: {
                                    "@type": "EntryPoint",
                                    urlTemplate:
                                        "https://employment-networks.com/search?q={search_term_string}",
                                },
                                "query-input":
                                    "required name=search_term_string",
                            },
                        }),
                    }}
                />
                <link
                    rel="stylesheet"
                    href="https://kit.fontawesome.com/728c8ddec8.css"
                    crossOrigin="anonymous"
                />
            </head>
            <body className="antialiased flex flex-col min-h-screen">
                <ServiceStatusBanner statusHref="/status" />
                <Header />
                <main className="flex-grow">{children}</main>
                <Footer />
            </body>
        </html>
    );
}
