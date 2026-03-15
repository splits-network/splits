"use client";

import { useRouter } from "next/navigation";
import { WizardShell } from "../../../invitation/shared/wizard-shell";
import type { WizardStep } from "../../../invitation/shared/types";
import StepReviewCandidate from "./step-review-candidate";
import StepOfferDetails from "./step-offer-details";
import StepFinancialImpact from "./step-financial-impact";
import StepConfirm from "./step-confirm";
import OfferSidebar from "./offer-sidebar";
import OfferExtended from "./offer-extended";
import { useOfferWizard } from "./use-offer-wizard";

const STEPS: WizardStep[] = [
    { num: "01", label: "Review Candidate", icon: "fa-user" },
    { num: "02", label: "Offer Details", icon: "fa-file-contract" },
    { num: "03", label: "Financial Impact", icon: "fa-calculator" },
    { num: "04", label: "Confirm & Extend", icon: "fa-check-circle" },
];

export default function OfferClient({ applicationId }: { applicationId: string }) {
    const router = useRouter();
    const w = useOfferWizard(applicationId);

    // Loading state
    if (w.loading) {
        return (
            <main className="min-h-[70vh] flex items-center justify-center">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-primary" />
                    <p className="mt-4 text-base-content/70">Loading application...</p>
                </div>
            </main>
        );
    }

    // Error state (application not found or wrong stage)
    if (w.error && (!w.application || w.application.stage !== "interview")) {
        return (
            <main className="min-h-[70vh] flex items-center justify-center p-6">
                <div className="bg-base-200 border-l-4 border-error p-8 max-w-md w-full">
                    <div className="flex items-start gap-4">
                        <i className="fa-duotone fa-regular fa-triangle-exclamation text-error text-2xl mt-1" />
                        <div>
                            <h1 className="text-xl font-black mb-2">Unable to Extend Offer</h1>
                            <p className="text-sm text-base-content/60 leading-relaxed">{w.error}</p>
                            <button
                                onClick={() => router.push("/portal/applications")}
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

    // Celebration page after successful submission
    if (w.completed) {
        return (
            <OfferExtended
                candidateName={w.application.candidate?.full_name || "Candidate"}
                jobTitle={w.application.job?.title || "Position"}
                companyName={w.application.job?.company?.name || "Company"}
                salary={parseFloat(w.salary) || 0}
                applicationId={applicationId}
            />
        );
    }

    const candidateName = w.application.candidate?.full_name || "Candidate";
    const jobTitle = w.application.job?.title || "the position";

    return (
        <WizardShell
            kicker="Extend Formal Offer"
            title={
                <>
                    <span className="inline-block">Extend a</span>{" "}
                    <span className="inline-block text-primary">formal offer</span>{" "}
                    <span className="inline-block">to {candidateName.split(" ")[0]}</span>
                </>
            }
            subtitle={`Review the candidate profile, configure offer details, and extend a formal offer for the ${jobTitle} position.`}
            steps={STEPS}
            currentStep={w.currentStep}
            onStepClick={w.setCurrentStep}
            sidebar={
                <OfferSidebar
                    application={w.application}
                    steps={STEPS}
                    currentStep={w.currentStep}
                />
            }
        >
            {w.currentStep === 0 && <StepReviewCandidate application={w.application} />}

            {w.currentStep === 1 && (
                <StepOfferDetails
                    salary={w.salary}
                    setSalary={w.setSalary}
                    startDate={w.startDate}
                    setStartDate={w.setStartDate}
                    notes={w.notes}
                    setNotes={w.setNotes}
                    showDocUpload={w.showDocUpload}
                    setShowDocUpload={w.setShowDocUpload}
                    stagedDocuments={w.stagedDocuments}
                    setStagedDocuments={w.setStagedDocuments}
                    applicationId={applicationId}
                />
            )}

            {w.currentStep === 2 && (
                <StepFinancialImpact
                    salary={w.salary}
                    startDate={w.startDate}
                    feePercentage={w.feePercentage}
                    guaranteeDays={w.guaranteeDays}
                />
            )}

            {w.currentStep === 3 && (
                <StepConfirm
                    application={w.application}
                    salary={w.salary}
                    startDate={w.startDate}
                    feePercentage={w.feePercentage}
                    agreeTerms={w.agreeTerms}
                    setAgreeTerms={w.setAgreeTerms}
                    processing={w.processing}
                    error={w.submitError}
                    onSubmit={w.handleSubmit}
                />
            )}

            {/* Bottom Navigation */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-base-300">
                <button
                    onClick={w.handleBack}
                    disabled={w.currentStep === 0}
                    className="btn btn-ghost btn-sm disabled:opacity-30"
                    style={{ borderRadius: 0 }}
                >
                    <i className="fa-duotone fa-regular fa-arrow-left" /> Back
                </button>
                {w.currentStep < 3 && (
                    <button
                        onClick={w.handleNext}
                        disabled={!w.canContinue}
                        className="btn btn-primary btn-sm"
                        style={{ borderRadius: 0 }}
                    >
                        Continue <i className="fa-duotone fa-regular fa-arrow-right" />
                    </button>
                )}
            </div>
        </WizardShell>
    );
}
