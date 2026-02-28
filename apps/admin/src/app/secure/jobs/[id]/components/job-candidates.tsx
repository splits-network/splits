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

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        active: 'badge-success',
        submitted: 'badge-info',
        reviewing: 'badge-warning',
        rejected: 'badge-error',
        withdrawn: 'badge-ghost',
        hired: 'badge-success',
    };
    return (
        <span className={`badge badge-sm ${map[status] ?? 'badge-ghost'} capitalize`}>{status}</span>
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
        key: 'status',
        label: 'Status',
        render: (app) => <StatusBadge status={app.status} />,
    },
    {
        key: 'stage',
        label: 'Stage',
        render: (app) => (
            <span className="text-sm text-base-content/70 capitalize">
                {app.stage?.replace(/_/g, ' ') ?? '—'}
            </span>
        ),
    },
    {
        key: 'created_at',
        label: 'Applied',
        render: (app) => (
            <span className="text-sm text-base-content/60">
                {new Date(app.created_at).toLocaleDateString()}
            </span>
        ),
    },
];

type Props = { jobId: string };

export function JobCandidates({ jobId }: Props) {
    const { data, loading, total, totalPages, page, goToPage } = useStandardList<JobApplication>({
        endpoint: '/ats/admin/applications',
        defaultFilters: { job_id: jobId },
        defaultLimit: 25,
        syncToUrl: false,
    });

    return (
        <div>
            <div className="mb-3">
                <p className="text-sm text-base-content/60">{total} matched candidates</p>
            </div>

            <div className="card bg-base-100 border border-base-200">
                <AdminDataTable
                    columns={COLUMNS}
                    data={data}
                    loading={loading}
                    emptyTitle="No candidates"
                    emptyDescription="No candidates have applied to this job."
                />
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                    <div className="join">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
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
