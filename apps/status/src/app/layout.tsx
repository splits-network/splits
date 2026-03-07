import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ThemeScript, ThemeProvider } from "@splits-network/basel-ui";
import { JsonLd } from "@splits-network/shared-ui";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
    metadataBase: new URL(
        process.env.NEXT_PUBLIC_APP_URL || "https://status.splits.network",
    ),
    title: {
        default: "System Status | Splits Network",
        template: "%s | Splits Network Status",
    },
    description:
        "Live system health for the Splits Network platform. Monitor service status, response times, and incident history in real time.",
    openGraph: {
        title: "System Status | Splits Network",
        description:
            "Live system health for the Splits Network platform. Monitor service status, response times, and incident history.",
        url: process.env.NEXT_PUBLIC_APP_URL || "https://status.splits.network",
        siteName: "Splits Network Status",
        locale: "en_US",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const websiteJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Splits Network Status",
        url:
            process.env.NEXT_PUBLIC_APP_URL ||
            "https://status.splits.network",
    };

    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <ThemeScript />
                <JsonLd data={websiteJsonLd} id="status-website-jsonld" />
                <Script
                    src="https://kit.fontawesome.com/728c8ddec8.js"
                    crossOrigin="anonymous"
                    async
                    data-auto-replace-svg="nest"
                    strategy="afterInteractive"
                />
            </head>
            <body className="antialiased flex flex-col min-h-screen">
                <ThemeProvider>
                    <Header />
                    <main className="flex-grow">{children}</main>
                    <Footer />
                </ThemeProvider>
            </body>
        </html>
    );
}
