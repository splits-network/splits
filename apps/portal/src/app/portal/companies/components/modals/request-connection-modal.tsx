"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { BaselWizardModal } from "@splits-network/basel-ui";
import type { Company } from "../../types";

const STEPS = [
    { label: "What This Means" },
    { label: "Your Message" },
    { label: "Confirm & Submit" },
];

interface RequestRepresentationModalProps {
    isOpen: boolean;
    onClose: () => void;
    company: Company;
    onSuccess: () => void;
}

export default function RequestRepresentationModal({
    isOpen,
    onClose,
    company,
    onSuccess,
}: RequestRepresentationModalProps) {
    const { getToken } = useAuth();
    const toast = useToast();

    const [currentStep, setCurrentStep] = useState(0);
    const [acknowledged, setAcknowledged] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleClose = () => {
        if (submitting) return;
        setCurrentStep(0);
        setAcknowledged(false);
        setConfirmed(false);
        setMessage("");
        onClose();
    };

    const handleNext = () => setCurrentStep((s) => Math.min(s + 1, 2));
    const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 0));

    const handleSubmit = useCallback(async () => {
        setSubmitting(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");
            const client = createAuthenticatedClient(token);

            await client.post("/recruiter-companies/request-connection", {
                company_id: company.id,
                message: message.trim() || undefined,
            });

            toast.success("Representation request sent.");
            setCurrentStep(0);
            setAcknowledged(false);
            setConfirmed(false);
            setMessage("");
            onSuccess();
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.error?.message ||
                err?.message ||
                "Failed to send representation request";
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [company.id, message, toast]);

    return (
        <BaselWizardModal
            isOpen={isOpen}
            onClose={handleClose}
            title="Request to Represent"
            icon="fa-duotone fa-regular fa-handshake"
            accentColor="warning"
            steps={STEPS}
            currentStep={currentStep}
            onNext={handleNext}
            onBack={handleBack}
            onSubmit={handleSubmit}
            submitting={submitting}
            nextDisabled={currentStep === 0 && !acknowledged}
            submitLabel="Submit Request"
            submittingLabel="Submitting..."
            maxWidth="max-w-xl"
            footer={
                currentStep === 2 ? (
                    <>
                        <div>
                            <button
                                onClick={handleBack}
                                className="btn btn-ghost"
                                disabled={submitting}
                            >
                                <i className="fa-duotone fa-regular fa-arrow-left" />
                                Back
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleClose}
                                className="btn btn-ghost"
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="btn btn-primary"
                                disabled={!confirmed || submitting}
                            >
                                {submitting ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-duotone fa-regular fa-paper-plane" />
                                        Submit Request
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                ) : undefined
            }
        >
            {/* Step 1: What This Means */}
            {currentStep === 0 && (
                <div>
                    <p className="text-sm text-base-content/70 mb-6">
                        You are requesting to represent{" "}
                        <strong className="text-base-content">
                            {company.name}
                        </strong>{" "}
                        as a recruiting partner on Splits Network.
                    </p>

                    <div className="p-4 border-l-4 border-warning bg-warning/5 mb-6">
                        <p className="text-sm font-bold text-base-content mb-3">
                            <i className="fa-duotone fa-regular fa-triangle-exclamation text-warning mr-2" />
                            This is a formal business relationship
                        </p>
                        <div className="space-y-3">
                            {[
                                {
                                    icon: "fa-duotone fa-regular fa-coins",
                                    text: (
                                        <>
                                            You may earn{" "}
                                            <strong>placement fees</strong> for
                                            candidates you submit who get hired
                                            — this creates financial obligations
                                            for the company
                                        </>
                                    ),
                                },
                                {
                                    icon: "fa-duotone fa-regular fa-id-badge",
                                    text: (
                                        <>
                                            Your{" "}
                                            <strong>
                                                professional profile
                                            </strong>{" "}
                                            will be shared with the
                                            company&apos;s administrators for
                                            review
                                        </>
                                    ),
                                },
                                {
                                    icon: "fa-duotone fa-regular fa-sliders",
                                    text: (
                                        <>
                                            The company controls your{" "}
                                            <strong>permissions</strong> — what
                                            you can view, submit, and manage
                                        </>
                                    ),
                                },
                                {
                                    icon: "fa-duotone fa-regular fa-scale-balanced",
                                    text: (
                                        <>
                                            You will be bound by the{" "}
                                            <strong>
                                                Recruiter Relationship Agreement
                                            </strong>
                                            , including confidentiality and
                                            non-solicitation terms
                                        </>
                                    ),
                                },
                                {
                                    icon: "fa-duotone fa-regular fa-building",
                                    text: (
                                        <>
                                            Your reputation on the platform is
                                            tied to your conduct —{" "}
                                            <strong>
                                                poor candidate submissions or
                                                unprofessional behavior
                                            </strong>{" "}
                                            can result in relationship
                                            termination
                                        </>
                                    ),
                                },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="flex items-start gap-3"
                                >
                                    <i
                                        className={`${item.icon} text-warning/70 mt-0.5 w-4 text-center shrink-0`}
                                    />
                                    <p className="text-sm text-base-content/70 leading-relaxed">
                                        {item.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Acknowledgment checkbox */}
                    <label
                        className={`flex items-start gap-3 p-4 border cursor-pointer transition-all ${
                            acknowledged
                                ? "border-warning bg-warning/5"
                                : "border-base-300 bg-base-200"
                        }`}
                    >
                        <input
                            type="checkbox"
                            className="checkbox checkbox-warning mt-0.5"
                            checked={acknowledged}
                            onChange={(e) => setAcknowledged(e.target.checked)}
                        />
                        <span className="text-sm text-base-content/80">
                            I understand that this is a{" "}
                            <strong>formal business relationship</strong> with
                            financial and professional obligations, not a social
                            connection.
                        </span>
                    </label>
                </div>
            )}

            {/* Step 2: Your Message */}
            {currentStep === 1 && (
                <div>
                    <p className="text-sm text-base-content/70 mb-6">
                        The following request will be sent to{" "}
                        <strong className="text-base-content">
                            {company.name}
                        </strong>
                        &apos;s administrators. You can add a personal note
                        below.
                    </p>

                    {/* Standard request message (read-only) */}
                    <div className="bg-base-200 p-4 border-l-4 border-primary mb-6">
                        <p className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2">
                            Standard Request
                        </p>
                        <p className="text-sm text-base-content/70 leading-relaxed">
                            I am requesting to represent{" "}
                            <strong>{company.name}</strong> as a recruiting
                            partner on Splits Network. If accepted, I understand
                            that {company.name} will set my access permissions
                            and that successful placements may generate fees per
                            your company&apos;s billing terms.
                        </p>
                    </div>

                    {/* Personal note */}
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend font-bold uppercase text-xs tracking-wider">
                            Personal Note (optional)
                        </legend>
                        <textarea
                            className="textarea w-full"
                            style={{ borderRadius: 0 }}
                            placeholder="Introduce yourself, your specialties, relevant experience, and why you'd like to represent this company..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={500}
                            rows={4}
                        />
                        <label className="label">
                            <span className="text-sm text-base-content/40">
                                {message.length}/500 characters
                            </span>
                        </label>
                    </fieldset>
                </div>
            )}

            {/* Step 3: Confirm & Submit */}
            {currentStep === 2 && (
                <div>
                    <p className="text-sm text-base-content/70 mb-6">
                        Review your request before submitting.
                    </p>

                    {/* Summary */}
                    <div className="space-y-4">
                        <div className="bg-base-200 p-4">
                            <p className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2">
                                Requesting to represent
                            </p>
                            <p className="text-sm font-bold">
                                <i className="fa-duotone fa-regular fa-building text-primary mr-2" />
                                {company.name}
                            </p>
                        </div>

                        {message.trim() && (
                            <div className="bg-base-200 p-4">
                                <p className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2">
                                    Your personal note
                                </p>
                                <p className="text-sm text-base-content/70 leading-relaxed">
                                    {message.trim()}
                                </p>
                            </div>
                        )}

                        <div className="bg-base-200 p-4">
                            <p className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2">
                                What happens next
                            </p>
                            <ul className="text-sm text-base-content/70 space-y-2">
                                <li className="flex items-start gap-2">
                                    <i className="fa-duotone fa-regular fa-envelope text-primary mt-0.5 shrink-0" />
                                    <span>
                                        The company&apos;s administrators will
                                        receive your request via email
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <i className="fa-duotone fa-regular fa-clock text-primary mt-0.5 shrink-0" />
                                    <span>
                                        Your request will appear as &ldquo;Awaiting
                                        Review&rdquo; until they respond
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <i className="fa-duotone fa-regular fa-sliders text-primary mt-0.5 shrink-0" />
                                    <span>
                                        If accepted, the company will set your
                                        permissions and the relationship becomes
                                        active
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Final confirmation checkbox */}
                    <label
                        className={`flex items-start gap-3 p-4 border cursor-pointer transition-all mt-6 ${
                            confirmed
                                ? "border-primary bg-primary/5"
                                : "border-base-300 bg-base-200"
                        }`}
                    >
                        <input
                            type="checkbox"
                            className="checkbox checkbox-primary mt-0.5"
                            checked={confirmed}
                            onChange={(e) => setConfirmed(e.target.checked)}
                        />
                        <span className="text-sm text-base-content/80">
                            I confirm that I want to request to represent{" "}
                            <strong>{company.name}</strong> and I understand
                            this creates a formal business relationship with
                            financial and professional obligations.
                        </span>
                    </label>
                </div>
            )}
        </BaselWizardModal>
    );
}
