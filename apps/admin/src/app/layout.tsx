import type { Metadata } from 'next';
import Script from 'next/script';
import { ClerkProvider } from '@clerk/nextjs';
import { QueryProvider } from '@/providers/query-provider';
import './globals.css';

export const metadata: Metadata = {
    title: 'Splits Network Admin',
    description: 'Admin Portal',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

    if (!publishableKey) {
        throw new Error('Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable');
    }

    return (
        <ClerkProvider publishableKey={publishableKey}>
            <html lang="en" suppressHydrationWarning>
                <head>
                    <Script
                        src="https://kit.fontawesome.com/728c8ddec8.js"
                        crossOrigin="anonymous"
                        async
                        data-auto-replace-svg="nest"
                        strategy="afterInteractive"
                    />
                </head>
                <body className="flex flex-col min-h-screen bg-base-300">
                    <QueryProvider>{children}</QueryProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
