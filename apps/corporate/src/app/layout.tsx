import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { ServiceStatusBanner } from '@/components/ServiceStatusBanner';

export const metadata: Metadata = {
    metadataBase: new URL('https://employment-networks.com'),
    title: {
        default: 'Employment Networks - Modern Recruiting & Candidate Experience',
        template: '%s | Employment Networks',
    },
    description: 'Powering the future of recruiting with Splits (collaborative recruiting platform) and Applicant (modern candidate portal). Transform your hiring process with our innovative platforms.',
    openGraph: {
        title: 'Employment Networks - Modern Recruiting & Candidate Experience',
        description: 'Powering the future of recruiting with Splits (collaborative recruiting platform) and Applicant (modern candidate portal). Transform your hiring process.',
        url: 'https://employment-networks.com',
        siteName: 'Employment Networks',
        images: [
            {
                url: 'https://employment-networks.com/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Employment Networks - The Future of Recruiting',
                type: 'image/png',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Employment Networks - Modern Recruiting & Candidate Experience',
        description: 'Powering the future of recruiting with Splits and Applicant. Transform your hiring process.',
        images: ['https://employment-networks.com/og-image.png'],
    },
    // Additional meta tags that Teams may look for
    other: {
        'image': 'https://employment-networks.com/og-image.png',
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
                <link rel="stylesheet" href="https://kit.fontawesome.com/728c8ddec8.css" crossOrigin="anonymous" />
            </head>
            <body className="antialiased">
                <ServiceStatusBanner />
                {children}
            </body>
        </html>
    );
}
