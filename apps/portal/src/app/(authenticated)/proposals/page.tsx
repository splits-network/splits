'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { UnifiedProposal, ProposalsResponse } from '@splits-network/shared-types';
import UnifiedProposalCard from '@/components/unified-proposal-card';
import { ApiClient } from '@/lib/api-client';

type TabType = 'action' | 'waiting' | 'completed';

/**
 * Unified Proposals Page
 * 
 * Single interface for all proposal workflows across the platform.
 * Organized by action status: items requiring action, items awaiting
 * response from others, and completed items.
 * 
 * @see docs/guidance/unified-proposals-system.md
 */
export default function ProposalsPage() {
    const router = useRouter();
    const { getToken } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('action');
    const [proposals, setProposals] = useState<UnifiedProposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState<{
        actionable_count: number;
        waiting_count: number;
        urgent_count: number;
        overdue_count: number;
    } | null>(null);

    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchProposals();
        fetchSummary();
    }, [activeTab, page]);

    const fetchProposals = async () => {
        setLoading(true);
        setError(null);

        try {
            const stateParam =
                activeTab === 'action' ? 'actionable' :
                    activeTab === 'waiting' ? 'waiting' :
                        'completed';

            const token = await getToken();
            if (!token) {
                throw new Error('Not authenticated');
            }

            const client = new ApiClient();
            const result: { data: ProposalsResponse } = await client.get(
                `/proposals?state=${stateParam}&page=${page}&limit=25`
            );

            setProposals(result.data.data);
            setTotal(result.data.pagination.total);
            setTotalPages(result.data.pagination.total_pages);
        } catch (err: any) {
            setError(err.message || 'Failed to load proposals');
        } finally {
            setLoading(false);
        }
    };

    const fetchSummary = async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const client = new ApiClient();
            const result: { data: any } = await client.get('/proposals/summary');
            setSummary(result.data);
        } catch (err) {
            console.error('Failed to fetch summary:', err);
        }
    };

    const handleAccept = async (proposalId: string, notes: string) => {
        const token = await getToken();
        if (!token) {
            throw new Error('Not authenticated');
        }

        const client = new ApiClient();
        await client.post(`/proposals/${proposalId}/accept`, { notes });

        // Refresh proposals
        await fetchProposals();
        await fetchSummary();
    };

    const handleDecline = async (proposalId: string, notes: string) => {
        const token = await getToken();
        if (!token) {
            throw new Error('Not authenticated');
        }

        const client = new ApiClient();
        await client.post(`/proposals/${proposalId}/decline`, { notes });

        // Refresh proposals
        await fetchProposals();
        await fetchSummary();
    };

    const handleProposalClick = (proposalId: string) => {
        // Navigate to application detail page
        router.push(`/applications/${proposalId}`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Proposals</h1>
                <p className="text-base-content/60 mt-1">
                    Manage all your job opportunities, applications, and reviews
                </p>
            </div>

            {/* Summary Stats */}
            {summary && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="stats shadow">
                        <div className="stat bg-base-100">
                            <div className="stat-title">Requiring Action</div>
                            <div className="stat-value text-primary">{summary.actionable_count}</div>
                            <div className="stat-desc">Items awaiting your response</div>
                        </div>
                    </div>
                    <div className="stats shadow">
                        <div className="stat bg-base-100">
                            <div className="stat-title">Awaiting Response</div>
                            <div className="stat-value">{summary.waiting_count}</div>
                            <div className="stat-desc">Items sent to others</div>
                        </div>
                    </div>
                    <div className="stats shadow">
                        <div className="stat bg-base-100">
                            <div className="stat-title">Urgent</div>
                            <div className="stat-value text-warning">{summary.urgent_count}</div>
                            <div className="stat-desc">Due within 24 hours</div>
                        </div>
                    </div>
                    <div className="stats shadow">
                        <div className="stat bg-base-100">
                            <div className="stat-title">Overdue</div>
                            <div className="stat-value text-error">{summary.overdue_count}</div>
                            <div className="stat-desc">Past deadline</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="tabs tabs-box">
                <button
                    className={`tab ${activeTab === 'action' ? 'tab-active' : ''}`}
                    onClick={() => {
                        setActiveTab('action');
                        setPage(1);
                    }}
                >
                    <i className="fa-solid fa-bolt mr-2"></i>
                    Action Required
                    {summary && summary.actionable_count > 0 && (
                        <span className="badge badge-primary badge-sm ml-2">
                            {summary.actionable_count}
                        </span>
                    )}
                </button>
                <button
                    className={`tab ${activeTab === 'waiting' ? 'tab-active' : ''}`}
                    onClick={() => {
                        setActiveTab('waiting');
                        setPage(1);
                    }}
                >
                    <i className="fa-solid fa-clock mr-2"></i>
                    Awaiting Response
                    {summary && summary.waiting_count > 0 && (
                        <span className="badge badge-sm ml-2">
                            {summary.waiting_count}
                        </span>
                    )}
                </button>
                <button
                    className={`tab ${activeTab === 'completed' ? 'tab-active' : ''}`}
                    onClick={() => {
                        setActiveTab('completed');
                        setPage(1);
                    }}
                >
                    <i className="fa-solid fa-check-circle mr-2"></i>
                    Completed
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            ) : error ? (
                <div className="alert alert-error">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span>{error}</span>
                </div>
            ) : proposals.length === 0 ? (
                <div className="text-center py-12">
                    <i className="fa-solid fa-inbox text-4xl text-base-content/30 mb-4"></i>
                    <h3 className="text-xl font-semibold mb-2">No proposals here</h3>
                    <p className="text-base-content/60">
                        {activeTab === 'action' && 'No items requiring your action at this time.'}
                        {activeTab === 'waiting' && 'No items awaiting response from others.'}
                        {activeTab === 'completed' && 'No completed proposals yet.'}
                    </p>
                </div>
            ) : (
                <>
                    {/* Proposals Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {proposals.map((proposal) => (
                            <UnifiedProposalCard
                                key={proposal.id}
                                proposal={proposal}
                                onAccept={activeTab === 'action' ? handleAccept : undefined}
                                onDecline={activeTab === 'action' ? handleDecline : undefined}
                                onClick={handleProposalClick}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-6">
                            <button
                                className="btn btn-sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <i className="fa-solid fa-chevron-left"></i>
                            </button>
                            <span className="text-sm">
                                Page {page} of {totalPages} ({total} total)
                            </span>
                            <button
                                className="btn btn-sm"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                <i className="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
