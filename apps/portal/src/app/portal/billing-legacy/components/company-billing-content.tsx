"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useCompanyBillingStatus } from "@/hooks/use-company-billing-status";
import CompanyPaymentMethodSection from "./company-payment-method-section";
import CompanyInvoiceSection from "./company-invoice-section";
import CompanyBillingSetupWizard from "./company-billing-setup-wizard";

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

export default function CompanyBillingContent() {
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

                // Try company_ids first, then fall back to organization lookup
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
                            userData.organization_ids[0]
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
            <div className="container mx-auto py-6 px-4">
                <div className="flex items-center justify-center min-h-[400px]">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </div>
        );
    }

    if (!companyId) {
        return (
            <div className="container mx-auto py-6 px-4">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">
                        <i className="fa-duotone fa-regular fa-credit-card mr-3"></i>
                        Billing & Payments
                    </h1>
                    <p className="text-base-content/70 mt-2">
                        Manage your company&apos;s billing profile, payment
                        methods, and placement invoices.
                    </p>
                </div>
                <div className="card bg-base-100 shadow">
                    <div className="card-body text-center py-8">
                        <i className="fa-duotone fa-regular fa-building text-5xl text-base-content/30 mb-4 block"></i>
                        <p className="text-base-content/70">
                            No company found. Please contact your organization
                            administrator.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 px-4">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">
                    <i className="fa-duotone fa-regular fa-credit-card mr-3"></i>
                    Billing & Payments
                </h1>
                <p className="text-base-content/70 mt-2">
                    Manage your company&apos;s billing profile, payment methods,
                    and placement invoices.
                </p>
            </div>

            {error && (
                <div className="alert alert-error mb-6">
                    <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                    <span>{error}</span>
                </div>
            )}

            {/* Not started — prominent CTA */}
            {status === "not_started" && (
                <div className="card bg-base-100 shadow mb-6">
                    <div className="card-body text-center py-10">
                        <i className="fa-duotone fa-regular fa-file-invoice-dollar text-5xl text-primary mb-4 block"></i>
                        <h3 className="text-xl font-bold mb-2">
                            Set Up Company Billing
                        </h3>
                        <p className="text-base-content/70 max-w-md mx-auto mb-6">
                            Configure your billing profile and payment method to
                            enable placement invoicing for your hires.
                        </p>
                        <div>
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={() => setSetupDrawerOpen(true)}
                            >
                                <i className="fa-duotone fa-regular fa-rocket"></i>
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Incomplete — warning banner */}
            {status === "incomplete" && (
                <div className="alert alert-warning mb-6">
                    <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                    <div className="flex-1">
                        <span>
                            Your billing setup is incomplete.
                            {readiness?.requires_payment_method &&
                            !readiness?.has_payment_method
                                ? " A payment method is required for immediate billing."
                                : " Complete your billing profile to enable invoicing."}
                        </span>
                    </div>
                    <button
                        className="btn btn-sm btn-warning"
                        onClick={() => setSetupDrawerOpen(true)}
                    >
                        Complete Setup
                    </button>
                </div>
            )}

            <div className="space-y-6">
                {/* Billing Profile Card */}
                {profile && (
                    <div className="card bg-base-100 shadow">
                        <div className="card-body">
                            <div className="flex items-center justify-between">
                                <h2 className="card-title">
                                    <i className="fa-duotone fa-regular fa-file-invoice"></i>
                                    Billing Profile
                                </h2>
                                <button
                                    className="btn btn-sm btn-ghost"
                                    onClick={() => setSetupDrawerOpen(true)}
                                >
                                    <i className="fa-duotone fa-regular fa-pen"></i>
                                    Edit
                                </button>
                            </div>
                            <div className="divider my-2"></div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm text-base-content/60">
                                        Billing Email
                                    </div>
                                    <div className="font-medium">
                                        {profile.billing_email}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-base-content/60">
                                        Payment Terms
                                    </div>
                                    <div className="font-medium">
                                        {formatBillingTerms(
                                            profile.billing_terms
                                        )}
                                    </div>
                                </div>
                                {profile.billing_contact_name && (
                                    <div>
                                        <div className="text-sm text-base-content/60">
                                            Billing Contact
                                        </div>
                                        <div className="font-medium">
                                            {profile.billing_contact_name}
                                        </div>
                                    </div>
                                )}
                                {formatAddress(profile.billing_address) && (
                                    <div>
                                        <div className="text-sm text-base-content/60">
                                            Billing Address
                                        </div>
                                        <div className="font-medium">
                                            {formatAddress(
                                                profile.billing_address
                                            )}
                                        </div>
                                    </div>
                                )}
                                {profile.stripe_tax_id && (
                                    <div>
                                        <div className="text-sm text-base-content/60">
                                            Tax ID (EIN)
                                        </div>
                                        <div className="font-medium">
                                            {profile.stripe_tax_id}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment Method */}
                {status !== "not_started" && (
                    <CompanyPaymentMethodSection
                        companyId={companyId}
                        billingTerms={profile?.billing_terms}
                        onPaymentMethodUpdated={refresh}
                    />
                )}

                {/* Invoices */}
                {status !== "not_started" && (
                    <CompanyInvoiceSection companyId={companyId} />
                )}
            </div>

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
