"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { BaselFormField, BaselStatusPill, BaselEmptyState } from "@splits-network/basel-ui";
import { ButtonLoading } from "@splits-network/shared-ui";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useCompanyBillingStatus } from "@/hooks/use-company-billing-status";
import { BaselPaymentMethodSection } from "./billing/payment-method-section";
import { BaselInvoiceSection } from "./billing/invoice-section";
import { BaselBillingSetupWizard } from "./billing/billing-setup-wizard";
import type { Company } from "@/app/portal/company/settings/types";

const BILLING_TERMS = [
    { value: "immediate", label: "Immediate (Charge on completion)" },
    { value: "net_30", label: "Net 30" },
    { value: "net_60", label: "Net 60" },
    { value: "net_90", label: "Net 90" },
];

const DELIVERY_METHODS = [
    { value: "email", label: "Email" },
    { value: "none", label: "None" },
];

interface BillingTabProps {
    company: Company | null;
}

export function BillingTab({ company }: BillingTabProps) {
    const { getToken } = useAuth();
    const [billingLoaded, setBillingLoaded] = useState(false);
    const [setupDrawerOpen, setSetupDrawerOpen] = useState(false);

    const {
        loading: billingLoading,
        profile: billingProfile,
        readiness,
        status: billingStatus,
        refresh: refreshBilling,
    } = useCompanyBillingStatus(company?.id || null);

    const [formData, setFormData] = useState({
        billing_terms: "net_30",
        billing_email: "",
        billing_contact_name: "",
        billing_address_street: "",
        billing_address_city: "",
        billing_address_state: "",
        billing_address_zip: "",
        billing_address_country: "United States",
        stripe_tax_id: "",
        invoice_delivery_method: "email",
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const loadBillingProfile = async () => {
            if (!company?.id || billingLoaded) return;
            try {
                const token = await getToken();
                if (!token) return;
                const client = createAuthenticatedClient(token);
                const response = await client.get(
                    `/company-billing-profiles/${company.id}`,
                );
                const profile = response?.data;
                if (profile) {
                    setFormData((prev) => ({
                        ...prev,
                        billing_terms: profile.billing_terms || "net_30",
                        billing_email: profile.billing_email || "",
                        billing_contact_name:
                            profile.billing_contact_name || "",
                        billing_address_street:
                            profile.billing_address?.street || "",
                        billing_address_city:
                            profile.billing_address?.city || "",
                        billing_address_state:
                            profile.billing_address?.state || "",
                        billing_address_zip:
                            profile.billing_address?.zip || "",
                        billing_address_country:
                            profile.billing_address?.country ||
                            "United States",
                        stripe_tax_id: profile.stripe_tax_id || "",
                        invoice_delivery_method:
                            profile.invoice_delivery_method || "email",
                    }));
                }
                setBillingLoaded(true);
            } catch (loadError: any) {
                console.error("Failed to load billing profile:", loadError);
                setBillingLoaded(true);
            }
        };

        loadBillingProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [company?.id, billingLoaded]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setSuccess(false);
    };

    const handleSetupComplete = () => {
        setSetupDrawerOpen(false);
        refreshBilling();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSaving(true);

        try {
            const billingEmail = formData.billing_email.trim();
            if (!billingEmail) {
                setError("Billing email is required");
                setSaving(false);
                return;
            }

            const token = await getToken();
            if (!token) {
                setError("Authentication required");
                setSaving(false);
                return;
            }

            const client = createAuthenticatedClient(token);

            const billingAddress: Record<string, string> = {};
            if (formData.billing_address_street)
                billingAddress.street = formData.billing_address_street;
            if (formData.billing_address_city)
                billingAddress.city = formData.billing_address_city;
            if (formData.billing_address_state)
                billingAddress.state = formData.billing_address_state;
            if (formData.billing_address_zip)
                billingAddress.zip = formData.billing_address_zip;
            if (formData.billing_address_country)
                billingAddress.country = formData.billing_address_country;

            await client.post(
                `/company-billing-profiles/${company!.id}`,
                {
                    billing_terms: formData.billing_terms,
                    billing_email: billingEmail,
                    billing_contact_name:
                        formData.billing_contact_name.trim() || null,
                    billing_address:
                        Object.keys(billingAddress).length > 0
                            ? billingAddress
                            : null,
                    stripe_tax_id: formData.stripe_tax_id.trim() || null,
                    invoice_delivery_method: formData.invoice_delivery_method,
                },
            );

            setSuccess(true);
            refreshBilling();
        } catch (err: any) {
            console.error("Failed to save billing profile:", err);
            setError(err.message || "Failed to save billing profile");
        } finally {
            setSaving(false);
        }
    };

    if (!company) {
        return (
            <div className="bg-warning/5 border border-warning/20 p-6">
                <p className="text-sm font-semibold text-base-content flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-circle-info text-warning" />
                    Save your company profile first to configure billing.
                </p>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-xl font-black tracking-tight mb-1">
                Billing & Subscription
            </h2>
            <p className="text-sm text-base-content/50 mb-8">
                Manage your billing profile, payment methods, and invoices.
            </p>

            {error && (
                <div className="bg-error/5 border border-error/20 p-4 mb-6">
                    <p className="text-sm font-semibold text-error flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-circle-exclamation" />
                        {error}
                    </p>
                </div>
            )}

            {success && (
                <div className="bg-success/5 border border-success/20 p-4 mb-6">
                    <p className="text-sm font-semibold text-success flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-circle-check" />
                        Billing profile saved successfully!
                    </p>
                </div>
            )}

            {/* Billing Status Overview */}
            {!billingLoading && billingStatus === "not_started" && (
                <BaselEmptyState
                    icon="fa-duotone fa-regular fa-credit-card"
                    title="Billing not configured"
                    subtitle="Set up billing to enable placement invoicing."
                    actions={[
                        {
                            label: "Set Up Billing",
                            onClick: () => setSetupDrawerOpen(true),
                            style: "btn-primary",
                        },
                    ]}
                />
            )}

            {!billingLoading && billingStatus !== "not_started" && (
                <div className="space-y-8">
                    {/* Status Card */}
                    <div className="bg-base-200 border border-base-300 p-6">
                        <h3 className="font-bold mb-4">Billing Status</h3>
                        <div className="space-y-0">
                            <div className="flex items-center justify-between py-3 border-b border-base-300">
                                <span className="text-sm text-base-content/60">
                                    Status
                                </span>
                                <BaselStatusPill
                                    color={
                                        billingStatus === "ready"
                                            ? "success"
                                            : "warning"
                                    }
                                >
                                    {billingStatus === "ready"
                                        ? "Ready"
                                        : "Incomplete"}
                                </BaselStatusPill>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-base-300">
                                <span className="text-sm text-base-content/60">
                                    Payment Method
                                </span>
                                {readiness?.has_payment_method ? (
                                    <BaselStatusPill color="success">
                                        On file
                                    </BaselStatusPill>
                                ) : (
                                    <span className="text-sm text-base-content/40">
                                        Not set
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-base-300">
                                <span className="text-sm text-base-content/60">
                                    Billing Terms
                                </span>
                                <span className="text-sm font-semibold">
                                    {billingProfile?.billing_terms || "Not set"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-3">
                                <span className="text-sm text-base-content/60">
                                    Billing Email
                                </span>
                                <span className="text-sm font-semibold">
                                    {billingProfile?.billing_email || "Not set"}
                                </span>
                            </div>
                            {billingStatus === "incomplete" && (
                                <div className="pt-4 border-t border-base-300">
                                    <button
                                        className="btn btn-sm btn-warning"
                                        onClick={() =>
                                            setSetupDrawerOpen(true)
                                        }
                                    >
                                        Complete Setup
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Billing Profile Form */}
                    <div className="bg-base-200 border border-base-300 p-6">
                        <h3 className="font-bold mb-4">Billing Profile</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <BaselFormField label="Payment Terms">
                                    <select
                                        name="billing_terms"
                                        value={formData.billing_terms}
                                        onChange={handleChange}
                                        className="select select-bordered w-full"
                                    >
                                        {BILLING_TERMS.map((t) => (
                                            <option
                                                key={t.value}
                                                value={t.value}
                                            >
                                                {t.label}
                                            </option>
                                        ))}
                                    </select>
                                </BaselFormField>

                                <BaselFormField label="Billing Email" required>
                                    <input
                                        type="email"
                                        name="billing_email"
                                        value={formData.billing_email}
                                        onChange={handleChange}
                                        placeholder="billing@company.com"
                                        className="input input-bordered w-full"
                                        required
                                    />
                                </BaselFormField>

                                <BaselFormField label="Billing Contact Name">
                                    <input
                                        type="text"
                                        name="billing_contact_name"
                                        value={formData.billing_contact_name}
                                        onChange={handleChange}
                                        placeholder="Jane Smith"
                                        className="input input-bordered w-full"
                                    />
                                </BaselFormField>

                                <BaselFormField label="Invoice Delivery">
                                    <select
                                        name="invoice_delivery_method"
                                        value={
                                            formData.invoice_delivery_method
                                        }
                                        onChange={handleChange}
                                        className="select select-bordered w-full"
                                    >
                                        {DELIVERY_METHODS.map((d) => (
                                            <option
                                                key={d.value}
                                                value={d.value}
                                            >
                                                {d.label}
                                            </option>
                                        ))}
                                    </select>
                                </BaselFormField>
                            </div>

                            {/* Billing Address */}
                            <div className="border-t border-base-300 pt-6 mt-6">
                                <h4 className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-4 flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-location-dot" />
                                    Billing Address
                                </h4>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <BaselFormField
                                        label="Street Address"
                                        className="md:col-span-2"
                                    >
                                        <input
                                            type="text"
                                            name="billing_address_street"
                                            value={
                                                formData.billing_address_street
                                            }
                                            onChange={handleChange}
                                            placeholder="123 Main Street"
                                            className="input input-bordered w-full"
                                        />
                                    </BaselFormField>

                                    <BaselFormField label="City">
                                        <input
                                            type="text"
                                            name="billing_address_city"
                                            value={
                                                formData.billing_address_city
                                            }
                                            onChange={handleChange}
                                            placeholder="New York"
                                            className="input input-bordered w-full"
                                        />
                                    </BaselFormField>

                                    <div className="grid grid-cols-2 gap-4">
                                        <BaselFormField label="State">
                                            <input
                                                type="text"
                                                name="billing_address_state"
                                                value={
                                                    formData.billing_address_state
                                                }
                                                onChange={handleChange}
                                                placeholder="NY"
                                                className="input input-bordered w-full"
                                            />
                                        </BaselFormField>
                                        <BaselFormField label="ZIP">
                                            <input
                                                type="text"
                                                name="billing_address_zip"
                                                value={
                                                    formData.billing_address_zip
                                                }
                                                onChange={handleChange}
                                                placeholder="10001"
                                                className="input input-bordered w-full"
                                            />
                                        </BaselFormField>
                                    </div>

                                    <BaselFormField label="Country">
                                        <input
                                            type="text"
                                            name="billing_address_country"
                                            value={
                                                formData.billing_address_country
                                            }
                                            onChange={handleChange}
                                            placeholder="United States"
                                            className="input input-bordered w-full"
                                        />
                                    </BaselFormField>

                                    <BaselFormField label="Tax ID (EIN)">
                                        <input
                                            type="text"
                                            name="stripe_tax_id"
                                            value={formData.stripe_tax_id}
                                            onChange={handleChange}
                                            placeholder="12-3456789"
                                            className="input input-bordered w-full"
                                        />
                                    </BaselFormField>
                                </div>
                            </div>

                            <div className="flex justify-end pt-6 mt-6 border-t border-base-300">
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={
                                        saving ||
                                        !formData.billing_email.trim()
                                    }
                                >
                                    <ButtonLoading
                                        loading={saving}
                                        text="Save Billing"
                                        loadingText="Saving..."
                                        icon="fa-duotone fa-regular fa-floppy-disk"
                                    />
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-base-200 border border-base-300 p-6">
                        <h3 className="font-bold mb-4">Payment Method</h3>
                        <BaselPaymentMethodSection
                            companyId={company.id}
                            billingTerms={billingProfile?.billing_terms}
                            onPaymentMethodUpdated={refreshBilling}
                        />
                    </div>

                    {/* Invoices */}
                    <div className="bg-base-200 border border-base-300 p-6">
                        <h3 className="font-bold mb-4">Recent Invoices</h3>
                        <BaselInvoiceSection companyId={company.id} />
                    </div>
                </div>
            )}

            {/* Setup Wizard */}
            <BaselBillingSetupWizard
                open={setupDrawerOpen}
                companyId={company.id}
                existingProfile={billingProfile}
                onComplete={handleSetupComplete}
                onClose={() => setSetupDrawerOpen(false)}
            />
        </div>
    );
}
