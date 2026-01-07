'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { UnifiedProposal, ProposalsResponse } from '@splits-network/shared-types';
import UnifiedProposalCard from '@/components/unified-proposal-card';
import { useStandardList, PaginationControls, SearchInput, EmptyState, LoadingState, ErrorState } from '@/hooks/use-standard-list';
import { ApiClient } from '@/lib/api-client';
import { StatCard, StatCardGrid } from '@/components/ui/cards';

type TabType = 'action' | 'waiting' | 'completed';

// Proposal filters interface
interface ProposalFilters {
    state?: 'actionable' | 'waiting' | 'completed';
}

// Proposal summary interface
interface ProposalSummary {
    actionable_count: number;
    waiting_count: number;
    urgent_count: number;
    overdue_count: number;
}

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
    const [summary, setSummary] = useState<ProposalSummary | null>(null);
    const [summaryLoading, setSummaryLoading] = useState(true);

    // Map tab to state filter
    const getStateFromTab = (tab: TabType): ProposalFilters['state'] => {
        switch (tab) {
            case 'action': return 'actionable';
            case 'waiting': return 'waiting';
            case 'completed': return 'completed';
        }
    };

    // Fetch function for proposals
    const fetchProposals = useCallback(async (params: Record<string, any>) => {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        const client = new ApiClient(token);
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.set('page', params.page.toString());
        if (params.limit) queryParams.set('limit', params.limit.toString());
        if (params.search) queryParams.set('search', params.search);
        if (params.state) queryParams.set('state', params.state);

        const result: { data: ProposalsResponse } = await client.get(`/proposals?${queryParams.toString()}`);

        return {
            data: result.data.data,
            pagination: result.data.pagination
        };
    }, [getToken]);

    // Memoize defaultFilters to prevent infinite re-renders in useStandardList
    const defaultFilters = useMemo<ProposalFilters>(() => ({ state: 'actionable' }), []);

    const {
        data: proposals,
        pagination,
        loading,
        error,
        filters,
        setFilters,
        searchTerm,
        setSearchTerm,
        viewMode,
        setViewMode,
        refetch
    } = useStandardList<UnifiedProposal, ProposalFilters>({
        fetchFn: fetchProposals,
        defaultLimit: 25,
        defaultFilters,
        syncToUrl: true
    });

    // Fetch summary stats
    const fetchSummary = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const client = new ApiClient(token);
            const result: { data: ProposalSummary } = await client.get('/proposals/summary');
            setSummary(result.data);
        } catch (err) {
            console.error('Failed to fetch summary:', err);
        } finally {
            setSummaryLoading(false);
        }
    }, [getToken]);

    // Load summary on mount and after actions
    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    // Handle tab change
    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        setFilters({ state: getStateFromTab(tab) });
    };

    // Sync tab with URL state
    useEffect(() => {
        if (filters.state === 'actionable' && activeTab !== 'action') {
            setActiveTab('action');
        } else if (filters.state === 'waiting' && activeTab !== 'waiting') {
            setActiveTab('waiting');
        } else if (filters.state === 'completed' && activeTab !== 'completed') {
            setActiveTab('completed');
        }
    }, [filters.state, activeTab]);

    // Handle accept proposal
    const handleAccept = async (proposalId: string, notes: string) => {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        const client = new ApiClient(token);
        await client.post(`/proposals/${proposalId}/accept`, { notes });

        // Refresh proposals and summary
        await Promise.all([refetch(), fetchSummary()]);
    };

    // Handle decline proposal
    const handleDecline = async (proposalId: string, notes: string) => {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        const client = new ApiClient(token);
        await client.post(`/proposals/${proposalId}/decline`, { notes });

        // Refresh proposals and summary
        await Promise.all([refetch(), fetchSummary()]);
    };

    // Handle proposal click
    const handleProposalClick = (proposalId: string) => {
        router.push(`/portal/application/${proposalId}`);
    };

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Proposals</h1>
                <p className="text-base-content/60 mt-1">
                    Manage all your job opportunities, applications, and reviews
                </p>
            </div>

            {/* Summary Stats */}
            <StatCardGrid className="mb-6">
                <StatCard
                    title="Requiring Action"
                    value={summaryLoading ? '...' : (summary?.actionable_count ?? 0)}
                    icon="fa-solid fa-bell"
                    color="primary"
                    description="Awaiting your response"
                />
                <StatCard
                    title="Awaiting Response"
                    value={summaryLoading ? '...' : (summary?.waiting_count ?? 0)}
                    icon="fa-solid fa-clock"
                    description="Sent to others"
                />
                <StatCard
                    title="Urgent"
                    value={summaryLoading ? '...' : (summary?.urgent_count ?? 0)}
                    icon="fa-solid fa-exclamation-triangle"
                    color="warning"
                    description="Due within 24 hours"
                />
                <StatCard
                    title="Overdue"
                    value={summaryLoading ? '...' : (summary?.overdue_count ?? 0)}
                    icon="fa-solid fa-calendar-xmark"
                    color="error"
                    description="Past deadline"
                />
            </StatCardGrid>

            {/* Tabs and Search */}
            <div className="bg-base-100 rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    {/* Tabs */}
                    <div className="tabs tabs-box">
                        <button
                            className={`tab ${activeTab === 'action' ? 'tab-active' : ''}`}
                            onClick={() => handleTabChange('action')}
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
                            onClick={() => handleTabChange('waiting')}
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
                            onClick={() => handleTabChange('completed')}
                        >
                            <i className="fa-solid fa-check-circle mr-2"></i>
                            Completed
                        </button>
                    </div>

                    {/* Search */}
                    <div className="w-full md:w-64">
                        <SearchInput
                            value={searchTerm}
                            onChange={setSearchTerm}
                            placeholder="Search proposals..."
                        />
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && <LoadingState />}

            {/* Error State */}
            {error && <ErrorState message={error} onRetry={refetch} />}

            {/* Empty State */}
            {!loading && !error && proposals.length === 0 && (
                <EmptyState
                    icon="fa-inbox"
                    title="No proposals here"
                    description={
                        activeTab === 'action'
                            ? 'No items requiring your action at this time.'
                            : activeTab === 'waiting'
                                ? 'No items awaiting response from others.'
                                : 'No completed proposals yet.'
                    }
                />
            )}

            {/* Proposals Grid */}
            {!loading && !error && proposals.length > 0 && (
                <>
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
                    {pagination && (
                        <PaginationControls
                            pagination={pagination}
                            onPageChange={(page) => setFilters({ ...filters })}
                        />
                    )}
                </>
            )}
        </div>
    );
}
