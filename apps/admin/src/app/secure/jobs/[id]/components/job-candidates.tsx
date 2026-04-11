'use client';

import { AdminDataTable, type Column } from '@/components/shared';
import { useStandardList } from '@/hooks/use-standard-list';

type JobApplication = {
    id: string;
    status: string;
    stage: string | null;
    candidate: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
    } | null;
    created_at: string;
};

const STAGE_BADGE: Record<string, string> = {
    draft: 'badge-ghost',
    ai_review: 'badge-info',
    gpt_review: 'badge-info',
    ai_reviewed: 'badge-info',
    ai_failed: 'badge-error',
    recruiter_request: 'badge-warning',
    recruiter_proposed: 'badge-warning',
    recruiter_review: 'badge-warning',
    screen: 'badge-warning',
    submitted: 'badge-info',
    company_review: 'badge-accent',
    company_feedback: 'badge-accent',
    interview: 'badge-warning',
    offer: 'badge-primary',
    hired: 'badge-success',
    rejected: 'badge-error',
    withdrawn: 'badge-ghost',
    expired: 'badge-ghost',
};

const PIPELINE_GROUPS = [
    { label: 'AI Review', stages: ['ai_review', 'gpt_review', 'ai_reviewed', 'ai_failed'], color: 'bg-info' },
    { label: 'Recruiter', stages: ['recruiter_request', 'recruiter_proposed', 'recruiter_review'], color: 'bg-warning' },
    { label: 'Screening', stages: ['draft', 'screen', 'submitted'], color: 'bg-secondary' },
    { label: 'Company', stages: ['company_review', 'company_feedback'], color: 'bg-accent' },
    { label: 'Interview', stages: ['interview'], color: 'bg-warning' },
    { label: 'Offer', stages: ['offer'], color: 'bg-primary' },
    { label: 'Hired', stages: ['hired'], color: 'bg-success' },
    { label: 'Closed', stages: ['rejected', 'withdrawn', 'expired'], color: 'bg-error' },
];

function StagePipeline({ stageCounts }: { stageCounts: Record<string, number> }) {
    const groups = PIPELINE_GROUPS.map(g => ({
        ...g,
        count: g.stages.reduce((sum, s) => sum + (stageCounts[s] ?? 0), 0),
    })).filter(g => g.count > 0);

    if (groups.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 mb-4">
            {groups.map(g => (
                <div key={g.label} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-base-200">
                    <span className={`w-2 h-2 rounded-full ${g.color}`} />
                    <span className="text-xs font-medium text-base-content/70">{g.label}</span>
                    <span className="text-xs font-bold">{g.count}</span>
                </div>
            ))}
        </div>
    );
}

const COLUMNS: Column<JobApplication>[] = [
    {
        key: 'candidate',
        label: 'Candidate',
        render: (app) => app.candidate ? (
            <div>
                <p className="font-medium text-sm">
                    {app.candidate.first_name} {app.candidate.last_name}
                </p>
                <p className="text-sm text-base-content/50">{app.candidate.email}</p>
            </div>
        ) : (
            <span className="text-base-content/40 text-sm">Unknown</span>
        ),
    },
    {
        key: 'stage',
        label: 'Stage',
        sortable: true,
        render: (app) => app.stage ? (
            <span className={`badge badge-sm capitalize ${STAGE_BADGE[app.stage] ?? 'badge-ghost'}`}>
                {app.stage.replace(/_/g, ' ')}
            </span>
        ) : (
            <span className="text-base-content/40 text-sm">—</span>
        ),
    },
    {
        key: 'created_at',
        label: 'Applied',
        sortable: true,
        render: (app) => (
            <span className="text-sm text-base-content/60">
                {new Date(app.created_at).toLocaleDateString()}
            </span>
        ),
    },
];

type Props = { jobId: string; stageCounts: Record<string, number> };

export function JobCandidates({ jobId, stageCounts }: Props) {
    const { data, loading, total, totalPages, page, goToPage, sortBy, sortOrder, handleSort } = useStandardList<JobApplication>({
        endpoint: '/ats/admin/applications',
        defaultFilters: { job_id: jobId },
        defaultLimit: 25,
        syncToUrl: false,
    });

    return (
        <div>
            <StagePipeline stageCounts={stageCounts} />

            <div className="mb-3">
                <p className="text-sm text-base-content/60">{total} total applications</p>
            </div>

            <div className="card bg-base-100 border border-base-200">
                <AdminDataTable
                    columns={COLUMNS}
                    data={data}
                    loading={loading}
                    sortField={sortBy}
                    sortDir={sortOrder}
                    onSort={handleSort}
                    emptyTitle="No candidates"
                    emptyDescription="No candidates have applied to this job."
                />
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                    <div className="join">
                        {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
                            <button key={p} className={`join-item btn btn-sm ${p === page ? 'btn-active' : ''}`} onClick={() => goToPage(p)}>
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
