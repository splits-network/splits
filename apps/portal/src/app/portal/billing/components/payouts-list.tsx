'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ContentCard, EmptyState } from '@/components/ui/cards';
import { Payout, PayoutStatus } from '../types';

interface PayoutsListProps {
    payouts: Payout[];
    loading?: boolean;
    onViewAll?: () => void;
}

/**
 * PayoutsList - Shows recent payout transactions
 */
export function PayoutsList({ payouts, loading, onViewAll }: PayoutsListProps) {
    if (loading) {
        return (
            <ContentCard title="Recent Payouts" icon="fa-money-bill-transfer" loading>
                <div className="h-48"></div>
            </ContentCard>
        );
    }

    return (
        <ContentCard
            title="Recent Payouts"
            icon="fa-money-bill-transfer"
            headerActions={
                onViewAll && (
                    <button onClick={onViewAll} className="btn btn-sm btn-ghost">
                        View All
                        <i className="fa-duotone fa-regular fa-arrow-right"></i>
                    </button>
                )
            }
        >
            {payouts.length === 0 ? (
                <EmptyState
                    icon="fa-money-bill-transfer"
                    title="No payouts yet"
                    description="Your commission payouts will appear here once you make placements."
                    size="sm"
                />
            ) : (
                <div className="divide-y divide-base-200">
                    {payouts.slice(0, 5).map((payout) => (
                        <PayoutRow key={payout.id} payout={payout} />
                    ))}
                </div>
            )}
        </ContentCard>
    );
}

function PayoutRow({ payout }: { payout: Payout }) {
    const statusConfig = getStatusConfig(payout.status);
    
    return (
        <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${statusConfig.bgClass} flex items-center justify-center`}>
                    <i className={`fa-duotone fa-regular ${statusConfig.icon} ${statusConfig.textClass}`}></i>
                </div>
                <div>
                    <div className="font-medium">
                        {payout.placement?.candidate_name || 'Commission Payout'}
                    </div>
                    <div className="text-sm text-base-content/60">
                        {payout.placement?.job_title && payout.placement?.company_name
                            ? `${payout.placement.job_title} at ${payout.placement.company_name}`
                            : formatDate(payout.created_at)
                        }
                    </div>
                </div>
            </div>
            <div className="text-right">
                <div className="font-semibold text-success">
                    +${(payout.amount / 100).toLocaleString()}
                </div>
                <div className={`badge badge-sm ${statusConfig.badgeClass}`}>
                    {statusConfig.label}
                </div>
            </div>
        </div>
    );
}

function getStatusConfig(status: PayoutStatus) {
    switch (status) {
        case 'completed':
            return {
                label: 'Paid',
                icon: 'fa-check-circle',
                bgClass: 'bg-success/10',
                textClass: 'text-success',
                badgeClass: 'badge-success',
            };
        case 'processing':
            return {
                label: 'Processing',
                icon: 'fa-spinner',
                bgClass: 'bg-info/10',
                textClass: 'text-info',
                badgeClass: 'badge-info',
            };
        case 'pending':
            return {
                label: 'Pending',
                icon: 'fa-clock',
                bgClass: 'bg-warning/10',
                textClass: 'text-warning',
                badgeClass: 'badge-warning',
            };
        case 'failed':
            return {
                label: 'Failed',
                icon: 'fa-times-circle',
                bgClass: 'bg-error/10',
                textClass: 'text-error',
                badgeClass: 'badge-error',
            };
        case 'on_hold':
            return {
                label: 'On Hold',
                icon: 'fa-pause-circle',
                bgClass: 'bg-neutral/10',
                textClass: 'text-neutral',
                badgeClass: 'badge-neutral',
            };
        default:
            return {
                label: status,
                icon: 'fa-circle',
                bgClass: 'bg-base-200',
                textClass: 'text-base-content',
                badgeClass: 'badge-ghost',
            };
    }
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

interface Invoice {
    id: string;
    number: string;
    amount_due: number;
    amount_paid: number;
    status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
    due_date?: string;
    paid_at?: string;
    created_at: string;
    invoice_pdf?: string;
    hosted_invoice_url?: string;
}

interface InvoicesListProps {
    invoices: Invoice[];
    loading?: boolean;
    onManageBilling?: () => void;
}

/**
 * InvoicesList - Shows billing invoices
 */
export function InvoicesList({ invoices, loading, onManageBilling }: InvoicesListProps) {
    if (loading) {
        return (
            <ContentCard title="Invoices" icon="fa-file-invoice" loading>
                <div className="h-48"></div>
            </ContentCard>
        );
    }

    return (
        <ContentCard
            title="Invoices"
            icon="fa-file-invoice"
            headerActions={
                onManageBilling && (
                    <button onClick={onManageBilling} className="btn btn-sm btn-ghost">
                        View All in Stripe
                        <i className="fa-duotone fa-regular fa-external-link"></i>
                    </button>
                )
            }
        >
            {invoices.length === 0 ? (
                <EmptyState
                    icon="fa-file-invoice"
                    title="No invoices yet"
                    description="Your subscription invoices will appear here."
                    size="sm"
                />
            ) : (
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Invoice</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.slice(0, 5).map((invoice) => (
                                <InvoiceRow key={invoice.id} invoice={invoice} />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </ContentCard>
    );
}

function InvoiceRow({ invoice }: { invoice: Invoice }) {
    const statusConfig = getInvoiceStatusConfig(invoice.status);

    return (
        <tr>
            <td>
                <span className="font-mono text-sm">{invoice.number || `INV-${invoice.id.slice(0, 8)}`}</span>
            </td>
            <td>{formatDate(invoice.created_at)}</td>
            <td className="font-semibold">${(invoice.amount_due / 100).toFixed(2)}</td>
            <td>
                <span className={`badge badge-sm ${statusConfig.badgeClass}`}>
                    {statusConfig.label}
                </span>
            </td>
            <td>
                {invoice.invoice_pdf && (
                    <a
                        href={invoice.invoice_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost btn-xs"
                    >
                        <i className="fa-duotone fa-regular fa-download"></i>
                    </a>
                )}
                {invoice.hosted_invoice_url && (
                    <a
                        href={invoice.hosted_invoice_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost btn-xs"
                    >
                        <i className="fa-duotone fa-regular fa-external-link"></i>
                    </a>
                )}
            </td>
        </tr>
    );
}

function getInvoiceStatusConfig(status: Invoice['status']) {
    switch (status) {
        case 'paid':
            return { label: 'Paid', badgeClass: 'badge-success' };
        case 'open':
            return { label: 'Open', badgeClass: 'badge-warning' };
        case 'draft':
            return { label: 'Draft', badgeClass: 'badge-ghost' };
        case 'void':
            return { label: 'Void', badgeClass: 'badge-neutral' };
        case 'uncollectible':
            return { label: 'Uncollectible', badgeClass: 'badge-error' };
        default:
            return { label: status, badgeClass: 'badge-ghost' };
    }
}

/**
 * BillingHistorySection - Combined payouts and invoices view
 */
interface BillingHistoryProps {
    payouts: Payout[];
    invoices: Invoice[];
    loading?: boolean;
    onManageBilling?: () => void;
}

export function BillingHistorySection({ payouts, invoices, loading, onManageBilling }: BillingHistoryProps) {
    const [activeTab, setActiveTab] = useState<'payouts' | 'invoices'>('payouts');

    return (
        <ContentCard
            title="Billing History"
            icon="fa-history"
            headerActions={
                <div className="tabs tabs-box">
                    <button
                        className={`tab ${activeTab === 'payouts' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('payouts')}
                    >
                        Payouts
                    </button>
                    <button
                        className={`tab ${activeTab === 'invoices' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('invoices')}
                    >
                        Invoices
                    </button>
                </div>
            }
        >
            {activeTab === 'payouts' ? (
                payouts.length === 0 ? (
                    <EmptyState
                        icon="fa-money-bill-transfer"
                        title="No payouts yet"
                        description="Your commission payouts will appear here once you make placements."
                        size="sm"
                    />
                ) : (
                    <div className="divide-y divide-base-200">
                        {payouts.slice(0, 5).map((payout) => (
                            <PayoutRow key={payout.id} payout={payout} />
                        ))}
                    </div>
                )
            ) : (
                invoices.length === 0 ? (
                    <EmptyState
                        icon="fa-file-invoice"
                        title="No invoices yet"
                        description="Your subscription invoices will appear here."
                        size="sm"
                    />
                ) : (
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Invoice</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.slice(0, 5).map((invoice) => (
                                    <InvoiceRow key={invoice.id} invoice={invoice} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {/* Footer with Stripe portal link */}
            {onManageBilling && (
                <div className="mt-4 pt-4 border-t border-base-200 flex justify-between items-center">
                    <span className="text-sm text-base-content/60">
                        Need to update payment method or view full history?
                    </span>
                    <button onClick={onManageBilling} className="btn btn-sm btn-outline">
                        <i className="fa-duotone fa-regular fa-external-link"></i>
                        Stripe Portal
                    </button>
                </div>
            )}
        </ContentCard>
    );
}
