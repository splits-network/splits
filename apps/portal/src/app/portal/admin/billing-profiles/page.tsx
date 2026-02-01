'use client';

import { useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import {
    useStandardList,
    PaginationControls,
    SearchInput,
    EmptyState,
    LoadingState,
    ErrorState,
} from '@/hooks/use-standard-list';

interface CompanyBillingProfile {
    id: string;
    company_id: string;
    billing_terms: 'immediate' | 'net_30' | 'net_60' | 'net_90';
    billing_email: string | null;
    invoice_delivery_method: 'email' | 'none';
    stripe_customer_id: string | null;
    stripe_default_payment_method_id?: string | null;
    stripe_tax_id?: string | null;
    billing_contact_name?: string | null;
    billing_address?: Record<string, any> | null;
    created_at: string;
    updated_at: string;
    company?: { id: string; name: string } | null;
}

interface PlacementInvoice {
    id: string;
    placement_id: string;
    company_id: string;
    stripe_invoice_id: string | null;
    stripe_invoice_number: string | null;
    invoice_status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
    amount_due: number;
    amount_paid: number;
    currency: string;
    collection_method: 'charge_automatically' | 'send_invoice';
    billing_terms: 'immediate' | 'net_30' | 'net_60' | 'net_90';
    due_date: string | null;
    collectible_at: string | null;
    finalized_at: string | null;
    paid_at: string | null;
    voided_at: string | null;
    failure_reason: string | null;
    hosted_invoice_url: string | null;
    invoice_pdf_url: string | null;
    created_at: string;
}

export default function AdminBillingProfilesPage() {
    const { getToken } = useAuth();
    const [selectedProfile, setSelectedProfile] = useState<CompanyBillingProfile | null>(null);

    const {
        items: profiles,
        loading,
        error,
        pagination,
        searchInput,
        setSearchInput,
        setPage,
        refresh,
    } = useStandardList<CompanyBillingProfile>({
        endpoint: '/company-billing-profiles',
        defaultSortBy: 'created_at',
        defaultSortOrder: 'desc',
        defaultLimit: 25,
        syncToUrl: true,
    });

    const visibleProfiles = useMemo(() => {
        const query = searchInput.trim().toLowerCase();
        if (!query) return profiles;
        return profiles.filter((profile) => {
            const haystack = [
                profile.company?.name,
                profile.billing_email,
                profile.billing_contact_name,
                profile.company_id,
                profile.stripe_customer_id,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            return haystack.includes(query);
        });
    }, [profiles, searchInput]);

    const fetchInvoices = useCallback(
        async (params: { page: number; limit: number }) => {
            if (!selectedProfile?.company_id) {
                return {
                    data: [] as PlacementInvoice[],
                    pagination: {
                        total: 0,
                        page: params.page,
                        limit: params.limit,
                        total_pages: 0,
                    },
                };
            }

            const token = await getToken();
            if (!token) throw new Error('No auth token');
            const apiClient = createAuthenticatedClient(token);
            const queryParams = new URLSearchParams();
            queryParams.set('page', String(params.page));
            queryParams.set('limit', String(params.limit));

            const response = await apiClient.get(
                `/company-billing-profiles/${selectedProfile.company_id}/invoices?${queryParams.toString()}`
            );

            return response;
        },
        [getToken, selectedProfile?.company_id]
    );

    const {
        items: invoices,
        loading: invoicesLoading,
        error: invoicesError,
        pagination: invoicesPagination,
        setPage: setInvoicePage,
        refresh: refreshInvoices,
    } = useStandardList<PlacementInvoice>({
        fetchFn: fetchInvoices,
        defaultLimit: 10,
        defaultSortBy: 'created_at',
        defaultSortOrder: 'desc',
        syncToUrl: false,
        autoFetch: true,
    });

    function StatusBadge({ status }: { status: PlacementInvoice['invoice_status'] }) {
        const colors: Record<string, string> = {
            draft: 'badge-ghost',
            open: 'badge-info',
            paid: 'badge-success',
            void: 'badge-neutral',
            uncollectible: 'badge-error',
        };
        return (
            <span className={`badge ${colors[status] || 'badge-neutral'} gap-1`}>
                {status === 'draft' && <i className="fa-duotone fa-regular fa-file-pen"></i>}
                {status === 'open' && <i className="fa-duotone fa-regular fa-envelope-open"></i>}
                {status === 'paid' && <i className="fa-duotone fa-regular fa-check"></i>}
                {status === 'void' && <i className="fa-duotone fa-regular fa-ban"></i>}
                {status === 'uncollectible' && <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>}
                {status}
            </span>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <Link href="/admin" className="text-sm text-primary hover:underline mb-2 inline-block">
                    <i className="fa-duotone fa-regular fa-arrow-left mr-2"></i>
                    Back to Admin Dashboard
                </Link>
                <h1 className="text-3xl font-bold">Billing Profiles</h1>
                <p className="text-base-content/70 mt-1">
                    Review company billing terms, contacts, and invoice history
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_1fr] gap-6">
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <SearchInput
                            value={searchInput}
                            onChange={setSearchInput}
                            placeholder="Search company, email, or Stripe customer..."
                        />
                        <button className="btn btn-sm btn-ghost" onClick={() => refresh()}>
                            <i className="fa-duotone fa-regular fa-arrows-rotate"></i>
                            Refresh
                        </button>
                    </div>

                    {loading ? (
                        <LoadingState />
                    ) : error ? (
                        <ErrorState message={error} onRetry={refresh} />
                    ) : visibleProfiles.length === 0 ? (
                        <EmptyState
                            icon="fa-duotone fa-regular fa-file-invoice"
                            title="No billing profiles found"
                            description="Profiles appear once company billing details are saved."
                        />
                    ) : (
                        <div className="card bg-base-100 shadow">
                            <div className="card-body p-0">
                                <div className="overflow-x-auto">
                                    <table className="table table-zebra">
                                        <thead>
                                            <tr>
                                                <th>Company</th>
                                                <th>Billing Email</th>
                                                <th>Terms</th>
                                                <th>Stripe</th>
                                                <th>Created</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {visibleProfiles.map((profile) => {
                                                const isSelected = selectedProfile?.id === profile.id;
                                                return (
                                                    <tr key={profile.id} className={isSelected ? 'bg-base-200' : ''}>
                                                        <td>
                                                            <div className="font-semibold">
                                                                {profile.company?.name || 'Unknown Company'}
                                                            </div>
                                                            <div className="text-xs text-base-content/60 font-mono">
                                                                {profile.company_id.substring(0, 8)}...
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="text-sm">{profile.billing_email || '-'}</div>
                                                            {profile.billing_contact_name && (
                                                                <div className="text-xs text-base-content/60">
                                                                    {profile.billing_contact_name}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="uppercase text-xs tracking-wide">
                                                            {profile.billing_terms.replace('_', ' ')}
                                                        </td>
                                                        <td>
                                                            {profile.stripe_customer_id ? (
                                                                <span className="badge badge-success gap-1">
                                                                    <i className="fa-duotone fa-regular fa-link"></i>
                                                                    Connected
                                                                </span>
                                                            ) : (
                                                                <span className="badge badge-ghost gap-1">
                                                                    <i className="fa-duotone fa-regular fa-link-slash"></i>
                                                                    Not linked
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {new Date(profile.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="text-right">
                                                            <button
                                                                className={`btn btn-xs ${isSelected ? 'btn-primary' : 'btn-ghost'}`}
                                                                onClick={() => {
                                                                    setSelectedProfile(profile);
                                                                    setInvoicePage(1);
                                                                }}
                                                            >
                                                                {isSelected ? 'Selected' : 'View invoices'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {!loading && !error && visibleProfiles.length > 0 && (
                        <PaginationControls pagination={pagination} setPage={setPage} />
                    )}
                </div>

                <div className="space-y-4">
                    <div className="card bg-base-100 shadow">
                        <div className="card-body">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-file-invoice-dollar"></i>
                                Invoice History
                            </h2>
                            {selectedProfile ? (
                                <div className="text-sm text-base-content/70">
                                    {selectedProfile.company?.name || 'Company'} · {selectedProfile.billing_terms.replace('_', ' ')}
                                </div>
                            ) : (
                                <div className="text-sm text-base-content/70">
                                    Select a billing profile to view invoices.
                                </div>
                            )}
                        </div>
                    </div>

                    {!selectedProfile ? null : invoicesLoading ? (
                        <LoadingState />
                    ) : invoicesError ? (
                        <ErrorState message={invoicesError} onRetry={refreshInvoices} />
                    ) : invoices.length === 0 ? (
                        <EmptyState
                            icon="fa-duotone fa-regular fa-file-invoice"
                            title="No invoices yet"
                            description="Invoices will appear after guarantee periods and billing runs."
                        />
                    ) : (
                        <div className="card bg-base-100 shadow">
                            <div className="card-body p-0">
                                <div className="overflow-x-auto">
                                    <table className="table table-zebra">
                                        <thead>
                                            <tr>
                                                <th>Invoice</th>
                                                <th>Status</th>
                                                <th>Amount</th>
                                                <th>Due</th>
                                                <th>Links</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoices.map((invoice) => (
                                                <tr key={invoice.id}>
                                                    <td>
                                                        <div className="font-mono text-sm">
                                                            {invoice.stripe_invoice_number || invoice.id.substring(0, 8)}
                                                        </div>
                                                        <div className="text-xs text-base-content/60">
                                                            Placement {invoice.placement_id.substring(0, 8)}...
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <StatusBadge status={invoice.invoice_status} />
                                                    </td>
                                                    <td>
                                                        <div className="font-semibold">
                                                            ${Number(invoice.amount_due || 0).toLocaleString()}
                                                        </div>
                                                        <div className="text-xs text-base-content/60">
                                                            Paid ${Number(invoice.amount_paid || 0).toLocaleString()}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {invoice.due_date
                                                            ? new Date(invoice.due_date).toLocaleDateString()
                                                            : '-'}
                                                    </td>
                                                    <td>
                                                        <div className="flex gap-2">
                                                            {invoice.hosted_invoice_url && (
                                                                <a
                                                                    className="btn btn-xs btn-ghost"
                                                                    href={invoice.hosted_invoice_url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                >
                                                                    <i className="fa-duotone fa-regular fa-link"></i>
                                                                    Hosted
                                                                </a>
                                                            )}
                                                            {invoice.invoice_pdf_url && (
                                                                <a
                                                                    className="btn btn-xs btn-ghost"
                                                                    href={invoice.invoice_pdf_url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                >
                                                                    <i className="fa-duotone fa-regular fa-file-pdf"></i>
                                                                    PDF
                                                                </a>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {!invoicesLoading && !invoicesError && invoices.length > 0 && (
                        <PaginationControls pagination={invoicesPagination} setPage={setInvoicePage} />
                    )}
                </div>
            </div>
        </div>
    );
}
