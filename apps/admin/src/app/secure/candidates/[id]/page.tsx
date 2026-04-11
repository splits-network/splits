'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { AdminPageHeader, AdminLoadingState, AdminErrorState, AdminDataTable, type Column } from '@/components/shared';

type CandidateApp = {
    id: string;
    stage: string;
    job_id: string;
    job_title: string | null;
    company_name: string | null;
    created_at: string;
};

type CandidateDetail = {
    id: string;
    email: string | null;
    full_name: string | null;
    first_name?: string | null;
    last_name?: string | null;
    phone: string | null;
    location: string | null;
    current_title: string | null;
    current_company: string | null;
    bio: string | null;
    linkedin_url: string | null;
    github_url: string | null;
    portfolio_url: string | null;
    skills: string | null;
    verification_status: string | null;
    resume_status?: string | null;
    desired_salary_min: number | null;
    desired_salary_max: number | null;
    marketplace_visibility: string | null;
    user_id: string | null;
    recruiter_id: string | null;
    created_at: string;
    updated_at: string | null;
    applications: CandidateApp[];
    recruiter_relationships: Array<{ id: string; recruiter_id: string; status: string; created_at: string }>;
};

const STAGE_BADGE: Record<string, string> = {
    draft: 'badge-ghost', ai_review: 'badge-info', ai_reviewed: 'badge-info',
    ai_failed: 'badge-error', submitted: 'badge-info', screen: 'badge-warning',
    company_review: 'badge-accent', interview: 'badge-warning', offer: 'badge-primary',
    hired: 'badge-success', rejected: 'badge-error', withdrawn: 'badge-ghost',
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex justify-between items-start py-2 border-b border-base-200 last:border-0">
            <span className="text-sm text-base-content/50 font-medium w-40 flex-shrink-0">{label}</span>
            <span className="text-sm text-right flex-1">{value ?? <span className="text-base-content/30">—</span>}</span>
        </div>
    );
}

function formatDate(iso?: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatSalary(min: number | null, max: number | null) {
    const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    if (min) return `From ${fmt(min)}`;
    if (max) return `Up to ${fmt(max)}`;
    return null;
}

const APP_COLUMNS: Column<CandidateApp>[] = [
    { key: 'job_title', label: 'Job', render: (a) => <span className="text-sm font-medium">{a.job_title ?? '—'}</span> },
    { key: 'company_name', label: 'Company', render: (a) => <span className="text-sm text-base-content/70">{a.company_name ?? '—'}</span> },
    { key: 'stage', label: 'Stage', render: (a) => <span className={`badge badge-sm capitalize ${STAGE_BADGE[a.stage] ?? 'badge-ghost'}`}>{a.stage.replace(/_/g, ' ')}</span> },
    { key: 'created_at', label: 'Applied', render: (a) => <span className="text-sm text-base-content/60">{formatDate(a.created_at)}</span> },
];

export default function CandidateDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { getToken } = useAuth();
    const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCandidate = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) { setError('Not authenticated'); setLoading(false); return; }
            const client = createAuthenticatedClient(token);
            const res = await client.get<{ data: CandidateDetail }>(`/ats/admin/candidates/${id}`);
            setCandidate((res as { data: CandidateDetail }).data);
        } catch {
            setError('Failed to load candidate');
        } finally {
            setLoading(false);
        }
    }, [id, getToken]);

    useEffect(() => { void fetchCandidate(); }, [fetchCandidate]);

    if (loading) return <div className="p-6"><AdminLoadingState /></div>;
    if (error || !candidate) return <div className="p-6"><AdminErrorState message={error ?? 'Candidate not found'} /></div>;

    const name = candidate.full_name
        || [candidate.first_name, candidate.last_name].filter(Boolean).join(' ')
        || 'Unknown Candidate';

    const VERIF_BADGE: Record<string, string> = { verified: 'badge-success', unverified: 'badge-ghost', pending: 'badge-warning' };

    return (
        <div>
            <button className="btn btn-ghost btn-sm gap-2 mb-3" onClick={() => router.push('/secure/candidates')}>
                <i className="fa-duotone fa-regular fa-arrow-left" /> Back to Candidates
            </button>

            <AdminPageHeader
                title={name}
                subtitle={candidate.email ?? undefined}
                actions={
                    <span className={`badge badge-lg capitalize ${VERIF_BADGE[candidate.verification_status ?? ''] ?? 'badge-ghost'}`}>
                        {candidate.verification_status ?? 'unknown'}
                    </span>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {/* Profile */}
                    <div className="card bg-base-100 border border-base-200">
                        <div className="card-body">
                            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2">Profile</h3>
                            <InfoRow label="Email" value={candidate.email} />
                            <InfoRow label="Phone" value={candidate.phone} />
                            <InfoRow label="Location" value={candidate.location} />
                            <InfoRow label="Current Title" value={candidate.current_title} />
                            <InfoRow label="Current Company" value={candidate.current_company} />
                            <InfoRow label="Desired Salary" value={formatSalary(candidate.desired_salary_min, candidate.desired_salary_max)} />
                            <InfoRow label="Skills" value={candidate.skills} />
                            <InfoRow label="Joined" value={formatDate(candidate.created_at)} />
                        </div>
                    </div>

                    {candidate.bio && (
                        <div className="card bg-base-100 border border-base-200">
                            <div className="card-body">
                                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2">Bio</h3>
                                <p className="text-sm text-base-content/80 whitespace-pre-wrap leading-relaxed">{candidate.bio}</p>
                            </div>
                        </div>
                    )}

                    {/* Applications */}
                    <div className="card bg-base-100 border border-base-200">
                        <div className="card-body">
                            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2">
                                Applications ({candidate.applications.length})
                            </h3>
                        </div>
                        <AdminDataTable
                            columns={APP_COLUMNS}
                            data={candidate.applications}
                            loading={false}
                            onRowClick={(app) => router.push(`/secure/applications/${app.id}`)}
                            emptyTitle="No applications"
                            emptyDescription="This candidate has no applications."
                        />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <div className="card bg-base-100 border border-base-200">
                        <div className="card-body">
                            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-3">Quick Info</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between"><span className="text-sm text-base-content/60">Applications</span><span className="text-sm font-semibold">{candidate.applications.length}</span></div>
                                <div className="flex justify-between"><span className="text-sm text-base-content/60">Recruiters</span><span className="text-sm font-semibold">{candidate.recruiter_relationships.length}</span></div>
                                <div className="flex justify-between"><span className="text-sm text-base-content/60">Visibility</span><span className="text-sm capitalize">{candidate.marketplace_visibility ?? '—'}</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Links */}
                    {(candidate.linkedin_url || candidate.github_url || candidate.portfolio_url) && (
                        <div className="card bg-base-100 border border-base-200">
                            <div className="card-body">
                                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-3">Links</h3>
                                <div className="space-y-2">
                                    {candidate.linkedin_url && <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer" className="link link-primary text-sm block truncate">{candidate.linkedin_url}</a>}
                                    {candidate.github_url && <a href={candidate.github_url} target="_blank" rel="noopener noreferrer" className="link link-primary text-sm block truncate">{candidate.github_url}</a>}
                                    {candidate.portfolio_url && <a href={candidate.portfolio_url} target="_blank" rel="noopener noreferrer" className="link link-primary text-sm block truncate">{candidate.portfolio_url}</a>}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="card bg-base-100 border border-base-200">
                        <div className="card-body">
                            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-3">System</h3>
                            <div className="space-y-2">
                                <div><p className="text-xs text-base-content/40">Candidate ID</p><p className="font-mono text-xs text-base-content/60 break-all">{candidate.id}</p></div>
                                {candidate.user_id && <div><p className="text-xs text-base-content/40">User ID</p><p className="font-mono text-xs text-base-content/60 break-all">{candidate.user_id}</p></div>}
                                {candidate.recruiter_id && <div><p className="text-xs text-base-content/40">Source Recruiter ID</p><p className="font-mono text-xs text-base-content/60 break-all">{candidate.recruiter_id}</p></div>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
