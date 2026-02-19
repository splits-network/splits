'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useUserProfile } from '@/contexts';
import { createAuthenticatedClient } from '@/lib/api-client';
import { Badge, AlertBanner } from '@splits-network/memphis-ui';
import { MemphisCard, MemphisEmpty, MemphisSkeleton, MemphisBtn } from './primitives';
import { ACCENT } from './accent';

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

const STATUS_BADGE: Record<string, { color: 'teal' | 'yellow' | 'coral' | 'dark' | 'purple'; label: string }> = {
    draft: { color: 'dark', label: 'Draft' },
    open: { color: 'yellow', label: 'Due' },
    paid: { color: 'teal', label: 'Paid' },
    void: { color: 'dark', label: 'Void' },
    uncollectible: { color: 'coral', label: 'Failed' },
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
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function BillingSummary() {
    const { getToken } = useAuth();
    const { profile } = useUserProfile();
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [readiness, setReadiness] = useState<BillingReadiness | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
    const [invoices, setInvoices] = useState<RecentInvoice[]>([]);

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
                client.get(`/company-billing-profiles/${companyId}/invoices`, { params: { page: '1', limit: '5' } }),
            ]);

            if (readinessRes.status === 'fulfilled') setReadiness(readinessRes.value?.data || null);
            if (pmRes.status === 'fulfilled') {
                const pmData = pmRes.value?.data as PaymentMethodResponse | undefined;
                setPaymentMethod(pmData?.default_payment_method || null);
            }
            if (invoicesRes.status === 'fulfilled') setInvoices(invoicesRes.value?.data || []);
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

    const headerRight = (
        <MemphisBtn href="/portal/billing" accent={ACCENT[2]} variant="ghost" size="sm">
            Manage <i className="fa-duotone fa-regular fa-arrow-right" />
        </MemphisBtn>
    );

    if (loading) {
        return (
            <MemphisCard title="Billing" icon="fa-credit-card" accent={ACCENT[2]} headerRight={headerRight}>
                <MemphisSkeleton count={3} />
            </MemphisCard>
        );
    }

    const status = readiness?.status || 'not_started';

    if (status === 'not_started') {
        return (
            <MemphisCard title="Billing" icon="fa-credit-card" accent={ACCENT[2]} headerRight={headerRight}>
                <MemphisEmpty
                    icon="fa-file-invoice-dollar"
                    title="Set up billing"
                    description="Configure billing to enable placement invoicing."
                    action={
                        <MemphisBtn href="/portal/company/settings" accent={ACCENT[1]}>
                            <i className="fa-duotone fa-regular fa-rocket" /> Get Started
                        </MemphisBtn>
                    }
                />
            </MemphisCard>
        );
    }

    const billingTerms = BILLING_TERMS_LABELS[readiness?.billing_terms || ''] || readiness?.billing_terms || '\u2014';
    const openInvoices = invoices.filter(inv => inv.invoice_status === 'open');
    const openTotal = openInvoices.reduce((sum, inv) => sum + inv.amount_due, 0);

    return (
        <MemphisCard title="Billing" icon="fa-credit-card" accent={ACCENT[2]} headerRight={headerRight}>
            <div className="space-y-4">
                {/* Incomplete warning */}
                {status === 'incomplete' && (
                    <AlertBanner type="warning" color="yellow" soft>
                        <div className="flex items-center justify-between w-full">
                            <span className="text-[10px] font-black uppercase tracking-wider text-dark">
                                Setup incomplete
                            </span>
                            <Link href="/portal/company/settings" className="text-[10px] font-black uppercase tracking-wider text-coral hover:underline">
                                Complete
                            </Link>
                        </div>
                    </AlertBanner>
                )}

                {/* Details */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-dark/40 mb-0.5">Terms</div>
                        <div className="text-sm font-bold text-dark">{billingTerms}</div>
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-dark/40 mb-0.5">Payment</div>
                        {paymentMethod ? (
                            <div className="text-sm font-bold text-dark flex items-center gap-1.5">
                                <i className={`fa-brands fa-${paymentMethod.brand?.toLowerCase() || 'credit-card'}`} />
                                <span className="tabular-nums">
                                    {paymentMethod.brand ? `${paymentMethod.brand} ` : ''}
                                    ••{paymentMethod.last4}
                                </span>
                            </div>
                        ) : (
                            <div className="text-sm text-dark/30">Not set</div>
                        )}
                    </div>
                </div>

                {/* Open balance */}
                {openInvoices.length > 0 && (
                    <div className="border-4 border-teal bg-teal/10 p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-file-invoice text-teal" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-dark/70">
                                {openInvoices.length} open invoice{openInvoices.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <span className="text-sm font-black tabular-nums text-teal">
                            {formatCurrency(openTotal)}
                        </span>
                    </div>
                )}

                {/* Recent invoices */}
                {invoices.length > 0 && (
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-dark/40 mb-2">
                            Recent Invoices
                        </div>
                        <div className="space-y-1">
                            {invoices.slice(0, 4).map((invoice) => {
                                const cfg = STATUS_BADGE[invoice.invoice_status] || STATUS_BADGE.draft;
                                return (
                                    <div key={invoice.id} className="flex items-center gap-3 p-2 border-b border-dark/10 last:border-0">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold tabular-nums text-dark">
                                                    {formatCurrency(invoice.amount_due, invoice.currency)}
                                                </span>
                                                <Badge color={cfg.color} size="xs">
                                                    {cfg.label}
                                                </Badge>
                                            </div>
                                            <div className="text-[10px] text-dark/40 mt-0.5">
                                                {invoice.stripe_invoice_number || `INV-${invoice.id.slice(0, 8)}`}
                                                <span className="mx-1">&middot;</span>
                                                {formatShortDate(invoice.created_at)}
                                            </div>
                                        </div>
                                        {invoice.hosted_invoice_url && (
                                            <a
                                                href={invoice.hosted_invoice_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-dark/30 hover:text-coral transition-colors"
                                            >
                                                <i className="fa-duotone fa-regular fa-arrow-up-right-from-square" />
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
                        <p className="text-[10px] font-bold uppercase tracking-wider text-dark/30">No invoices yet</p>
                    </div>
                )}
            </div>
        </MemphisCard>
    );
}
