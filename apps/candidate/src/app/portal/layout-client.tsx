"use client";

import {
    OnboardingProvider,
    OnboardingWizardModal,
} from "@/components/onboarding";
import { PageTitleProvider } from "@/contexts/page-title-context";
import { PortalToolbar } from "@/components/portal-toolbar";

export function PortalLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PageTitleProvider>
            <OnboardingProvider>
                <PortalToolbar />
                <div className="bg-base-300 p-6">{children}</div>
                <OnboardingWizardModal />
            </OnboardingProvider>
        </PageTitleProvider>
    );
}
