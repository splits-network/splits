import { ReactNode } from 'react';
import { ServiceStatusBanner } from '@/components/ServiceStatusBanner';

export default function PublicLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <ServiceStatusBanner />
            {children}
        </>
    );
}
