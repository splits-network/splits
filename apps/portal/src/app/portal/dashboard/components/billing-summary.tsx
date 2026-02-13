'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useUserProfile } from '@/contexts';
import { createAuthenticatedClient } from '@/lib/api-client';
import { ContentCard, EmptyState } from '@/components/ui/cards';
import { SkeletonList } from '@splits-network/shared-ui';

interface BillingReadiness {
    status: 'not_started' | 'incomplete' | 'ready';
    has_billing_profile: boolean;
    has_billing_email: boolean;
    has_billing_terms: boolean;
    has_stripe_customer: boolean;
    has_payment_method: boolean;
    billing_terms: string | null;
}

interface PaymentMethod {
    id: string;
    type: string;
    brand?: string;
    last4?: string;
    exp_month?: number;
    exp_year?: number;
    display_label: string;
}

interface PaymentMethodResponse {
    has_payment_method: boolean;
    default_payment_method: PaymentMethod | null;
}

interface RecentInvoice {
    id: string;
    stripe_invoice_number: string | null;
    invoice_status: string;
    amount_due: number;
    currency: string;
    due_date: string | null;
    paid_at: string | null;
    created_at: string;
    hosted_invoice_url: string | null;
}

const BILLING_TERMS_LABELS: Record<string, string> = {
    immediate: 'Immediate',
    net_30: 'Net 30',
    net_60: 'Net 60',
    net_90: 'Net 90',
};

const STATUS_BADGES: Record<string, { class: string; label: string }> = {
    draft: { class: 'badge-ghost', label: 'Draft' },
    open: { class: 'badge-warning', label: 'Due' },
    paid: { class: 'badge-success', label: 'Paid' },
    void: { class: 'badge-ghost', label: 'Void' },
    uncollectible: { class: 'badge-error', label: 'Failed' },
};

function formatCurrency(amount: number, currency: string = 'usd'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase(),
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatShortDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}

export default function BillingSummary() {
    const { getToken } = useAuth();
    const { profile } = useUserProfile();
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [readiness, setReadiness] = useState<BillingReadiness | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
    const [invoices, setInvoices] = useState<RecentInvoice[]>([]);

    // Resolve company ID from profile context (no extra /users/me call)
    useEffect(() => {
        if (!profile?.organization_ids?.length) return;

        const resolve = async () => {
            try {
                const token = await getToken();
                if (!token) return;

                const client = createAuthenticatedClient(token);
                const companiesRes: any = await client.get('/companies');
                const companies = companiesRes?.data || [];
                const company = companies.find(
                    (c: any) => c.identity_organization_id === profile.organization_ids[0]
                );
                if (company) setCompanyId(company.id);
            } catch (err) {
                console.error('[BillingSummary] Failed to resolve company ID:', err);
            }
        };

        resolve();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile?.organization_ids]);

    // Fetch billing data once company ID is resolved
    const fetchBillingData = useCallback(async () => {
        if (!companyId) return;

        try {
            setLoading(true);
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);

            const [readinessRes, pmRes, invoicesRes] = await Promise.allSettled([
                client.get(`/company-billing-profiles/${companyId}/billing-readiness`),
                client.get(`/company-billing-profiles/${companyId}/payment-method`),
                client.get(`/company-billing-profiles/${companyId}/invoices`, {
                    params: { page: '1', limit: '5' },
                }),
            ]);

            if (readinessRes.status === 'fulfilled') {
                setReadiness(readinessRes.value?.data || null);
            }
            if (pmRes.status === 'fulfilled') {
                const pmData = pmRes.value?.data as PaymentMethodResponse | undefined;
                setPaymentMethod(pmData?.default_payment_method || null);
            }
            if (invoicesRes.status === 'fulfilled') {
                setInvoices(invoicesRes.value?.data || []);
            }
        } catch (err) {
            console.error('[BillingSummary] Failed to load billing data:', err);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyId]);

    useEffect(() => {
        if (companyId) fetchBillingData();
    }, [companyId, fetchBillingData]);

    if (loading) {
        return (
            <ContentCard title="Billing" icon="fa-credit-card" className="bg-base-200">
                <SkeletonList count={3} variant="text-block" gap="gap-3" />
            </ContentCard>
        );
    }

    const status = readiness?.status || 'not_started';

    // Not set up — show setup CTA
    if (status === 'not_started') {
        return (
            <ContentCard title="Billing" icon="fa-credit-card" className="bg-base-200">
                <EmptyState
                    icon="fa-file-invoice-dollar"
                    title="Set up billing"
                    description="Configure billing to enable placement invoicing for your hires."
                    size="sm"
                    action={
                        <Link href="/portal/company/settings" className="btn btn-primary btn-sm">
                            <i className="fa-duotone fa-regular fa-rocket mr-1"></i>
                            Get Started
                        </Link>
                    }
                />
            </ContentCard>
        );
    }

    const billingTerms = BILLING_TERMS_LABELS[readiness?.billing_terms || ''] || readiness?.billing_terms || '—';
    const openInvoices = invoices.filter(inv => inv.invoice_status === 'open');
    const openTotal = openInvoices.reduce((sum, inv) => sum + inv.amount_due, 0);

    return (
        <ContentCard
            title="Billing"
            icon="fa-credit-card"
            className="bg-base-200"
            headerActions={
                <Link href="/portal/billing" className="btn btn-sm btn-ghost text-xs">
                    Manage
                    <i className="fa-duotone fa-regular fa-arrow-right ml-1"></i>
                </Link>
            }
        >
            <div className="space-y-4">
                {/* Status indicators */}
                {status === 'incomplete' && (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-warning/10 border border-warning/20">
                        <i className="fa-duotone fa-regular fa-triangle-exclamation text-warning text-sm"></i>
                        <span className="text-xs font-medium text-warning">Billing setup incomplete</span>
                        <Link href="/portal/company/settings" className="ml-auto text-xs font-semibold text-warning hover:underline">
                            Complete
                        </Link>
                    </div>
                )}

                {/* Billing details row */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <div className="text-xs text-base-content/50 mb-0.5">Payment terms</div>
                        <div className="text-sm font-semibold">{billingTerms}</div>
                    </div>
                    <div>
                        <div className="text-xs text-base-content/50 mb-0.5">Payment method</div>
                        {paymentMethod ? (
                            <div className="text-sm font-semibold flex items-center gap-1.5">
                                <i className={`fa-brands fa-${paymentMethod.brand?.toLowerCase() || 'credit-card'} text-base`}></i>
                                <span className="tabular-nums">
                                    {paymentMethod.brand ? `${paymentMethod.brand} ` : ''}
                                    ••{paymentMethod.last4}
                                </span>
                            </div>
                        ) : (
                            <div className="text-sm text-base-content/40">Not set</div>
                        )}
                    </div>
                </div>

                {/* Outstanding balance */}
                {openInvoices.length > 0 && (
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-info/10 border border-info/20">
                        <div className="flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-file-invoice text-info text-sm"></i>
                            <span className="text-xs text-base-content/70">
                                {openInvoices.length} open invoice{openInvoices.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <span className="text-sm font-bold tabular-nums text-info">
                            {formatCurrency(openTotal)}
                        </span>
                    </div>
                )}

                {/* Recent invoices */}
                {invoices.length > 0 && (
                    <div>
                        <div className="text-xs text-base-content/50 mb-2">Recent invoices</div>
                        <div className="space-y-1 -mx-2">
                            {invoices.slice(0, 4).map((invoice) => {
                                const badge = STATUS_BADGES[invoice.invoice_status] || STATUS_BADGES.draft;
                                return (
                                    <div
                                        key={invoice.id}
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-300/50 transition-all"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium tabular-nums">
                                                    {formatCurrency(invoice.amount_due, invoice.currency)}
                                                </span>
                                                <span className={`badge badge-xs ${badge.class}`}>{badge.label}</span>
                                            </div>
                                            <div className="text-xs text-base-content/50 mt-0.5">
                                                {invoice.stripe_invoice_number || `INV-${invoice.id.slice(0, 8)}`}
                                                <span className="text-base-content/30 mx-1">&middot;</span>
                                                {formatShortDate(invoice.created_at)}
                                            </div>
                                        </div>
                                        {invoice.hosted_invoice_url && (
                                            <a
                                                href={invoice.hosted_invoice_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-xs btn-ghost shrink-0"
                                            >
                                                <i className="fa-duotone fa-regular fa-arrow-up-right-from-square"></i>
                                            </a>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {invoices.length === 0 && status === 'ready' && (
                    <div className="text-center py-3">
                        <p className="text-xs text-base-content/40">No invoices yet</p>
                    </div>
                )}
            </div>
        </ContentCard>
    );
}
