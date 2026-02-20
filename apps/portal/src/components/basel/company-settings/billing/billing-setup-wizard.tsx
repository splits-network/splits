"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { BaselFormField, BaselStepIndicator } from "@splits-network/basel-ui";
import { ButtonLoading } from "@splits-network/shared-ui";
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

export function BaselBillingSetupWizard({
    open,
    companyId,
    existingProfile,
    onComplete,
    onClose,
}: BaselBillingSetupWizardProps) {
    return (
        <div className="drawer drawer-end">
            <input
                id="billing-setup-drawer"
                type="checkbox"
                className="drawer-toggle"
                checked={open}
                readOnly
            />

            <div className="drawer-side z-50">
                <label
                    className="drawer-overlay"
                    onClick={onClose}
                    aria-label="Close drawer"
                />

                <div className="bg-base-100 min-h-full w-full md:w-2/3 lg:w-1/2 xl:w-2/5 flex flex-col">
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 p-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-black text-lg tracking-tight flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-credit-card" />
                                Set Up Company Billing
                            </h2>
                            <button
                                className="btn btn-sm btn-ghost"
                                onClick={onClose}
                            >
                                <i className="fa-duotone fa-regular fa-xmark" />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {open && (
                            <WizardContent
                                companyId={companyId}
                                existingProfile={existingProfile}
                                onComplete={onComplete}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

type Step = 1 | 2 | 3;

const STEP_DEFS = [
    { num: "01", label: "Details" },
    { num: "02", label: "Payment" },
    { num: "03", label: "Done" },
];

function WizardContent({
    companyId,
    existingProfile,
    onComplete,
}: {
    companyId: string;
    existingProfile?: BillingProfile | null;
    onComplete: () => void;
}) {
    const { getToken } = useAuth();
    const [step, setStep] = useState<Step>(1);
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

            await client.post(`/company-billing-profiles/${companyId}`, {
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

            setStep(2);
        } catch (err: any) {
            console.error("Failed to save billing details:", err);
            setError(err.message || "Failed to save billing details");
        } finally {
            setSaving(false);
        }
    };

    const handlePaymentSuccess = () => {
        setPaymentMethodSaved(true);
        setStep(3);
    };

    const handleSkipPayment = () => {
        setSkippedPayment(true);
        setStep(3);
    };

    return (
        <div className="space-y-4">
            {/* Step indicator */}
            <BaselStepIndicator
                steps={STEP_DEFS}
                currentStep={step - 1}
                onStepClick={(i) => {
                    if (i < step - 1) setStep((i + 1) as Step);
                }}
            />

            {error && (
                <div className="bg-error/5 border border-error/20 p-4">
                    <p className="text-sm font-semibold text-error">
                        {error}
                    </p>
                    <button
                        className="text-xs text-error underline mt-1"
                        onClick={() => setError(null)}
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Step 1: Billing Details */}
            {step === 1 && (
                <div className="space-y-4">
                    <p className="text-sm text-base-content/50">
                        Enter your company&apos;s billing information.
                    </p>

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

                    <BaselFormField label="Payment Terms" required>
                        <select
                            className="select select-bordered w-full"
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

                    <BaselFormField label="Street Address">
                        <input
                            type="text"
                            className="input input-bordered w-full"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            placeholder="123 Main Street"
                        />
                    </BaselFormField>

                    <div className="grid grid-cols-2 gap-4">
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

                    <div className="grid grid-cols-2 gap-4">
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

                    <BaselFormField label="Tax ID (EIN)" hint="Optional">
                        <input
                            type="text"
                            className="input input-bordered w-full"
                            value={taxId}
                            onChange={(e) => setTaxId(e.target.value)}
                            placeholder="12-3456789"
                        />
                    </BaselFormField>

                    <div className="flex justify-end mt-6">
                        <button
                            className="btn btn-primary"
                            onClick={handleSaveBillingDetails}
                            disabled={saving || !billingEmail.trim()}
                        >
                            <ButtonLoading
                                loading={saving}
                                text="Continue"
                                loadingText="Saving..."
                                icon="fa-duotone fa-regular fa-arrow-right"
                            />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
                <div className="space-y-4">
                    <p className="text-sm text-base-content/50">
                        {isImmediateBilling
                            ? "A payment method is required for immediate billing. Placement fees will be charged automatically."
                            : "Add a payment method to ensure invoices are paid on time. You can also skip and pay via the invoice link sent to your email."}
                    </p>

                    <BaselPaymentForm
                        companyId={companyId}
                        onSuccess={handlePaymentSuccess}
                        onCancel={() => setStep(1)}
                        allowSkip={!isImmediateBilling}
                        onSkip={handleSkipPayment}
                        submitButtonText="Save Payment Method"
                    />
                </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
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
                        <div className="flex items-center justify-between py-2">
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
                                You can manage payment methods and view invoices
                                on the billing dashboard
                            </li>
                        </ul>
                    </div>

                    <div className="flex justify-end mt-6">
                        <button
                            className="btn btn-primary"
                            onClick={onComplete}
                        >
                            Done
                            <i className="fa-duotone fa-regular fa-check ml-1" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
