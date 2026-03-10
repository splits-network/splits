import Script from 'next/script';
import { headers } from 'next/headers';
import { detectBrand } from '@/lib/brand';
import { BrandProvider } from '@/components/brand-provider';
import './globals.css';

export const metadata = {
    title: 'Video Call',
    description: 'Join your scheduled video call',
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const headersList = await headers();
    const hostname = headersList.get('x-forwarded-host') || headersList.get('host') || 'localhost';
    const brand = detectBrand(hostname);

    return (
        <html lang="en" data-theme={brand.daisyTheme}>
            <body className="min-h-screen bg-base-100 text-base-content">
                <BrandProvider brand={brand}>
                    {children}
                </BrandProvider>
                <Script
                    src="https://kit.fontawesome.com/728c8ddec8.js"
                    crossOrigin="anonymous"
                    async
                />
            </body>
        </html>
    );
}
