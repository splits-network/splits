import type { Metadata } from "next";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider, ThemeScript, GsapInit } from "@splits-network/basel-ui";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

export const metadata: Metadata = {
    title: "Employment Networks Administration",
    description:
        "Internal administration portal for Employment Networks. Visit splits.network for recruiters and companies, or applicant.network for job seekers.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

    if (!publishableKey) {
        throw new Error(
            "Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable",
        );
    }

    return (
        <ClerkProvider publishableKey={publishableKey}>
            <html lang="en" suppressHydrationWarning>
                <head>
                    <ThemeScript />

                    {/* Preconnect to Clerk for faster auth loading */}
                    <link
                        rel="preconnect"
                        href="https://clerk.admin.employment-networks.com"
                    />
                    <link
                        rel="dns-prefetch"
                        href="https://clerk.admin.employment-networks.com"
                    />

                    <Script
                        src="https://kit.fontawesome.com/728c8ddec8.js"
                        crossOrigin="anonymous"
                        async
                        data-auto-replace-svg="nest"
                        strategy="afterInteractive"
                    />
                </head>
                <body className="flex flex-col min-h-screen bg-base-300">
                    <GsapInit />
                    <QueryProvider>
                        <ThemeProvider>{children}</ThemeProvider>
                    </QueryProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
