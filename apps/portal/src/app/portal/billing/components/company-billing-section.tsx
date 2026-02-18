"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useCompanyBillingStatus } from "@/hooks/use-company-billing-status";
import {
    DetailSection,
    SettingsField,
    Badge,
    Button,
    AlertBanner,
} from "@splits-network/memphis-ui";
import {
    CompanyPaymentMethodSection,
    CompanyInvoiceSection,
    CompanyBillingSetupWizard,
} from "@/components/company-billing";

function formatBillingTerms(terms: string): string {
    const labels: Record<string, string> = {
        immediate: "Immediate (Charge on completion)",
        net_30: "Net 30",
        net_60: "Net 60",
        net_90: "Net 90",
    };
    return labels[terms] || terms;
}

function formatAddress(address: Record<string, any> | null): string | null {
    if (!address) return null;
    const parts = [
        address.street,
        address.city,
        [address.state, address.zip].filter(Boolean).join(" "),
        address.country,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
}

export default function CompanyBillingSection() {
    const { getToken } = useAuth();
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [loadingCompany, setLoadingCompany] = useState(true);
    const [setupDrawerOpen, setSetupDrawerOpen] = useState(false);

    const {
        loading,
        error,
        profile,
        readiness,
        status,
        refresh,
    } = useCompanyBillingStatus(companyId);

    // Resolve company ID from user profile
    useEffect(() => {
        const resolveCompanyId = async () => {
            try {
                const token = await getToken();
                if (!token) return;

                const client = createAuthenticatedClient(token);
                const profileRes: any = await client.get("/users/me");
                const userData = profileRes?.data;

                if (
                    Array.isArray(userData?.company_ids) &&
                    userData.company_ids.length > 0
                ) {
                    setCompanyId(userData.company_ids[0]);
                } else if (
                    Array.isArray(userData?.organization_ids) &&
                    userData.organization_ids.length > 0
                ) {
                    const companiesRes: any = await client.get("/companies");
                    const companies = companiesRes?.data || [];
                    const company = companies.find(
                        (c: any) =>
                            c.identity_organization_id ===
                            userData.organization_ids[0],
                    );
                    if (company) {
                        setCompanyId(company.id);
                    }
                }
            } catch (err) {
                console.error("Failed to resolve company ID:", err);
            } finally {
                setLoadingCompany(false);
            }
        };

        resolveCompanyId();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSetupComplete = useCallback(() => {
        setSetupDrawerOpen(false);
        refresh();
    }, [refresh]);

    if (loadingCompany || loading) {
        return (
            <DetailSection
                title="Company Billing"
                icon="fa-duotone fa-regular fa-building"
                accent="coral"
            >
                <div className="flex items-center justify-center py-8">
                    <span className="loading loading-spinner loading-md" />
                    <span className="ml-3 text-sm text-dark/50">
                        Loading company billing...
                    </span>
                </div>
            </DetailSection>
        );
    }

    if (!companyId) {
        return (
            <DetailSection
                title="Company Billing"
                icon="fa-duotone fa-regular fa-building"
                accent="coral"
            >
                <div className="text-center py-6">
                    <i className="fa-duotone fa-regular fa-building text-4xl text-dark/20 mb-4 block" />
                    <p className="text-sm font-bold text-dark mb-1">
                        No Company Found
                    </p>
                    <p className="text-sm text-dark/50">
                        Please contact your organization administrator.
                    </p>
                </div>
            </DetailSection>
        );
    }

    return (
        <div className="space-y-8">
            {error && (
                <AlertBanner type="error">{error}</AlertBanner>
            )}

            {/* Not started CTA */}
            {status === "not_started" && (
                <DetailSection
                    title="Company Billing"
                    icon="fa-duotone fa-regular fa-building"
                    accent="coral"
                >
                    <div className="text-center py-6">
                        <i className="fa-duotone fa-regular fa-file-invoice-dollar text-4xl text-dark/20 mb-4 block" />
                        <p className="text-sm font-bold text-dark mb-1">
                            Set Up Company Billing
                        </p>
                        <p className="text-sm text-dark/50 mb-4">
                            Configure your billing profile and payment method to
                            enable placement invoicing.
                        </p>
                        <Button
                            color="coral"
                            onClick={() => setSetupDrawerOpen(true)}
                        >
                            <i className="fa-duotone fa-regular fa-rocket mr-1" />
                            Get Started
                        </Button>
                    </div>
                </DetailSection>
            )}

            {/* Incomplete warning */}
            {status === "incomplete" && (
                <AlertBanner type="warning">
                    Your billing setup is incomplete.
                    {readiness?.requires_payment_method &&
                    !readiness?.has_payment_method
                        ? " A payment method is required for immediate billing."
                        : " Complete your billing profile to enable invoicing."}
                    <Button
                        color="yellow"
                        size="sm"
                        className="ml-3"
                        onClick={() => setSetupDrawerOpen(true)}
                    >
                        Complete Setup
                    </Button>
                </AlertBanner>
            )}

            {/* Billing Profile */}
            {profile && (
                <DetailSection
                    title="Billing Profile"
                    icon="fa-duotone fa-regular fa-file-invoice"
                    accent="coral"
                >
                    <div className="flex justify-end mb-4">
                        <Button
                            color="coral"
                            variant="outline"
                            size="sm"
                            onClick={() => setSetupDrawerOpen(true)}
                        >
                            <i className="fa-duotone fa-regular fa-pen mr-1" />
                            Edit
                        </Button>
                    </div>

                    <div className="space-y-0">
                        <SettingsField label="Billing Email">
                            <span className="text-sm font-bold text-dark">
                                {profile.billing_email}
                            </span>
                        </SettingsField>
                        <SettingsField label="Payment Terms">
                            <span className="text-sm font-bold text-dark">
                                {formatBillingTerms(profile.billing_terms)}
                            </span>
                        </SettingsField>
                        {profile.billing_contact_name && (
                            <SettingsField label="Contact">
                                <span className="text-sm font-bold text-dark">
                                    {profile.billing_contact_name}
                                </span>
                            </SettingsField>
                        )}
                        {formatAddress(profile.billing_address) && (
                            <SettingsField label="Address">
                                <span className="text-sm font-bold text-dark">
                                    {formatAddress(profile.billing_address)}
                                </span>
                            </SettingsField>
                        )}
                        {profile.stripe_tax_id && (
                            <SettingsField label="Tax ID">
                                <span className="text-sm font-bold text-dark">
                                    {profile.stripe_tax_id}
                                </span>
                            </SettingsField>
                        )}
                    </div>
                </DetailSection>
            )}

            {/* Payment Method */}
            {status !== "not_started" && (
                <DetailSection
                    title="Payment Method"
                    icon="fa-duotone fa-regular fa-credit-card"
                    accent="teal"
                >
                    <CompanyPaymentMethodSection
                        companyId={companyId}
                        billingTerms={profile?.billing_terms}
                        onPaymentMethodUpdated={refresh}
                    />
                </DetailSection>
            )}

            {/* Invoices */}
            {status !== "not_started" && (
                <DetailSection
                    title="Placement Invoices"
                    icon="fa-duotone fa-regular fa-file-invoice-dollar"
                    accent="yellow"
                >
                    <CompanyInvoiceSection companyId={companyId} />
                </DetailSection>
            )}

            {/* Setup Wizard Drawer */}
            <CompanyBillingSetupWizard
                open={setupDrawerOpen}
                companyId={companyId}
                existingProfile={profile}
                onComplete={handleSetupComplete}
                onClose={() => setSetupDrawerOpen(false)}
            />
        </div>
    );
}
