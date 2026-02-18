"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import {
    Input,
    Select,
    Button,
    DetailSection,
    SettingsField,
    Badge,
} from "@splits-network/memphis-ui";
import { ButtonLoading } from "@splits-network/shared-ui";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useCompanyBillingStatus } from "@/hooks/use-company-billing-status";
import {
    CompanyPaymentMethodSection,
    CompanyInvoiceSection,
    CompanyBillingSetupWizard,
} from "@/components/company-billing";
import type { Company } from "../types";

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
            <div className="border-4 border-yellow bg-yellow-light p-6">
                <p className="text-sm font-bold text-dark">
                    <i className="fa-duotone fa-regular fa-circle-info text-yellow mr-2" />
                    Save your company profile first to configure billing.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {error && (
                <div className="border-4 border-coral bg-coral-light p-4">
                    <p className="text-sm font-bold text-dark flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-circle-exclamation text-coral" />
                        {error}
                    </p>
                </div>
            )}

            {success && (
                <div className="border-4 border-teal bg-teal-light p-4">
                    <p className="text-sm font-bold text-dark flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-circle-check text-teal" />
                        Billing profile saved successfully!
                    </p>
                </div>
            )}

            {/* Billing Status Overview */}
            {!billingLoading && (
                <DetailSection
                    title="Billing Status"
                    icon="fa-duotone fa-regular fa-chart-pie"
                    accent="purple"
                >
                    {billingStatus === "not_started" ? (
                        <div className="text-center py-6">
                            <i className="fa-duotone fa-regular fa-credit-card text-4xl text-dark/20 mb-4 block" />
                            <p className="text-sm font-bold text-dark mb-1">
                                Billing not configured
                            </p>
                            <p className="text-xs text-dark/50 mb-4">
                                Set up billing to enable placement invoicing.
                            </p>
                            <Button
                                color="purple"
                                onClick={() => setSetupDrawerOpen(true)}
                            >
                                <i className="fa-duotone fa-regular fa-rocket mr-1" />
                                Set Up Billing
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-0">
                            <SettingsField label="Status">
                                <Badge
                                    color={
                                        billingStatus === "ready"
                                            ? "teal"
                                            : "yellow"
                                    }
                                    size="sm"
                                >
                                    {billingStatus === "ready"
                                        ? "Ready"
                                        : "Incomplete"}
                                </Badge>
                            </SettingsField>
                            <SettingsField label="Payment Method">
                                {readiness?.has_payment_method ? (
                                    <Badge color="teal" size="sm">
                                        <i className="fa-duotone fa-regular fa-check-circle mr-1" />
                                        On file
                                    </Badge>
                                ) : (
                                    <span className="text-sm text-dark/50">
                                        Not set
                                    </span>
                                )}
                            </SettingsField>
                            <SettingsField label="Billing Terms">
                                <span className="text-sm font-bold text-dark">
                                    {billingProfile?.billing_terms || "Not set"}
                                </span>
                            </SettingsField>
                            <SettingsField label="Billing Email">
                                <span className="text-sm font-bold text-dark">
                                    {billingProfile?.billing_email || "Not set"}
                                </span>
                            </SettingsField>
                            {billingStatus === "incomplete" && (
                                <div className="pt-4">
                                    <Button
                                        color="yellow"
                                        size="sm"
                                        onClick={() =>
                                            setSetupDrawerOpen(true)
                                        }
                                    >
                                        Complete Setup
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DetailSection>
            )}

            {/* Billing Profile Form */}
            {billingStatus !== "not_started" && (
                <form onSubmit={handleSubmit} className="space-y-8">
                    <DetailSection
                        title="Billing Profile"
                        icon="fa-duotone fa-regular fa-file-invoice-dollar"
                        accent="purple"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Select
                                label="Payment Terms"
                                name="billing_terms"
                                value={formData.billing_terms}
                                onChange={handleChange}
                                options={BILLING_TERMS}
                            />

                            <Input
                                label="Billing Email"
                                name="billing_email"
                                type="email"
                                value={formData.billing_email}
                                onChange={handleChange}
                                placeholder="billing@company.com"
                                required
                            />

                            <Input
                                label="Billing Contact Name"
                                name="billing_contact_name"
                                value={formData.billing_contact_name}
                                onChange={handleChange}
                                placeholder="Jane Smith"
                            />

                            <Select
                                label="Invoice Delivery"
                                name="invoice_delivery_method"
                                value={formData.invoice_delivery_method}
                                onChange={handleChange}
                                options={DELIVERY_METHODS}
                            />
                        </div>

                        {/* Billing Address */}
                        <div className="mt-6 pt-6 border-t-4 border-cream">
                            <p className="text-sm font-black uppercase tracking-wider text-dark/70 mb-4 flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-location-dot text-purple" />
                                Billing Address
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <Input
                                        label="Street Address"
                                        name="billing_address_street"
                                        value={formData.billing_address_street}
                                        onChange={handleChange}
                                        placeholder="123 Main Street"
                                    />
                                </div>

                                <Input
                                    label="City"
                                    name="billing_address_city"
                                    value={formData.billing_address_city}
                                    onChange={handleChange}
                                    placeholder="New York"
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="State"
                                        name="billing_address_state"
                                        value={formData.billing_address_state}
                                        onChange={handleChange}
                                        placeholder="NY"
                                    />
                                    <Input
                                        label="ZIP"
                                        name="billing_address_zip"
                                        value={formData.billing_address_zip}
                                        onChange={handleChange}
                                        placeholder="10001"
                                    />
                                </div>

                                <Input
                                    label="Country"
                                    name="billing_address_country"
                                    value={formData.billing_address_country}
                                    onChange={handleChange}
                                    placeholder="United States"
                                />

                                <Input
                                    label="Tax ID (EIN)"
                                    name="stripe_tax_id"
                                    value={formData.stripe_tax_id}
                                    onChange={handleChange}
                                    placeholder="12-3456789"
                                />
                            </div>
                        </div>
                    </DetailSection>

                    {/* Save Actions */}
                    <div className="flex gap-3 justify-end">
                        <Button
                            type="submit"
                            color="purple"
                            disabled={
                                saving || !formData.billing_email.trim()
                            }
                        >
                            <ButtonLoading
                                loading={saving}
                                text="Save Billing"
                                loadingText="Saving..."
                                icon="fa-duotone fa-regular fa-floppy-disk"
                            />
                        </Button>
                    </div>
                </form>
            )}

            {/* Payment Method */}
            {billingStatus !== "not_started" && (
                <DetailSection
                    title="Payment Method"
                    icon="fa-duotone fa-regular fa-credit-card"
                    accent="teal"
                >
                    <CompanyPaymentMethodSection
                        companyId={company.id}
                        billingTerms={billingProfile?.billing_terms}
                        onPaymentMethodUpdated={refreshBilling}
                    />
                </DetailSection>
            )}

            {/* Invoices */}
            {billingStatus !== "not_started" && (
                <DetailSection
                    title="Invoices"
                    icon="fa-duotone fa-regular fa-file-invoice"
                    accent="coral"
                >
                    <CompanyInvoiceSection companyId={company.id} />
                </DetailSection>
            )}

            {/* Setup Wizard */}
            <CompanyBillingSetupWizard
                open={setupDrawerOpen}
                companyId={company.id}
                existingProfile={billingProfile}
                onComplete={handleSetupComplete}
                onClose={() => setSetupDrawerOpen(false)}
            />
        </div>
    );
}
