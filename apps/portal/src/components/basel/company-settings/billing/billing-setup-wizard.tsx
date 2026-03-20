"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import {
    BaselFormField,
    BaselAlertBox,
    BaselWizardModal,
    WizardHelpZone,
} from "@splits-network/basel-ui";
import { ModalPortal } from "@splits-network/shared-ui";
import { BaselPaymentForm } from "./payment-form";

interface BillingProfile {
    billing_email: string;
    billing_terms: string;
    billing_contact_name: string | null;
    billing_address: Record<string, any> | null;
    stripe_tax_id: string | null;
    invoice_delivery_method: string;
}

interface BaselBillingSetupWizardProps {
    open: boolean;
    companyId: string;
    existingProfile?: BillingProfile | null;
    onComplete: () => void;
    onClose: () => void;
}

type Step = 0 | 1 | 2;

const WIZARD_STEPS = [
    { label: "Details", description: "Enter your company's billing email, contact, and mailing address." },
    { label: "Payment", description: "Add a credit card or bank account for placement fee invoices." },
    { label: "Done", description: "Review your billing configuration." },
];

export function BaselBillingSetupWizard({
    open,
    companyId,
    existingProfile,
    onComplete,
    onClose,
}: BaselBillingSetupWizardProps) {
    const { getToken } = useAuth();
    const [step, setStep] = useState<Step>(0);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Step 1 form state
    const [billingEmail, setBillingEmail] = useState(
        existingProfile?.billing_email || "",
    );
    const [billingContactName, setBillingContactName] = useState(
        existingProfile?.billing_contact_name || "",
    );
    const [billingTerms, setBillingTerms] = useState(
        existingProfile?.billing_terms || "net_30",
    );
    const [street, setStreet] = useState(
        existingProfile?.billing_address?.street || "",
    );
    const [city, setCity] = useState(
        existingProfile?.billing_address?.city || "",
    );
    const [state, setState] = useState(
        existingProfile?.billing_address?.state || "",
    );
    const [zip, setZip] = useState(existingProfile?.billing_address?.zip || "");
    const [country, setCountry] = useState(
        existingProfile?.billing_address?.country || "United States",
    );
    const [taxId, setTaxId] = useState(existingProfile?.stripe_tax_id || "");

    // Step 2 state
    const [paymentMethodSaved, setPaymentMethodSaved] = useState(false);
    const [skippedPayment, setSkippedPayment] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(false);

    // Fetch full profile from API when modal opens
    const loadProfile = useCallback(async () => {
        try {
            setLoadingProfile(true);
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const res = await client.get<{ data: BillingProfile | null }>(`/company-billing/${companyId}`);
            const p = res?.data;
            if (p) {
                setBillingEmail(p.billing_email || "");
                setBillingContactName(p.billing_contact_name || "");
                setBillingTerms(p.billing_terms || "net_30");
                setStreet(p.billing_address?.street || "");
                setCity(p.billing_address?.city || "");
                setState(p.billing_address?.state || "");
                setZip(p.billing_address?.zip || "");
                setCountry(p.billing_address?.country || "United States");
                setTaxId(p.stripe_tax_id || "");
            }
        } catch {
            // If profile doesn't exist yet, keep defaults
        } finally {
            setLoadingProfile(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyId]);

    // Reset form state when modal opens, then fetch latest from API
    useEffect(() => {
        if (!open) return;
        setStep(0);
        setError(null);
        setPaymentMethodSaved(false);
        setSkippedPayment(false);
        // Start with existingProfile (fast) then overwrite from API (accurate)
        setBillingEmail(existingProfile?.billing_email || "");
        setBillingContactName(existingProfile?.billing_contact_name || "");
        setBillingTerms(existingProfile?.billing_terms || "net_30");
        setStreet(existingProfile?.billing_address?.street || "");
        setCity(existingProfile?.billing_address?.city || "");
        setState(existingProfile?.billing_address?.state || "");
        setZip(existingProfile?.billing_address?.zip || "");
        setCountry(existingProfile?.billing_address?.country || "United States");
        setTaxId(existingProfile?.stripe_tax_id || "");
        loadProfile();
    }, [open, existingProfile, loadProfile]);

    const isImmediateBilling = billingTerms === "immediate";

    const handleSaveBillingDetails = async () => {
        if (!billingEmail.trim()) {
            setError("Billing email is required");
            return;
        }

        try {
            setSaving(true);
            setError(null);

            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);

            const billingAddress: Record<string, string> = {};
            if (street) billingAddress.street = street;
            if (city) billingAddress.city = city;
            if (state) billingAddress.state = state;
            if (zip) billingAddress.zip = zip;
            if (country) billingAddress.country = country;

            await client.post(`/company-billing/${companyId}`, {
                billing_email: billingEmail.trim(),
                billing_terms: billingTerms,
                billing_contact_name: billingContactName.trim() || null,
                billing_address:
                    Object.keys(billingAddress).length > 0
                        ? billingAddress
                        : null,
                stripe_tax_id: taxId.trim() || null,
                invoice_delivery_method: "email",
            });

            setStep(1);
        } catch (err: any) {
            console.error("Failed to save billing details:", err);
            setError(err.message || "Failed to save billing details");
        } finally {
            setSaving(false);
        }
    };

    const handlePaymentSuccess = () => {
        setPaymentMethodSaved(true);
        setStep(2);
    };

    const handleSkipPayment = () => {
        setSkippedPayment(true);
        setStep(2);
    };

    const handleNext = () => {
        if (step === 0) {
            handleSaveBillingDetails();
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep((step - 1) as Step);
        }
    };

    const handleStepClick = (index: number) => {
        if (index === 0) setStep(0 as Step);
    };

    /* ─── Step-specific footer for Step 1 (Details) ──────────────────────── */
    const detailsFooter = step === 0 ? (
        <div className="flex justify-between w-full">
            <button className="btn btn-ghost" onClick={onClose}>
                Cancel
            </button>
            <button
                className="btn btn-primary"
                onClick={handleNext}
                disabled={!billingEmail.trim() || saving}
            >
                {saving ? (
                    <>
                        <span className="loading loading-spinner loading-sm" />
                        Saving...
                    </>
                ) : (
                    <>
                        Continue
                        <i className="fa-duotone fa-regular fa-arrow-right" />
                    </>
                )}
            </button>
        </div>
    ) : undefined;

    /* ─── Step-specific footer for Step 2 (Payment has its own submit) ───── */
    const paymentFooter = step === 1 ? (
        <div className="flex justify-between w-full">
            <div className="flex gap-2">
                <button
                    className="btn btn-ghost"
                    onClick={handleBack}
                >
                    <i className="fa-duotone fa-regular fa-arrow-left" />
                    Back
                </button>
                {!isImmediateBilling && (
                    <button
                        className="btn btn-ghost"
                        onClick={handleSkipPayment}
                    >
                        Skip for now
                    </button>
                )}
            </div>
            <button
                type="submit"
                form="billing-payment-form"
                className="btn btn-primary"
            >
                <i className="fa-duotone fa-regular fa-credit-card" />
                Save Payment Method
            </button>
        </div>
    ) : undefined;

    /* ─── Step-specific footer for Step 3 (Done) ─────────────────────────── */
    const doneFooter = step === 2 ? (
        <div className="flex justify-end w-full">
            <button
                className="btn btn-primary"
                onClick={onComplete}
            >
                Done
                <i className="fa-duotone fa-regular fa-check ml-1" />
            </button>
        </div>
    ) : undefined;

    return (
        <ModalPortal>
        <BaselWizardModal
            isOpen={open}
            onClose={onClose}
            title="Set Up Company Billing"
            icon="fa-duotone fa-regular fa-credit-card"
            steps={WIZARD_STEPS}
            currentStep={step}
            onNext={handleNext}
            onBack={handleBack}
            onSubmit={onComplete}
            submitting={saving}
            nextDisabled={!billingEmail.trim()}
            nextLabel="Continue"
            submitLabel="Done"
            footer={detailsFooter || paymentFooter || doneFooter}
            showHelpPanel
            onStepClick={handleStepClick}
        >
            {loadingProfile && (
                <div className="flex items-center justify-center py-8">
                    <span className="loading loading-spinner loading-md" />
                    <span className="ml-3 text-sm text-base-content/40">Loading billing details...</span>
                </div>
            )}

            {!loadingProfile && error && (
                <BaselAlertBox variant="error" className="mb-4">
                    {error}
                    <button
                        className="text-xs underline ml-2"
                        onClick={() => setError(null)}
                    >
                        Dismiss
                    </button>
                </BaselAlertBox>
            )}

            {/* Step 1: Billing Details */}
            {!loadingProfile && step === 0 && (
                <div className="space-y-4">
                    <p className="text-sm text-base-content/50">
                        Enter your company&apos;s billing information.
                    </p>

                    <WizardHelpZone
                        title="Billing Email"
                        description="Where placement invoices and billing notifications will be sent."
                        tips={["Use a shared billing inbox if possible", "This can be different from your account email"]}
                    >
                        <BaselFormField label="Billing Email" required>
                            <input
                                type="email"
                                className="input input-bordered w-full"
                                value={billingEmail}
                                onChange={(e) => setBillingEmail(e.target.value)}
                                placeholder="billing@company.com"
                                required
                            />
                        </BaselFormField>
                    </WizardHelpZone>

                    <WizardHelpZone
                        title="Billing Contact"
                        description="The person responsible for processing placement invoices."
                    >
                        <BaselFormField label="Billing Contact Name">
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                value={billingContactName}
                                onChange={(e) =>
                                    setBillingContactName(e.target.value)
                                }
                                placeholder="Jane Smith"
                            />
                        </BaselFormField>
                    </WizardHelpZone>

                    <WizardHelpZone
                        title="Payment Terms"
                        description="How quickly placement invoices must be paid after a successful hire."
                        tips={["Net 30 is the most common choice", "Immediate billing charges your card automatically on placement confirmation", "A 3% processing fee applies to all placement invoices"]}
                    >
                        <BaselFormField label="Payment Terms" required>
                            <select
                                className="select w-full"
                                value={billingTerms}
                                onChange={(e) => setBillingTerms(e.target.value)}
                                required
                            >
                                <option value="immediate">
                                    Immediate (Charge on completion)
                                </option>
                                <option value="net_30">Net 30</option>
                                <option value="net_60">Net 60</option>
                                <option value="net_90">Net 90</option>
                            </select>
                        </BaselFormField>

                        <p className="text-sm text-base-content/50 flex items-start gap-2 mt-2">
                            <i className="fa-duotone fa-regular fa-circle-info text-info mt-0.5 shrink-0" />
                            A 3% processing fee is applied to all placement invoices to cover payment processing costs.
                        </p>
                    </WizardHelpZone>

                    <WizardHelpZone
                        title="Billing Address"
                        description="The mailing address for your company. Used on invoices and for tax purposes."
                    >
                        <BaselFormField label="Street Address">
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                value={street}
                                onChange={(e) => setStreet(e.target.value)}
                                placeholder="123 Main Street"
                            />
                        </BaselFormField>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <BaselFormField label="City">
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="New York"
                                />
                            </BaselFormField>

                            <BaselFormField label="State">
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    placeholder="NY"
                                />
                            </BaselFormField>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <BaselFormField label="ZIP">
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={zip}
                                    onChange={(e) => setZip(e.target.value)}
                                    placeholder="10001"
                                />
                            </BaselFormField>

                            <BaselFormField label="Country">
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    placeholder="United States"
                                />
                            </BaselFormField>
                        </div>
                    </WizardHelpZone>

                    <WizardHelpZone
                        title="Tax ID"
                        description="Your company's Employer Identification Number (EIN). Optional but recommended for invoice accuracy."
                    >
                        <BaselFormField label="Tax ID (EIN)" hint="Optional">
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                value={taxId}
                                onChange={(e) => setTaxId(e.target.value)}
                                placeholder="12-3456789"
                            />
                        </BaselFormField>
                    </WizardHelpZone>
                </div>
            )}

            {/* Step 2: Payment Method */}
            {step === 1 && (
                <div className="space-y-4">
                    <p className="text-sm text-base-content/50">
                        {isImmediateBilling
                            ? "A payment method is required for immediate billing. Placement fees will be charged automatically."
                            : "Add a payment method to ensure invoices are paid on time. You can also skip and pay via the invoice link sent to your email."}
                    </p>

                    <BaselPaymentForm
                        companyId={companyId}
                        onSuccess={handlePaymentSuccess}
                        submitButtonText="Save Payment Method"
                        formId="billing-payment-form"
                        hideActions
                        billingDetails={{
                            name: billingContactName || undefined,
                            email: billingEmail || undefined,
                            address: {
                                line1: street || undefined,
                                city: city || undefined,
                                state: state || undefined,
                                postal_code: zip || undefined,
                                country: country || undefined,
                            },
                        }}
                    />
                </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 2 && (
                <div className="space-y-4">
                    <div className="text-center py-4">
                        <div className="text-5xl text-success mb-4">
                            <i className="fa-duotone fa-regular fa-circle-check" />
                        </div>
                        <h3 className="text-xl font-black tracking-tight mb-2">
                            Billing is set up!
                        </h3>
                    </div>

                    <div className="bg-base-200 border border-base-300 p-4 space-y-0">
                        <div className="flex items-center justify-between py-2 border-b border-base-300">
                            <span className="text-sm text-base-content/60">
                                Billing Email
                            </span>
                            <span className="text-sm font-semibold">
                                {billingEmail}
                            </span>
                        </div>
                        {billingContactName && (
                            <div className="flex items-center justify-between py-2 border-b border-base-300">
                                <span className="text-sm text-base-content/60">
                                    Contact
                                </span>
                                <span className="text-sm font-semibold">
                                    {billingContactName}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center justify-between py-2 border-b border-base-300">
                            <span className="text-sm text-base-content/60">
                                Payment Terms
                            </span>
                            <span className="text-sm font-semibold">
                                {billingTerms === "immediate"
                                    ? "Immediate"
                                    : billingTerms
                                          .replace("_", " ")
                                          .replace(/\b\w/g, (l) =>
                                              l.toUpperCase(),
                                          )}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-base-300">
                            <span className="text-sm text-base-content/60">
                                Payment Method
                            </span>
                            <span className="text-sm font-semibold">
                                {paymentMethodSaved
                                    ? "Saved"
                                    : skippedPayment
                                      ? "Skipped \u2014 pay via invoice link"
                                      : "\u2014"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-base-content/60">
                                Processing Fee
                            </span>
                            <span className="text-sm font-semibold">
                                3% on all placements
                            </span>
                        </div>
                    </div>

                    <div className="bg-base-200 border border-base-300 p-4">
                        <h4 className="font-bold text-sm mb-3">
                            How invoicing works:
                        </h4>
                        <ul className="text-sm text-base-content/50 space-y-2">
                            <li className="flex items-start gap-2">
                                <i className="fa-duotone fa-regular fa-check text-success mt-0.5" />
                                When a placement is confirmed, an invoice is
                                generated
                            </li>
                            <li className="flex items-start gap-2">
                                <i className="fa-duotone fa-regular fa-check text-success mt-0.5" />
                                Invoices are sent to your billing email
                            </li>
                            <li className="flex items-start gap-2">
                                <i className="fa-duotone fa-regular fa-check text-success mt-0.5" />
                                Payment is due within your billing terms
                            </li>
                            <li className="flex items-start gap-2">
                                <i className="fa-duotone fa-regular fa-check text-success mt-0.5" />
                                A 3% processing fee is included on each invoice
                                to cover payment processing
                            </li>
                            <li className="flex items-start gap-2">
                                <i className="fa-duotone fa-regular fa-check text-success mt-0.5" />
                                You can manage payment methods and view invoices
                                on the billing dashboard
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </BaselWizardModal>
        </ModalPortal>
    );
}
