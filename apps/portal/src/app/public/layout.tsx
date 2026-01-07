import { ReactNode } from 'react';
import { ServiceStatusBanner } from '@/components/service-status-banner';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function PublicLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <Header />
            <ServiceStatusBanner />
            {children}
            <Footer />
        </>
    );
}
