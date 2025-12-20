import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Employment Networks - Modern Recruiting & Candidate Experience',
    description: 'Powering the future of recruiting with Splits (collaborative recruiting platform) and Applicant (modern candidate portal).',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" data-theme="splits-light">
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}
