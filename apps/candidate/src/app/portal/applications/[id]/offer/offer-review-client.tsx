"use client";

import { useRouter } from "next/navigation";
import { useOfferReview } from "./use-offer-review";
import StepReviewOffer from "./step-review-offer";
import StepReviewDocuments from "./step-review-documents";
import StepAccept from "./step-accept";
import OfferAccepted from "./offer-accepted";
import OfferSidebar from "./offer-sidebar";

interface WizardStep {
    num: string;
    label: string;
    icon: string;
}

export default function OfferReviewClient({
    applicationId,
}: {
    applicationId: string;
}) {
    const router = useRouter();
    const w = useOfferReview(applicationId);

    // Loading
    if (w.loading) {
        return (
            <main className="min-h-[70vh] flex items-center justify-center">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-primary" />
                    <p className="mt-4 text-base-content/70">
                        Loading your offer...
                    </p>
                </div>
            </main>
        );
    }

    // Error
    if (w.error && !w.application) {
        return (
            <main className="min-h-[70vh] flex items-center justify-center p-6">
                <div className="bg-base-200 border-l-4 border-error p-8 max-w-md w-full">
                    <div className="flex items-start gap-4">
                        <i className="fa-duotone fa-regular fa-triangle-exclamation text-error text-2xl mt-1" />
                        <div>
                            <h1 className="text-xl font-black mb-2">
                                Offer Not Available
                            </h1>
                            <p className="text-sm text-base-content/60 leading-relaxed">
                                {w.error}
                            </p>
                            <button
                                onClick={() =>
                                    router.push("/portal/applications")
                                }
                                className="btn btn-primary btn-sm mt-4"
                                style={{ borderRadius: 0 }}
                            >
                                Back to Applications
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (!w.application) return null;

    // Success state
    if (w.accepted) {
        return <OfferAccepted application={w.application} />;
    }

    // Wrong stage but application loaded
    if (w.error) {
        return (
            <main className="min-h-[70vh] flex items-center justify-center p-6">
                <div className="bg-base-200 border-l-4 border-warning p-8 max-w-md w-full">
                    <div className="flex items-start gap-4">
                        <i className="fa-duotone fa-regular fa-triangle-exclamation text-warning text-2xl mt-1" />
                        <div>
                            <h1 className="text-xl font-black mb-2">
                                Offer Not Available
                            </h1>
                            <p className="text-sm text-base-content/60 leading-relaxed">
                                {w.error}
                            </p>
                            <button
                                onClick={() =>
                                    router.push("/portal/applications")
                                }
                                className="btn btn-primary btn-sm mt-4"
                                style={{ borderRadius: 0 }}
                            >
                                Back to Applications
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    // Build steps dynamically based on whether there are documents
    const steps: WizardStep[] = [
        { num: "01", label: "Review Offer", icon: "fa-file-contract" },
    ];

    if (w.totalSteps === 3) {
        steps.push({
            num: "02",
            label: "Documents",
            icon: "fa-file-lines",
        });
    }

    steps.push({
        num: String(w.totalSteps).padStart(2, "0"),
        label: "Accept",
        icon: "fa-check-circle",
    });

    const candidateName =
        w.application.candidate?.full_name?.split(" ")[0] || "there";
    const company =
        w.application.job?.company?.name || "the company";

    return (
        <main>
            {/* Hero Header */}
            <section className="relative bg-base-300 text-base-content py-12 lg:py-16">
                <div
                    className="absolute top-0 right-0 w-1/3 h-full bg-success/10"
                    style={{
                        clipPath:
                            "polygon(20% 0,100% 0,100% 100%,0% 100%)",
                    }}
                />
                <div className="relative container mx-auto px-6 lg:px-12">
                    <div className="max-w-3xl">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                            Offer Review
                        </p>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.92] tracking-tight mb-4">
                            <span className="inline-block">
                                {candidateName},
                            </span>{" "}
                            <span className="inline-block">you have a</span>{" "}
                            <span className="inline-block text-success">
                                job offer
                            </span>{" "}
                            <span className="inline-block">
                                from {company}
                            </span>
                        </h1>
                        <p className="text-base text-base-content/50 max-w-xl">
                            Take your time to review the offer details,
                            documents, and accept when you're ready.
                        </p>
                    </div>
                </div>
            </section>

            {/* Step Indicators */}
            <section className="bg-base-200 border-b border-base-300">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex overflow-x-auto">
                        {steps.map((step, i) => (
                            <button
                                key={step.num}
                                onClick={() => {
                                    if (i < w.currentStep) w.setCurrentStep(i);
                                }}
                                className={`flex items-center gap-3 px-6 py-4 border-b-2 transition-all text-sm font-semibold whitespace-nowrap ${
                                    i === w.currentStep
                                        ? "border-primary text-primary"
                                        : i < w.currentStep
                                          ? "border-success text-success cursor-pointer"
                                          : "border-transparent text-base-content/30"
                                }`}
                            >
                                <span
                                    className={`w-7 h-7 flex items-center justify-center text-xs font-bold ${
                                        i === w.currentStep
                                            ? "bg-primary text-primary-content"
                                            : i < w.currentStep
                                              ? "bg-success text-success-content"
                                              : "bg-base-300 text-base-content/40"
                                    }`}
                                >
                                    {i < w.currentStep ? (
                                        <i className="fa-duotone fa-regular fa-check text-sm" />
                                    ) : (
                                        step.num
                                    )}
                                </span>
                                <span className="hidden sm:inline">
                                    {step.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Wizard Content */}
            <section className="container mx-auto px-6 lg:px-12 py-10 lg:py-14">
                <div className="grid lg:grid-cols-5 gap-10 lg:gap-16">
                    <div className="lg:col-span-3">
                        {w.currentStep === 0 && (
                            <StepReviewOffer application={w.application} />
                        )}

                        {w.totalSteps === 3 && w.currentStep === 1 && (
                            <StepReviewDocuments
                                application={w.application}
                            />
                        )}

                        {w.currentStep === w.totalSteps - 1 && (
                            <StepAccept
                                application={w.application}
                                processing={w.processing}
                                onAccept={w.handleAccept}
                            />
                        )}

                        {/* Bottom navigation */}
                        {w.currentStep < w.totalSteps - 1 && (
                            <div className="flex items-center justify-between mt-10 pt-6 border-t border-base-300">
                                <button
                                    onClick={w.handleBack}
                                    disabled={w.currentStep === 0}
                                    className="btn btn-ghost btn-sm disabled:opacity-30"
                                    style={{ borderRadius: 0 }}
                                >
                                    <i className="fa-duotone fa-regular fa-arrow-left" />{" "}
                                    Back
                                </button>
                                <button
                                    onClick={w.handleNext}
                                    className="btn btn-primary btn-sm"
                                    style={{ borderRadius: 0 }}
                                >
                                    Continue{" "}
                                    <i className="fa-duotone fa-regular fa-arrow-right" />
                                </button>
                            </div>
                        )}

                        {w.currentStep === w.totalSteps - 1 &&
                            w.currentStep > 0 && (
                                <div className="mt-6">
                                    <button
                                        onClick={w.handleBack}
                                        className="btn btn-ghost btn-sm"
                                        style={{ borderRadius: 0 }}
                                    >
                                        <i className="fa-duotone fa-regular fa-arrow-left" />{" "}
                                        Back
                                    </button>
                                </div>
                            )}
                    </div>
                    <div className="lg:col-span-2">
                        <OfferSidebar
                            application={w.application}
                            currentStep={w.currentStep}
                        />
                    </div>
                </div>
            </section>
        </main>
    );
}
