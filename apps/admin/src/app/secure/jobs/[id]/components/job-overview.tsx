'use client';

type JobDetail = {
    id: string;
    title: string;
    status: string;
    commute_type: string | null;
    job_level: string | null;
    description: string | null;
    requirements: string | null;
    salary_min: number | null;
    salary_max: number | null;
    salary_currency: string | null;
    location: string | null;
    city: string | null;
    state: string | null;
    company: { id: string; name: string; logo_url: string | null; industry: string | null } | null;
    created_at: string;
    updated_at: string | null;
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex gap-4 py-2 border-b border-base-200 last:border-0">
            <span className="text-sm text-base-content/50 w-36 flex-shrink-0">{label}</span>
            <span className="text-sm flex-1">{value ?? <span className="text-base-content/30">—</span>}</span>
        </div>
    );
}

function formatSalary(min: number | null, max: number | null, currency: string | null) {
    if (!min && !max) return null;
    const curr = currency ?? 'USD';
    const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: curr, maximumFractionDigits: 0 }).format(n);
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    if (min) return `From ${fmt(min)}`;
    if (max) return `Up to ${fmt(max)}`;
    return null;
}

type Props = { job: JobDetail };

export function JobOverview({ job }: Props) {
    const location = [job.city, job.state].filter(Boolean).join(', ') || job.location;
    const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);

    return (
        <div className="space-y-4">
            <div className="card bg-base-100 border border-base-200">
                <div className="card-body">
                    <h3 className="card-title text-base">Job Details</h3>
                    <div className="divide-y divide-base-200">
                        <InfoRow label="Status" value={
                            <span className="badge badge-sm capitalize">{job.status}</span>
                        } />
                        <InfoRow label="Company" value={job.company?.name} />
                        <InfoRow label="Industry" value={job.company?.industry} />
                        <InfoRow label="Location" value={location} />
                        <InfoRow label="Commute" value={job.commute_type?.replace(/_/g, ' ')} />
                        <InfoRow label="Level" value={job.job_level?.replace(/_/g, ' ')} />
                        <InfoRow label="Salary" value={salary} />
                        <InfoRow label="Created" value={new Date(job.created_at).toLocaleDateString()} />
                        <InfoRow
                            label="Last Updated"
                            value={job.updated_at ? new Date(job.updated_at).toLocaleDateString() : null}
                        />
                    </div>
                </div>
            </div>

            {job.description && (
                <div className="card bg-base-100 border border-base-200">
                    <div className="card-body">
                        <h3 className="card-title text-base">Description</h3>
                        <p className="text-sm text-base-content/80 whitespace-pre-wrap leading-relaxed">
                            {job.description}
                        </p>
                    </div>
                </div>
            )}

            {job.requirements && (
                <div className="card bg-base-100 border border-base-200">
                    <div className="card-body">
                        <h3 className="card-title text-base">Requirements</h3>
                        <p className="text-sm text-base-content/80 whitespace-pre-wrap leading-relaxed">
                            {job.requirements}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
