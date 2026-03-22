"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { BaselWizardModal, BaselAlertBox } from "@splits-network/basel-ui";
import { ModalPortal } from "@splits-network/shared-ui";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import type { Firm, PlacementType, TeamSizeRange } from "../../types";
import {
    EMPTY_FIRM_FORM,
    type FirmFormData,
} from "./wizard-steps/types";
import { StepBasics } from "./wizard-steps/step-basics";
import { StepSpecialization } from "./wizard-steps/step-specialization";
import { StepLocation } from "./wizard-steps/step-location";
import { StepContact } from "./wizard-steps/step-contact";
import { StepMarketplace } from "./wizard-steps/step-marketplace";

/* ─── Constants ──────────────────────────────────────────────────────────── */

const WIZARD_STEPS = [
    { label: "Basics", description: "Set your firm's name, URL slug, tagline, and description." },
    { label: "Specialization", description: "Define your recruiting focus — industries, specialties, and placement types." },
    { label: "Location", description: "Where your firm is headquartered and basic company details." },
    { label: "Contact", description: "Public contact information for your firm profile." },
    { label: "Marketplace", description: "Control how your firm appears on the Splits Network marketplace." },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */

/** Populate form state from an existing Firm record (edit mode) */
function firmToForm(firm: Firm): FirmFormData {
    return {
        name: firm.name,
        slug: firm.slug ?? "",
        slugManuallyEdited: true,
        tagline: firm.tagline ?? "",
        description: firm.description ?? "",
        industries: firm.industries ?? [],
        specialties: firm.specialties ?? [],
        placement_types: (firm.placement_types ?? []) as PlacementType[],
        geo_focus: firm.geo_focus ?? [],
        headquarters_city: firm.headquarters_city ?? "",
        headquarters_state: firm.headquarters_state ?? "",
        headquarters_country: firm.headquarters_country ?? "",
        founded_year: firm.founded_year ? String(firm.founded_year) : "",
        team_size_range: (firm.team_size_range ?? "") as TeamSizeRange | "",
        website_url: firm.website_url ?? "",
        linkedin_url: firm.linkedin_url ?? "",
        contact_email: firm.contact_email ?? "",
        contact_phone: firm.contact_phone ?? "",
        marketplace_visible: firm.marketplace_visible,
        candidate_firm: firm.candidate_firm,
        company_firm: firm.company_firm,
        show_member_count: firm.show_member_count,
        show_placement_stats: firm.show_placement_stats,
        show_contact_info: firm.show_contact_info,
    };
}

/** Build the PATCH body from form state */
function formToPayload(form: FirmFormData) {
    const currentYear = new Date().getFullYear();
    const foundedYear = form.founded_year ? Number(form.founded_year) : null;

    return {
        name: form.name.trim(),
        slug: form.slug.trim() || null,
        tagline: form.tagline.trim() || null,
        description: form.description.trim() || null,
        industries: form.industries,
        specialties: form.specialties,
        placement_types: form.placement_types,
        geo_focus: form.geo_focus,
        headquarters_city: form.headquarters_city.trim() || null,
        headquarters_state: form.headquarters_state.trim() || null,
        headquarters_country: form.headquarters_country.trim() || null,
        founded_year:
            foundedYear && foundedYear >= 1900 && foundedYear <= currentYear
                ? foundedYear
                : null,
        team_size_range: form.team_size_range || null,
        website_url: form.website_url.trim() || null,
        linkedin_url: form.linkedin_url.trim() || null,
        contact_email: form.contact_email.trim() || null,
        contact_phone: form.contact_phone.trim() || null,
        marketplace_visible: form.marketplace_visible,
        candidate_firm: form.candidate_firm,
        company_firm: form.company_firm,
        show_member_count: form.show_member_count,
        show_placement_stats: form.show_placement_stats,
        show_contact_info: form.show_contact_info,
    };
}

/* ─── Validation ─────────────────────────────────────────────────────────── */

function validateStep(step: number, form: FirmFormData): Record<string, string> {
    const errors: Record<string, string> = {};

    if (step === 0) {
        if (!form.name.trim()) errors.name = "Firm name is required";
        if (form.slug && !/^[a-z0-9-]+$/.test(form.slug)) {
            errors.slug = "Slug may only contain lowercase letters, numbers, and hyphens";
        }
    }

    if (step === 3) {
        if (form.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email)) {
            errors.contact_email = "Enter a valid email address";
        }
        if (
            form.website_url &&
            !/^https?:\/\/.+/.test(form.website_url)
        ) {
            errors.website_url = "URL must start with http:// or https://";
        }
        if (
            form.linkedin_url &&
            !/^https?:\/\/.+/.test(form.linkedin_url)
        ) {
            errors.linkedin_url = "URL must start with http:// or https://";
        }
    }

    return errors;
}

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface FirmProfileWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    /** When provided, wizard operates in edit mode for this firm */
    firm?: Firm;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * FirmProfileWizard — 5-step wizard for creating or editing a firm profile.
 *
 * Steps:
 *   1. Basics — name, slug, tagline, description
 *   2. Specialization — industries, specialties, placement types, geo focus
 *   3. Location — city, state, country, founded year, team size
 *   4. Contact — website, LinkedIn, email, phone
 *   5. Marketplace — 6 toggles for visibility and participation
 */
export function FirmProfileWizard({
    isOpen,
    onClose,
    onSuccess,
    firm,
}: FirmProfileWizardProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const isEditMode = Boolean(firm);

    const [currentStep, setCurrentStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [form, setForm] = useState<FirmFormData>(() =>
        firm ? firmToForm(firm) : EMPTY_FIRM_FORM,
    );

    /* Re-seed form when modal opens with a different firm */
    useEffect(() => {
        if (!isOpen) return;
        setForm(firm ? firmToForm(firm) : EMPTY_FIRM_FORM);
        setCurrentStep(0);
        setErrors({});
        setSubmitError(null);
    }, [isOpen, firm]);

    const handleChange = useCallback((updates: Partial<FirmFormData>) => {
        setForm((prev) => ({ ...prev, ...updates }));
    }, []);

    const handleNext = useCallback(() => {
        const stepErrors = validateStep(currentStep, form);
        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            return;
        }
        setErrors({});
        setCurrentStep((s) => Math.min(s + 1, WIZARD_STEPS.length - 1));
    }, [currentStep, form]);

    const handleBack = useCallback(() => {
        setErrors({});
        setCurrentStep((s) => Math.max(s - 1, 0));
    }, []);

    const handleStepClick = useCallback((index: number) => {
        setErrors({});
        setCurrentStep(index);
    }, []);

    const handleSubmit = useCallback(async () => {
        const stepErrors = validateStep(currentStep, form);
        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            return;
        }

        try {
            setSubmitting(true);
            setSubmitError(null);

            const token = await getToken();
            if (!token) throw new Error("Not authenticated");
            const client = createAuthenticatedClient(token);
            const payload = formToPayload(form);

            if (isEditMode && firm) {
                await client.patch(`/firms/${firm.id}`, payload);
                toast.success("Firm profile updated.");
            } else {
                await client.post("/firms", payload);
                toast.success("Firm created successfully.");
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setSubmitError(err.message || "Failed to save firm profile. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }, [currentStep, form, firm, isEditMode, getToken, onSuccess, onClose, toast]);

    const stepErrors = errors;

    return (
        <ModalPortal>
            <BaselWizardModal
                isOpen={isOpen}
                onClose={onClose}
                title={isEditMode ? "Edit Firm Profile" : "Create Firm Profile"}
                icon="fa-duotone fa-regular fa-building"
                accentColor="primary"
                steps={WIZARD_STEPS}
                currentStep={currentStep}
                onNext={handleNext}
                onBack={handleBack}
                onSubmit={handleSubmit}
                submitting={submitting}
                nextDisabled={currentStep === 0 && !form.name.trim()}
                nextLabel="Next"
                backLabel="Back"
                submitLabel={isEditMode ? "Save Changes" : "Create Firm"}
                submittingLabel={isEditMode ? "Saving..." : "Creating..."}
                cancelLabel="Cancel"
                showHelpPanel
                onStepClick={handleStepClick}
            >
                {/* Global submit error */}
                {submitError && (
                    <BaselAlertBox variant="error" className="mb-5">
                        {submitError}
                        <button
                            type="button"
                            className="text-xs underline ml-2"
                            onClick={() => setSubmitError(null)}
                        >
                            Dismiss
                        </button>
                    </BaselAlertBox>
                )}

                {/* Step content — each component is responsible for its own layout */}
                {currentStep === 0 && (
                    <StepBasics
                        form={form}
                        onChange={handleChange}
                        isEditMode={isEditMode}
                        errors={stepErrors}
                    />
                )}

                {currentStep === 1 && (
                    <StepSpecialization
                        form={form}
                        onChange={handleChange}
                        errors={stepErrors}
                    />
                )}

                {currentStep === 2 && (
                    <StepLocation
                        form={form}
                        onChange={handleChange}
                        errors={stepErrors}
                    />
                )}

                {currentStep === 3 && (
                    <StepContact
                        form={form}
                        onChange={handleChange}
                        errors={stepErrors}
                    />
                )}

                {currentStep === 4 && (
                    <StepMarketplace
                        form={form}
                        onChange={handleChange}
                        errors={stepErrors}
                    />
                )}
            </BaselWizardModal>
        </ModalPortal>
    );
}
