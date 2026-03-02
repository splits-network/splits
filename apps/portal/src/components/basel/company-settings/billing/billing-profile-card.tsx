"use client";

import { useState } from "react";
import { BaselBillingSetupWizard } from "./billing-setup-wizard";
import { BaselPaymentMethodSection } from "./payment-method-section";

interface BillingProfile {
    id: string;
    company_id: string;
    billing_terms: string;
    billing_email: string;
    billing_contact_name: string | null;
    billing_address: Record<string, any> | null;
    stripe_tax_id: string | null;
    stripe_customer_id: string | null;
    stripe_default_payment_method_id: string | null;
    invoice_delivery_method: string;
}

interface BillingProfileCardProps {
    companyId: string;
    profile: BillingProfile | null;
    status: "not_started" | "incomplete" | "ready";
    onRefresh: () => void;
}

export function BillingProfileCard({
    companyId,
    profile,
    status,
    onRefresh,
}: BillingProfileCardProps) {
    const [showWizard, setShowWizard] = useState(false);

    const handleComplete = () => {
        setShowWizard(false);
        onRefresh();
    };

    const formatTerms = (terms: string) =>
        terms === "immediate"
            ? "Immediate"
            : terms.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());

    return (
        <div className="bg-base-100 border border-base-300 border-t-[3px] border-t-primary">
            {/* Header */}
            <div className="p-5 pb-4">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-1">
                    Billing Profile
                </p>
                <h3 className="text-lg font-bold mb-1">Placement Payments</h3>
                <p className="text-sm text-base-content/60">
                    When a recruiter fills one of your roles, your company pays
                    the placement fee. This profile determines how you&apos;re invoiced
                    and how payments are collected.
                </p>
            </div>

            {/* Body */}
            <div className="px-5 pb-5">
                <HowItWorks />

                {profile ? (
                    <ConfiguredState
                        companyId={companyId}
                        profile={profile}
                        status={status}
                        formatTerms={formatTerms}
                        onEdit={() => setShowWizard(true)}
                        onRefresh={onRefresh}
                    />
                ) : (
                    <NotConfiguredState onSetup={() => setShowWizard(true)} />
                )}
            </div>

            <BaselBillingSetupWizard
                open={showWizard}
                companyId={companyId}
                existingProfile={profile}
                onComplete={handleComplete}
                onClose={() => setShowWizard(false)}
            />
        </div>
    );
}

function HowItWorks() {
    const steps = [
        "A recruiter fills one of your open roles on the platform",
        "The placement is verified and an invoice is created",
        "Your company is charged using the payment method on file",
        "Payment terms (Net 30/60/90 or immediate) apply to all invoices",
        "A 3% processing fee covers payment processing costs",
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
    companyId,
    profile,
    status,
    formatTerms,
    onEdit,
    onRefresh,
}: {
    companyId: string;
    profile: BillingProfile;
    status: string;
    formatTerms: (terms: string) => string;
    onEdit: () => void;
    onRefresh: () => void;
}) {
    return (
        <>
            <div className="border border-base-300 bg-base-200 mb-4">
                <SummaryRow label="Billing Email" value={profile.billing_email} />
                <SummaryRow
                    label="Payment Terms"
                    value={formatTerms(profile.billing_terms)}
                />
                <SummaryRow
                    label="Contact"
                    value={profile.billing_contact_name || "Not set"}
                    dimValue={!profile.billing_contact_name}
                    last
                />
            </div>

            {/* Payment method inline */}
            <div className="border border-base-300 bg-base-200 p-4 mb-4">
                <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                    Payment Method
                </h4>
                <BaselPaymentMethodSection
                    companyId={companyId}
                    billingTerms={profile.billing_terms}
                    onPaymentMethodUpdated={onRefresh}
                />
            </div>

            {status === "incomplete" ? (
                <button
                    className="btn btn-sm btn-warning btn-outline"
                    style={{ borderRadius: 0 }}
                    onClick={onEdit}
                >
                    <i className="fa-duotone fa-regular fa-arrow-right mr-1" />
                    Complete Setup
                </button>
            ) : (
                <button
                    className="btn btn-sm btn-ghost"
                    style={{ borderRadius: 0 }}
                    onClick={onEdit}
                >
                    <i className="fa-duotone fa-regular fa-pen mr-1" />
                    Edit Billing Profile
                </button>
            )}
        </>
    );
}

function NotConfiguredState({ onSetup }: { onSetup: () => void }) {
    return (
        <>
            <p className="text-sm text-base-content/50 mb-4">
                No billing profile on file. Set up your billing profile so
                placement invoices can be created and processed.
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
