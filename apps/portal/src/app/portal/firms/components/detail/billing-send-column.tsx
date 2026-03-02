"use client";

import { useState } from "react";
import { FirmBillingSetupWizard } from "./firm-billing-setup-wizard";

interface BillingProfile {
    id: string;
    firm_id: string;
    billing_terms: string;
    billing_email: string;
    billing_contact_name: string | null;
    billing_address: Record<string, any> | null;
    stripe_tax_id: string | null;
    stripe_customer_id: string | null;
    stripe_default_payment_method_id: string | null;
}

interface PaymentMethod {
    id: string;
    type: string;
    card?: { brand: string; last4: string; exp_month: number; exp_year: number };
    us_bank_account?: { bank_name: string; last4: string };
}

interface BillingSendColumnProps {
    firmId: string;
    profile: BillingProfile | null;
    paymentMethod: PaymentMethod | null;
    onRefresh: () => void;
}

export function BillingSendColumn({
    firmId,
    profile,
    paymentMethod,
    onRefresh,
}: BillingSendColumnProps) {
    const [showWizard, setShowWizard] = useState(false);

    const handleComplete = () => {
        setShowWizard(false);
        onRefresh();
    };

    return (
        <div className="bg-base-100 border border-base-300 border-t-[3px] border-t-primary">
            {/* Header */}
            <div className="p-5 pb-4">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-1">
                    Payments You Send
                </p>
                <h3 className="text-lg font-bold mb-1">Billing Profile</h3>
                <p className="text-sm text-base-content/60">
                    When you post a role for a company not on the platform,
                    your firm pays the placement fee to the recruiter who fills it.
                </p>
            </div>

            {/* Body */}
            <div className="px-5 pb-5">
                <HowItWorksSend />

                {profile ? (
                    <ConfiguredState
                        profile={profile}
                        paymentMethod={paymentMethod}
                        onEdit={() => setShowWizard(true)}
                    />
                ) : (
                    <NotConfiguredState onSetup={() => setShowWizard(true)} />
                )}
            </div>

            <FirmBillingSetupWizard
                open={showWizard}
                firmId={firmId}
                existingProfile={profile}
                onComplete={handleComplete}
                onClose={() => setShowWizard(false)}
            />
        </div>
    );
}

function HowItWorksSend() {
    const steps = [
        "You post a role for an off-platform company",
        "A recruiter fills the role and the placement is verified",
        "Your firm pays the placement fee using the payment method on file",
        "Payment terms (Net 30/60/90 or immediate) apply to all outbound payments",
    ];

    return (
        <div className="bg-base-200 p-4 mb-4">
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                How it works
            </h4>
            <ol className="text-sm text-base-content/60 space-y-1">
                {steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                        <span className="w-[18px] h-[18px] shrink-0 flex items-center justify-center text-[10px] font-semibold bg-primary/10 text-primary mt-0.5">
                            {i + 1}
                        </span>
                        {step}
                    </li>
                ))}
            </ol>
        </div>
    );
}

function ConfiguredState({
    profile,
    paymentMethod,
    onEdit,
}: {
    profile: BillingProfile;
    paymentMethod: PaymentMethod | null;
    onEdit: () => void;
}) {
    const formatTerms = (terms: string) =>
        terms === "immediate"
            ? "Immediate"
            : terms.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());

    const formatPaymentMethod = () => {
        if (!paymentMethod) return null;
        if (paymentMethod.card) return `${paymentMethod.card.brand} ···· ${paymentMethod.card.last4}`;
        if (paymentMethod.us_bank_account) return `${paymentMethod.us_bank_account.bank_name} ···· ${paymentMethod.us_bank_account.last4}`;
        return "On file";
    };

    return (
        <>
            <div className="border border-base-300 bg-base-200 mb-4">
                <SummaryRow label="Billing Email" value={profile.billing_email} />
                <SummaryRow label="Payment Terms" value={formatTerms(profile.billing_terms)} />
                <SummaryRow
                    label="Payment Method"
                    value={formatPaymentMethod() || "Not set"}
                    dimValue={!paymentMethod}
                    last
                />
            </div>
            <button
                className="btn btn-sm btn-ghost"
                style={{ borderRadius: 0 }}
                onClick={onEdit}
            >
                <i className="fa-duotone fa-regular fa-pen mr-1" />
                Edit Billing Profile
            </button>
        </>
    );
}

function NotConfiguredState({ onSetup }: { onSetup: () => void }) {
    return (
        <>
            <p className="text-sm text-base-content/50 mb-4">
                No billing profile on file. You will need to complete this before
                posting roles for off-platform companies.
            </p>
            <button
                className="btn btn-sm btn-primary"
                style={{ borderRadius: 0 }}
                onClick={onSetup}
            >
                <i className="fa-duotone fa-regular fa-credit-card mr-1" />
                Set Up Billing Profile
            </button>
        </>
    );
}

function SummaryRow({
    label,
    value,
    dimValue,
    last,
}: {
    label: string;
    value: string;
    dimValue?: boolean;
    last?: boolean;
}) {
    return (
        <div className={`flex justify-between px-4 py-3 ${last ? "" : "border-b border-base-300"}`}>
            <span className="text-sm text-base-content/50">{label}</span>
            <span className={`text-sm font-semibold ${dimValue ? "text-base-content/40" : ""}`}>
                {value}
            </span>
        </div>
    );
}
