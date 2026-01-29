import { ReactNode } from "react";
import { ServiceStatusBanner } from "@/components/service-status-banner";

export default function PublicLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <ServiceStatusBanner />
            {children}
        </>
    );
}
