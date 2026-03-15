'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useStandardList } from '@/hooks/use-standard-list';
import { AdminPageHeader, AdminStatsBanner } from '@/components/shared';
import { createAuthenticatedClient } from '@/lib/api-client';
import { ApplicationTable } from './components/application-table';

type Filters = {
    stage: string;
};

const STAGE_OPTIONS: { label: string; value: string }[] = [
    { label: 'All', value: '' },
    { label: 'AI Review', value: 'ai_review' },
    { label: 'GPT Review', value: 'gpt_review' },
    { label: 'Review Failed', value: 'ai_failed' },
    { label: 'AI Reviewed', value: 'ai_reviewed' },
    { label: 'Recruiter Request', value: 'recruiter_request' },
    { label: 'Recruiter Proposed', value: 'recruiter_proposed' },
    { label: 'Submitted', value: 'submitted' },
    { label: 'Screening', value: 'screening' },
    { label: 'Company Review', value: 'company_review' },
    { label: 'Interview', value: 'interview' },
    { label: 'Offer', value: 'offer' },
    { label: 'Hired', value: 'hired' },
    { label: 'Placed', value: 'placed' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Withdrawn', value: 'withdrawn' },
];

export default function ApplicationsPage() {
    const { getToken } = useAuth();
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [countsLoading, setCountsLoading] = useState(true);

    const {
        data,
        total,
        totalPages,
        loading,
        filters,
        setFilter,
        sortBy,
        sortOrder,
        handleSort,
        page,
        goToPage,
    } = useStandardList<any, Filters>({
        endpoint: '/ats/admin/applications',
        defaultFilters: { stage: '' },
        defaultLimit: 25,
    });

    useEffect(() => {
        async function loadCounts() {
            try {
                const token = await getToken();
                if (!token) return;
                const client = createAuthenticatedClient(token);
                const res = await client.get<{ data: Record<string, number> }>('/ats/admin/counts');
                setCounts(res.data);
            } catch { /* non-critical */ } finally {
                setCountsLoading(false);
            }
        }
        loadCounts();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const stats = [
        { label: 'Applications', value: counts.applications ?? 0, icon: 'fa-duotone fa-regular fa-file-lines', color: 'primary' as const },
        { label: 'Jobs', value: counts.jobs ?? 0, icon: 'fa-duotone fa-regular fa-briefcase', color: 'secondary' as const },
        { label: 'Candidates', value: counts.candidates ?? 0, icon: 'fa-duotone fa-regular fa-user-group', color: 'accent' as const },
        { label: 'Placements', value: counts.placements ?? 0, icon: 'fa-duotone fa-regular fa-handshake', color: 'success' as const },
    ];

    return (
        <div>
            <AdminPageHeader
                title="Applications"
                subtitle={`${total} application${total !== 1 ? 's' : ''} on the platform`}
            />

            <div className="mb-6">
                <AdminStatsBanner stats={stats} loading={countsLoading} />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex flex-wrap items-center gap-1">
                    {STAGE_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            className={`btn btn-sm ${filters.stage === opt.value ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setFilter('stage', opt.value)}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="card bg-base-100 shadow-sm">
                <ApplicationTable
                    data={data}
                    loading={loading}
                    sortField={sortBy}
                    sortDir={sortOrder}
                    onSort={handleSort}
                />

                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-base-200">
                        <span className="text-sm text-base-content/60">
                            Page {page} of {totalPages}
                        </span>
                        <div className="join">
                            <button
                                type="button"
                                className="join-item btn btn-sm"
                                disabled={page <= 1}
                                onClick={() => goToPage(page - 1)}
                            >
                                <i className="fa-duotone fa-regular fa-chevron-left" />
                            </button>
                            <button
                                type="button"
                                className="join-item btn btn-sm"
                                disabled={page >= totalPages}
                                onClick={() => goToPage(page + 1)}
                            >
                                <i className="fa-duotone fa-regular fa-chevron-right" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}