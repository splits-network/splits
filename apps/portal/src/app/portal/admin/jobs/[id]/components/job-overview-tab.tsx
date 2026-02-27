interface Job {
    id: string;
    title: string;
    status: string;
    location?: string;
    salary_min?: number;
    salary_max?: number;
    employment_type?: string;
    job_level?: string;
    department?: string;
    description?: string;
    recruiter_description?: string;
    commute_types?: string[];
    guarantee_days?: number;
    fee_percentage?: number;
    requirements?: Array<{
        id: string;
        description: string;
        requirement_type: 'mandatory' | 'preferred';
        sort_order?: number;
    }>;
    company?: { id: string; name: string; logo_url?: string };
    created_at: string;
    updated_at: string;
}

function formatSalary(min?: number, max?: number): string {
    if (!min && !max) return 'Not specified';
    const fmt = (n: number) => `$${(n / 1000).toFixed(0)}k`;
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    return min ? `From ${fmt(min)}` : `Up to ${fmt(max!)}`;
}

export default function JobOverviewTab({ job }: { job: Job }) {
    const mandatoryReqs = (job.requirements || [])
        .filter((r) => r.requirement_type === 'mandatory')
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const preferredReqs = (job.requirements || [])
        .filter((r) => r.requirement_type === 'preferred')
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    return (
        <div className="space-y-8">
            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-base-300">
                <DetailCell label="Location" value={job.location || 'Not specified'} />
                <DetailCell label="Salary" value={formatSalary(job.salary_min, job.salary_max)} />
                <DetailCell label="Employment Type" value={job.employment_type || 'Not specified'} />
                <DetailCell label="Job Level" value={job.job_level || 'Not specified'} />
                {job.department && <DetailCell label="Department" value={job.department} />}
                {job.commute_types?.length ? (
                    <DetailCell label="Commute" value={job.commute_types.join(', ')} />
                ) : null}
                {job.fee_percentage != null && (
                    <DetailCell label="Split Fee" value={`${job.fee_percentage}%`} />
                )}
                {job.guarantee_days != null && (
                    <DetailCell label="Guarantee Period" value={`${job.guarantee_days} days`} />
                )}
            </div>

            {/* Description */}
            {job.description && (
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                        Description
                    </h3>
                    <p className="text-sm text-base-content/70 whitespace-pre-wrap">{job.description}</p>
                </div>
            )}

            {/* Requirements */}
            {mandatoryReqs.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                        Mandatory Requirements
                    </h3>
                    <ul className="space-y-2">
                        {mandatoryReqs.map((r) => (
                            <li key={r.id} className="flex items-start gap-2 text-sm">
                                <i className="fa-duotone fa-regular fa-circle-check text-error mt-0.5" />
                                <span>{r.description}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {preferredReqs.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                        Preferred Requirements
                    </h3>
                    <ul className="space-y-2">
                        {preferredReqs.map((r) => (
                            <li key={r.id} className="flex items-start gap-2 text-sm">
                                <i className="fa-duotone fa-regular fa-circle-plus text-info mt-0.5" />
                                <span>{r.description}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

function DetailCell({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-base-100 p-4">
            <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">{label}</p>
            <p className="font-bold text-sm">{value}</p>
        </div>
    );
}
