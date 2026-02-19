"use client";

import { Suspense } from "react";
import { OnboardingPage } from "./onboarding-page";

function LoadingFallback() {
    return (
        <div className="fixed inset-0 z-50 bg-neutral flex items-center justify-center">
            <div className="text-center">
                <div className="w-14 h-14 bg-primary text-primary-content flex items-center justify-center font-black text-xl mx-auto mb-4">
                    S
                </div>
                <span className="loading loading-spinner loading-lg text-primary" />
                <p className="text-neutral-content/40 text-sm mt-4">
                    Loading...
                </p>
            </div>
        </div>
    );
}

export default function OnboardingRoute() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <OnboardingPage />
        </Suspense>
    );
}
