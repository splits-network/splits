"use client";

import React, { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { BaselWizardModal } from "@splits-network/basel-ui";
import { PermissionConfigurator } from "@/app/portal/invitation/shared/permission-configurator";
import { RecruiterCompanyAgreement } from "@/app/portal/invitation/shared/agreement-clauses";
import { DEFAULT_PERMISSIONS } from "@/app/portal/invitation/shared/types";
import type { RecruiterCompanyPermissions } from "@/app/portal/invitation/shared/types";
import type { RecruiterWithUser, Company } from "../../types";
import { getDisplayName, getInitials } from "../../types";

const WIZARD_STEPS = [
    { label: "The Recruiter" },
    { label: "Permissions" },
    { label: "Agreement" },
    { label: "Confirm & Send" },
];

interface InviteRecruiterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    recruiter: RecruiterWithUser;
    companies: Company[];
}

export default function InviteRecruiterModal({
    isOpen,
    onClose,
    onSuccess,
    recruiter,
    companies,
}: InviteRecruiterModalProps) {
    const { getToken } = useAuth();
    const toast = useToast();

    const displayName = getDisplayName(recruiter);
    const displayEmail = recruiter.users?.email || recruiter.email;
    const displayPhone = recruiter.phone;
    const initials = getInitials(displayName);

    const [currentStep, setCurrentStep] = useState(0);
    const [selectedCompanyId, setSelectedCompanyId] = useState(
        companies.length === 1 ? companies[0].id : "",
    );
    const [permissions, setPermissions] = useState<RecruiterCompanyPermissions>({
        ...DEFAULT_PERMISSIONS,
    });
    const [message, setMessage] = useState("");
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const selectedCompanyName =
        companies.find((c) => c.id === selectedCompanyId)?.name || "your company";

    const handleSubmit = async () => {
        if (!selectedCompanyId) {
            toast.error("Select a company to continue.");
            return;
        }
        if (!agreeTerms) {
            toast.error("Acknowledge the agreement to continue.");
            return;
        }

        try {
            setIsSubmitting(true);
            const token = await getToken();
            if (!token) {
                toast.error("Sign in to continue.");
                return;
            }

            const client = createAuthenticatedClient(token);
            await client.post("/recruiter-companies/invite", {
                company_id: selectedCompanyId,
                recruiter_id: recruiter.id,
                relationship_type: "recruiter",
                permissions,
                message: message.trim() || undefined,
            });

            onSuccess();
        } catch (err: any) {
            console.error("Failed to invite recruiter:", err);
            const errorMessage =
                err.response?.data?.error?.message ||
                err.response?.data?.error ||
                err.message ||
                "Failed to send invitation";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = () => {
        if (currentStep === 1 && !selectedCompanyId) {
            toast.error("Select a company to continue.");
            return;
        }
        setCurrentStep((s) => Math.min(s + 1, 3));
    };
    const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 0));

    const handleClose = () => {
        setCurrentStep(0);
        setAgreeTerms(false);
        setMessage("");
        onClose();
    };

    const isLastStep = currentStep === 3;
    const nextDisabled =
        isLastStep ? !agreeTerms || !selectedCompanyId : false;

    return (
        <BaselWizardModal
            isOpen={isOpen}
            onClose={handleClose}
            title="Invite Recruiter"
            icon="fa-duotone fa-regular fa-paper-plane"
            steps={WIZARD_STEPS}
            currentStep={currentStep}
            onNext={handleNext}
            onBack={handleBack}
            onSubmit={handleSubmit}
            submitting={isSubmitting}
            nextDisabled={nextDisabled}
            submitLabel="Send Invitation"
            submittingLabel="Sending..."
        >
            {/* Step 1: Review the Recruiter */}
            {currentStep === 0 && (
                <div>
                    <h4 className="text-lg font-black tracking-tight mb-1">
                        About the Recruiter
                    </h4>
                    <p className="text-sm text-base-content/50 mb-6">
                        Review this recruiter&apos;s profile before inviting
                        them to represent {selectedCompanyName}.
                    </p>

                    {/* Recruiter Card */}
                    <div className="flex items-start gap-5 bg-base-200 p-5 mb-6">
                        <div className="w-12 h-12 bg-primary text-primary-content flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-black">
                                {initials}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-black">
                                    {displayName}
                                </h3>
                                <a
                                    href={`/portal/recruiters?recruiterId=${recruiter.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="link link-primary text-sm"
                                >
                                    View Profile
                                </a>
                            </div>
                            <p className="text-sm text-base-content/60">
                                <span
                                    className={
                                        !recruiter.tagline
                                            ? "italic text-base-content/30"
                                            : ""
                                    }
                                >
                                    {recruiter.tagline || "No tagline provided"}
                                </span>
                            </p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-base-content/50">
                                <span>
                                    <i className="fa-duotone fa-regular fa-envelope mr-1" />
                                    {displayEmail}
                                </span>
                                <span>
                                    <i className="fa-duotone fa-regular fa-phone mr-1" />
                                    <span
                                        className={
                                            !displayPhone
                                                ? "italic text-base-content/30"
                                                : ""
                                        }
                                    >
                                        {displayPhone || "Not provided"}
                                    </span>
                                </span>
                            </div>
                            <p className="mt-3 text-sm text-base-content/70 leading-relaxed italic">
                                {recruiter.bio ||
                                    "This recruiter has not provided a bio."}
                            </p>
                        </div>
                    </div>

                    {/* What does inviting mean? */}
                    <h4 className="text-sm font-black uppercase tracking-wider text-base-content/50 mb-4">
                        What does inviting a recruiter mean?
                    </h4>
                    <div className="space-y-3">
                        {[
                            {
                                icon: "fa-duotone fa-regular fa-handshake",
                                title: "Formal Representation",
                                text: "This recruiter will officially represent your company as a recruiting partner on Splits Network.",
                            },
                            {
                                icon: "fa-duotone fa-regular fa-user-plus",
                                title: "Candidate Submissions",
                                text: "They can submit candidates to your open positions, creating tracked applications with full attribution.",
                            },
                            {
                                icon: "fa-duotone fa-regular fa-coins",
                                title: "Placement Fees",
                                text: "When a candidate they submit gets hired, they receive placement attribution and fees per your billing terms.",
                            },
                            {
                                icon: "fa-duotone fa-regular fa-shield-check",
                                title: "You Control Permissions",
                                text: "You decide their access level — which jobs they see, whether they can advance candidates, and if they can manage listings.",
                            },
                        ].map((item) => (
                            <div
                                key={item.title}
                                className="flex items-start gap-3 border-l-4 border-base-300 pl-4 py-1"
                            >
                                <i
                                    className={`${item.icon} text-primary mt-0.5`}
                                />
                                <div>
                                    <p className="text-sm font-bold">
                                        {item.title}
                                    </p>
                                    <p className="text-sm text-base-content/60 leading-relaxed">
                                        {item.text}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 2: Configure Permissions */}
            {currentStep === 1 && (
                <div>
                    <h4 className="text-lg font-black tracking-tight mb-1">
                        Configure Permissions
                    </h4>
                    <p className="text-sm text-base-content/50 mb-6">
                        Select the company and configure what{" "}
                        {displayName} will be able to do.
                    </p>

                    {/* Company Selection */}
                    <fieldset className="fieldset mb-6">
                        <legend className="fieldset-legend font-bold uppercase text-sm tracking-wider">
                            Company
                        </legend>
                        {companies.length === 1 ? (
                            <input
                                type="text"
                                className="input w-full"
                                value={companies[0].name}
                                disabled
                            />
                        ) : (
                            <select
                                className="select w-full"
                                value={selectedCompanyId}
                                onChange={(e) =>
                                    setSelectedCompanyId(e.target.value)
                                }
                                required
                            >
                                <option value="">
                                    Select a company...
                                </option>
                                {companies.map((company) => (
                                    <option
                                        key={company.id}
                                        value={company.id}
                                    >
                                        {company.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </fieldset>

                    {/* Permissions */}
                    <PermissionConfigurator
                        permissions={permissions}
                        onChange={setPermissions}
                        recruiterName={displayName}
                    />
                </div>
            )}

            {/* Step 3: Review Agreement */}
            {currentStep === 2 && (
                <div>
                    <h4 className="text-lg font-black tracking-tight mb-1">
                        Recruiter Relationship Agreement
                    </h4>
                    <p className="text-sm text-base-content/50 mb-6">
                        Read the agreement below carefully. It defines how{" "}
                        {displayName} will work with{" "}
                        {selectedCompanyName} and what both parties are
                        responsible for.
                    </p>
                    <RecruiterCompanyAgreement
                        recruiterName={displayName}
                        companyName={selectedCompanyName}
                        direction="company-to-recruiter"
                    />
                </div>
            )}

            {/* Step 4: Confirm & Send */}
            {currentStep === 3 && (
                <div>
                    <h4 className="text-lg font-black tracking-tight mb-1">
                        Confirm & Send Invitation
                    </h4>
                    <p className="text-sm text-base-content/50 mb-6">
                        Review the summary below, add an optional message, and
                        send the invitation.
                    </p>

                    {/* Summary */}
                    <div className="bg-base-200 p-4 mb-6 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <i className="fa-duotone fa-regular fa-user w-5 text-center text-base-content/40" />
                            <span className="font-bold">{displayName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <i className="fa-duotone fa-regular fa-building w-5 text-center text-base-content/40" />
                            <span>{selectedCompanyName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <i className="fa-duotone fa-regular fa-shield-check w-5 text-center text-base-content/40" />
                            <span>
                                {
                                    Object.values(permissions).filter(
                                        Boolean,
                                    ).length
                                }{" "}
                                of 6 permissions enabled
                            </span>
                        </div>
                    </div>

                    {/* Optional Message */}
                    <fieldset className="fieldset mb-6">
                        <legend className="fieldset-legend font-bold uppercase text-sm tracking-wider">
                            Personal Message (optional)
                        </legend>
                        <textarea
                            className="textarea w-full"
                            placeholder="Add a personal message to the invitation..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={3}
                            maxLength={500}
                        />
                        <label className="label">
                            <span className="text-sm text-base-content/40">
                                {message.length}/500 characters
                            </span>
                        </label>
                    </fieldset>

                    {/* Agreement Checkbox */}
                    <label
                        className={`flex items-start gap-3 p-4 border cursor-pointer transition-all ${
                            agreeTerms
                                ? "border-primary bg-primary/5"
                                : "border-base-300 bg-base-200"
                        }`}
                    >
                        <input
                            type="checkbox"
                            className="checkbox checkbox-primary mt-0.5"
                            checked={agreeTerms}
                            onChange={(e) =>
                                setAgreeTerms(e.target.checked)
                            }
                        />
                        <span className="text-sm text-base-content/80">
                            I have reviewed the recruiter relationship
                            agreement and I authorize{" "}
                            <strong>{displayName}</strong> to represent{" "}
                            <strong>{selectedCompanyName}</strong> with the
                            permissions configured above.
                        </span>
                    </label>
                </div>
            )}
        </BaselWizardModal>
    );
}
