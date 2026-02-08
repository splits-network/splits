"use client";

import { PageTitleProvider } from "@/contexts/page-title-context";
import { PortalToolbar } from "@/components/portal-toolbar";

export default function JobsNewLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PageTitleProvider>
            <PortalToolbar />
            {children}
        </PageTitleProvider>
    );
}
