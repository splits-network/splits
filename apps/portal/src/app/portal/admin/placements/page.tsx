'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { useToast } from '@/lib/toast-context';
import {
    useStandardList,
    PaginationControls,
    SearchInput,
    EmptyState,
    LoadingState,
    ErrorState,
} from '@/hooks/use-standard-list';

interface Placement {
    id: string;
    job_id: string;
    candidate_id: string;
    company_id: string;
    state: string;
    salary: number;
    fee_percentage: number;
    placement_fee: number;
    start_date: string;
    guarantee_days: number;
    guarantee_expires_at: string;
    created_at: string;
    // Enriched data
    job_title?: string;
    candidate_name?: string;
    company_name?: string;
}

interface PlacementInvoice {
    id: string;
    placement_id: string;
    stripe_invoice_id: string;
    invoice_status: string;
    amount_due: number;
    hosted_invoice_url?: string;
}

interface PlacementFilters {
    state?: string;
    date_from?: string;
    date_to?: string;
}

export default function PlacementAdminPage() {
    const { getToken } = useAuth();
    const toast = useToast();
    const [invoiceCache, setInvoiceCache] = useState<Record<string, PlacementInvoice | null>>({});
    const [loadingInvoice, setLoadingInvoice] = useState<string | null>(null);
    const [creatingInvoice, setCreatingInvoice] = useState<string | null>(null);

    const defaultFilters = useMemo<PlacementFilters>(() => ({}), []);

    const {
        items: placements,
        loading,
        error,
        pagination,
        filters,
        search,
        setSearch,
        setFilters,
        setPage,
        refresh,
    } = useStandardList<Placement, PlacementFilters>({
        fetchFn: async (params) => {
            const token = await getToken();
            if (!token) throw new Error('No auth token');
            const apiClient = createAuthenticatedClient(token);

            const queryParams = new URLSearchParams();
            queryParams.set('page', String(params.page));
            queryParams.set('limit', String(params.limit));
            if (params.search) queryParams.set('search', params.search);
            if (params.filters?.state) queryParams.set('state', params.filters.state);
            if (params.filters?.date_from) queryParams.set('date_from', params.filters.date_from);
            if (params.filters?.date_to) queryParams.set('date_to', params.filters.date_to);
            if (params.sort_by) queryParams.set('sort_by', params.sort_by);
            if (params.sort_order) queryParams.set('sort_order', params.sort_order);

            const response = await apiClient.get(`/placements?${queryParams.toString()}`);
            return response;
        },
        defaultFilters,
        syncToUrl: true,
    });

    const fetchInvoice = async (placementId: string) => {
        if (invoiceCache[placementId] !== undefined) return;

        setLoadingInvoice(placementId);
        try {
            const token = await getToken();
            if (!token) return;
            const apiClient = createAuthenticatedClient(token);
            const response = await apiClient.get(`/placements/${placementId}/invoices`);
            setInvoiceCache(prev => ({ ...prev, [placementId]: response.data || null }));
        } catch {
            setInvoiceCache(prev => ({ ...prev, [placementId]: null }));
        } finally {
            setLoadingInvoice(null);
        }
    };

    const createInvoice = async (placementId: string) => {
        setCreatingInvoice(placementId);
        try {
            const token = await getToken();
            if (!token) throw new Error('No auth token');
            const apiClient = createAuthenticatedClient(token);
            const response = await apiClient.post(`/placements/${placementId}/invoices`, {});
            setInvoiceCache(prev => ({ ...prev, [placementId]: response.data }));
            toast.success('Invoice created successfully');
        } catch (err: any) {
            toast.error(err.message || 'Failed to create invoice');
        } finally {
            setCreatingInvoice(null);
        }
    };

    const getStateBadge = (state: string) => {
        switch (state) {
            case 'active':
                return <span className="badge badge-info badge-sm">Active</span>;
            case 'completed':
                return <span className="badge badge-success badge-sm">Completed</span>;
            case 'failed':
                return <span className="badge badge-error badge-sm">Failed</span>;
            case 'hired':
                return <span className="badge badge-warning badge-sm">Hired</span>;
            default:
                return <span className="badge badge-ghost badge-sm">{state}</span>;
        }
    };

    const getInvoiceStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <span className="badge badge-success badge-sm">Paid</span>;
            case 'open':
                return <span className="badge badge-warning badge-sm">Open</span>;
            case 'draft':
                return <span className="badge badge-ghost badge-sm">Draft</span>;
            case 'void':
                return <span className="badge badge-error badge-sm">Void</span>;
            case 'uncollectible':
                return <span className="badge badge-error badge-sm">Uncollectible</span>;
            default:
                return <span className="badge badge-ghost badge-sm">{status}</span>;
        }
    };

    const totalValue = placements.reduce((sum, p) => sum + (p.salary || 0), 0);
    const totalFees = placements.reduce((sum, p) => sum + (p.placement_fee || 0), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link href="/portal/admin" className="text-sm text-primary hover:underline mb-2 inline-block">
                    <i className="fa-duotone fa-regular fa-arrow-left mr-2"></i>
                    Back to Admin Dashboard
                </Link>
                <h1 className="text-3xl font-bold">Placement Management</h1>
                <p className="text-base-content/70 mt-1">
                    Review placements, invoices, and billing status
                </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="stat bg-base-100 shadow rounded-lg">
                    <div className="stat-title">Total Placements</div>
                    <div className="stat-value text-primary">
                        {loading ? '...' : pagination.total}
                    </div>
                </div>

                <div className="stat bg-base-100 shadow rounded-lg">
                    <div className="stat-title">Page Salaries</div>
                    <div className="stat-value text-2xl">
                        {loading ? '...' : `$${(totalValue / 1000).toFixed(0)}k`}
                    </div>
                </div>

                <div className="stat bg-base-100 shadow rounded-lg">
                    <div className="stat-title">Page Fees</div>
                    <div className="stat-value text-2xl text-success">
                        {loading ? '...' : `$${(totalFees / 1000).toFixed(0)}k`}
                    </div>
                </div>

                <div className="stat bg-base-100 shadow rounded-lg">
                    <div className="stat-title">Actions</div>
                    <div className="stat-value text-2xl">
                        <button
                            className="btn btn-sm btn-primary"
                            onClick={refresh}
                            disabled={loading}
                        >
                            <i className="fa-duotone fa-regular fa-refresh"></i>
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap gap-4 items-center">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search placements..."
                />
                <select
                    className="select select-sm"
                    value={filters.state || ''}
                    onChange={(e) => setFilters({ ...filters, state: e.target.value || undefined })}
                >
                    <option value="">All States</option>
                    <option value="hired">Hired</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                </select>
                <div className="flex items-center gap-2">
                    <label className="text-sm text-base-content/70">From:</label>
                    <input
                        type="date"
                        className="input input-sm"
                        value={filters.date_from || ''}
                        onChange={(e) => setFilters({ ...filters, date_from: e.target.value || undefined })}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm text-base-content/70">To:</label>
                    <input
                        type="date"
                        className="input input-sm"
                        value={filters.date_to || ''}
                        onChange={(e) => setFilters({ ...filters, date_to: e.target.value || undefined })}
                    />
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <LoadingState />
            ) : error ? (
                <ErrorState message={error} onRetry={refresh} />
            ) : placements.length === 0 ? (
                <EmptyState
                    icon="fa-duotone fa-regular fa-trophy"
                    title="No placements found"
                    description={
                        search || filters.state || filters.date_from || filters.date_to
                            ? 'Try adjusting your search or filters'
                            : 'Placements will appear here once candidates are hired'
                    }
                />
            ) : (
                <div className="card bg-base-100 shadow">
                    <div className="card-body p-0">
                        <div className="overflow-x-auto">
                            <table className="table table-zebra">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>State</th>
                                        <th>Candidate</th>
                                        <th>Salary</th>
                                        <th>Fee</th>
                                        <th>Guarantee</th>
                                        <th>Invoice</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {placements.map((placement) => {
                                        const invoice = invoiceCache[placement.id];
                                        const isLoadingInvoice = loadingInvoice === placement.id;
                                        const isCreating = creatingInvoice === placement.id;
                                        const guaranteeExpired = placement.guarantee_expires_at &&
                                            new Date(placement.guarantee_expires_at) <= new Date();

                                        return (
                                            <tr key={placement.id}>
                                                <td>
                                                    <div className="font-mono text-xs">{placement.id.slice(0, 8)}</div>
                                                </td>
                                                <td>{getStateBadge(placement.state)}</td>
                                                <td>
                                                    <div className="font-medium">{placement.candidate_name || 'N/A'}</div>
                                                    <div className="text-xs text-base-content/60">{placement.job_title || 'N/A'}</div>
                                                </td>
                                                <td className="font-semibold">
                                                    ${(placement.salary || 0).toLocaleString()}
                                                </td>
                                                <td>
                                                    <div className="text-success font-semibold">
                                                        ${(placement.placement_fee || 0).toLocaleString()}
                                                    </div>
                                                    <div className="text-xs text-base-content/60">
                                                        {placement.fee_percentage}%
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="text-xs">
                                                        {placement.guarantee_days} days
                                                    </div>
                                                    {placement.guarantee_expires_at && (
                                                        <div className={`text-xs ${guaranteeExpired ? 'text-success' : 'text-warning'}`}>
                                                            {guaranteeExpired ? 'Expired' : 'Active'}
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    {invoice === undefined ? (
                                                        <button
                                                            className="btn btn-xs btn-ghost"
                                                            onClick={() => fetchInvoice(placement.id)}
                                                            disabled={isLoadingInvoice}
                                                        >
                                                            {isLoadingInvoice ? (
                                                                <span className="loading loading-spinner loading-xs"></span>
                                                            ) : (
                                                                'Check'
                                                            )}
                                                        </button>
                                                    ) : invoice === null ? (
                                                        <span className="text-xs text-base-content/50">None</span>
                                                    ) : (
                                                        <div>
                                                            {getInvoiceStatusBadge(invoice.invoice_status)}
                                                            <div className="text-xs text-base-content/60">
                                                                ${invoice.amount_due?.toLocaleString()}
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="flex gap-1">
                                                        {invoice === null && guaranteeExpired && (
                                                            <button
                                                                className="btn btn-xs btn-primary"
                                                                onClick={() => createInvoice(placement.id)}
                                                                disabled={isCreating}
                                                            >
                                                                {isCreating ? (
                                                                    <span className="loading loading-spinner loading-xs"></span>
                                                                ) : (
                                                                    <>
                                                                        <i className="fa-duotone fa-regular fa-file-invoice-dollar"></i>
                                                                        Invoice
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}
                                                        {invoice?.hosted_invoice_url && (
                                                            <a
                                                                href={invoice.hosted_invoice_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="btn btn-xs btn-ghost"
                                                            >
                                                                <i className="fa-duotone fa-regular fa-external-link"></i>
                                                            </a>
                                                        )}
                                                    </div>
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

            {/* Pagination */}
            {!loading && !error && placements.length > 0 && (
                <PaginationControls
                    pagination={pagination}
                    setPage={setPage}
                />
            )}
        </div>
    );
}
