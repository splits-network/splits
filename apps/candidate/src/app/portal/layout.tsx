import {
    OnboardingProvider,
    OnboardingWizardModal,
} from "@/components/onboarding";

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <OnboardingProvider>
            <div className="bg-base-300 p-6">{children}</div>
            <OnboardingWizardModal />
        </OnboardingProvider>
    );
}
