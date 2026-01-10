import { ServiceStatusBanner } from '@/components/ServiceStatusBanner';

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="bg-base-300 p-6">
            <ServiceStatusBanner />
            {children}
        </div>
    );
}
