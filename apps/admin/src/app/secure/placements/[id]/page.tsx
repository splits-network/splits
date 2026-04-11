'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { AdminPageHeader, AdminLoadingState, AdminErrorState } from '@/components/shared';

type PlacementDetail = {
    id: string;
    job_id: string;
    candidate_id: string;
    company_id: string | null;
    application_id: string | null;
    state: string;
    salary: number | null;
    fee_percentage: number | null;
    fee_amount: number | null;
    placement_fee: number | null;
    recruiter_share: number | null;
    platform_share: number | null;
    start_date: string | null;
    end_date: string | null;
    guarantee_days: number;
    guarantee_expires_at: string | null;
    failure_reason: string | null;
    failed_at: string | null;
    hired_at: string | null;
    candidate_name: string | null;
    candidate_email: string | null;
    job_title: string | null;
    company_name: string | null;
    recruiter_name: string | null;
    recruiter_email: string | null;
    candidate_recruiter_id: string | null;
    company_recruiter_id: string | null;
    job_owner_recruiter_id: string | null;
    created_at: string;
    updated_at: string | null;
    job: { id: string; title: string; status: string } | null;
    candidate: { id: string; full_name: string | null; email: string | null; phone: string | null; location: string | null } | null;
    company: { id: string; name: string; logo_url: string | null } | null;
};

const STATE_BADGE: Record<string, string> = {
    hired: 'badge-info', active: 'badge-success', completed: 'badge-success',
    failed: 'badge-error',
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

function formatCurrency(amount?: number | null) {
    if (amount == null) return '—';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function daysUntil(iso?: string | null): string | null {
    if (!iso) return null;
    const diff = Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Expired';
    if (diff === 0) return 'Today';
    return `${diff} days`;
}

export default function PlacementDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { getToken } = useAuth();
    const [placement, setPlacement] = useState<PlacementDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPlacement = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) { setError('Not authenticated'); setLoading(false); return; }
            const client = createAuthenticatedClient(token);
            const res = await client.get<{ data: PlacementDetail }>(`/ats/admin/placements/${id}`);
            setPlacement((res as { data: PlacementDetail }).data);
        } catch {
            setError('Failed to load placement');
        } finally {
            setLoading(false);
        }
    }, [id, getToken]);

    useEffect(() => { void fetchPlacement(); }, [fetchPlacement]);

    if (loading) return <div className="p-6"><AdminLoadingState /></div>;
    if (error || !placement) return <div className="p-6"><AdminErrorState message={error ?? 'Placement not found'} /></div>;

    const candidateName = placement.candidate?.full_name ?? placement.candidate_name ?? 'Unknown';
    const guaranteeRemaining = daysUntil(placement.guarantee_expires_at);

    return (
        <div>
            <button className="btn btn-ghost btn-sm gap-2 mb-3" onClick={() => router.push('/secure/placements')}>
                <i className="fa-duotone fa-regular fa-arrow-left" /> Back to Placements
            </button>

            <AdminPageHeader
                title={candidateName}
                subtitle={`Placed at ${placement.company?.name ?? placement.company_name ?? 'Unknown Company'}`}
                actions={
                    <span className={`badge badge-lg capitalize ${STATE_BADGE[placement.state] ?? 'badge-ghost'}`}>
                        {placement.state}
                    </span>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {/* Parties */}
                    <div className="card bg-base-100 border border-base-200">
                        <div className="card-body">
                            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2">Parties</h3>
                            <InfoRow label="Candidate" value={
                                placement.candidate ? (
                                    <Link href={`/secure/candidates/${placement.candidate.id}`} className="link link-primary text-sm">
                                        {placement.candidate.full_name ?? placement.candidate_name}
                                    </Link>
                                ) : candidateName
                            } />
                            <InfoRow label="Email" value={placement.candidate?.email ?? placement.candidate_email} />
                            <InfoRow label="Phone" value={placement.candidate?.phone} />
                            <InfoRow label="Job" value={
                                placement.job ? (
                                    <Link href={`/secure/jobs/${placement.job.id}`} className="link link-primary text-sm">
                                        {placement.job.title}
                                    </Link>
                                ) : placement.job_title
                            } />
                            <InfoRow label="Company" value={placement.company?.name ?? placement.company_name} />
                            {placement.application_id && (
                                <InfoRow label="Application" value={
                                    <Link href={`/secure/applications/${placement.application_id}`} className="link link-primary font-mono text-xs">
                                        {placement.application_id.slice(0, 8)}...
                                    </Link>
                                } />
                            )}
                        </div>
                    </div>

                    {/* Financial */}
                    <div className="card bg-base-100 border border-base-200">
                        <div className="card-body">
                            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2">Financial</h3>
                            <InfoRow label="Salary" value={formatCurrency(placement.salary)} />
                            <InfoRow label="Fee %" value={placement.fee_percentage != null ? `${placement.fee_percentage}%` : null} />
                            <InfoRow label="Fee Amount" value={formatCurrency(placement.fee_amount)} />
                            <InfoRow label="Placement Fee" value={formatCurrency(placement.placement_fee)} />
                            <InfoRow label="Recruiter Share" value={formatCurrency(placement.recruiter_share)} />
                            <InfoRow label="Platform Share" value={formatCurrency(placement.platform_share)} />
                        </div>
                    </div>

                    {/* Recruiters */}
                    {(placement.candidate_recruiter_id || placement.company_recruiter_id || placement.job_owner_recruiter_id) && (
                        <div className="card bg-base-100 border border-base-200">
                            <div className="card-body">
                                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2">Recruiter Attribution</h3>
                                {placement.recruiter_name && <InfoRow label="Recruiter" value={`${placement.recruiter_name} (${placement.recruiter_email ?? ''})`} />}
                                {placement.candidate_recruiter_id && (
                                    <InfoRow label="Candidate Recruiter" value={
                                        <Link href={`/secure/recruiters/${placement.candidate_recruiter_id}`} className="link link-primary font-mono text-xs">
                                            {placement.candidate_recruiter_id.slice(0, 8)}...
                                        </Link>
                                    } />
                                )}
                                {placement.company_recruiter_id && (
                                    <InfoRow label="Company Recruiter" value={
                                        <Link href={`/secure/recruiters/${placement.company_recruiter_id}`} className="link link-primary font-mono text-xs">
                                            {placement.company_recruiter_id.slice(0, 8)}...
                                        </Link>
                                    } />
                                )}
                                {placement.job_owner_recruiter_id && (
                                    <InfoRow label="Job Owner" value={
                                        <Link href={`/secure/recruiters/${placement.job_owner_recruiter_id}`} className="link link-primary font-mono text-xs">
                                            {placement.job_owner_recruiter_id.slice(0, 8)}...
                                        </Link>
                                    } />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Failure info */}
                    {placement.failure_reason && (
                        <div className="card bg-error/10 border border-error/20">
                            <div className="card-body">
                                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-error mb-2">Failure</h3>
                                <p className="text-sm text-error">{placement.failure_reason}</p>
                                <p className="text-xs text-base-content/40 mt-1">Failed {formatDate(placement.failed_at)}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Guarantee */}
                    <div className="card bg-base-100 border border-base-200">
                        <div className="card-body">
                            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-3">Guarantee Period</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between"><span className="text-sm text-base-content/60">Days</span><span className="text-sm font-semibold">{placement.guarantee_days}</span></div>
                                <div className="flex justify-between"><span className="text-sm text-base-content/60">Expires</span><span className="text-sm">{formatDate(placement.guarantee_expires_at)}</span></div>
                                {guaranteeRemaining && (
                                    <div className="flex justify-between">
                                        <span className="text-sm text-base-content/60">Remaining</span>
                                        <span className={`text-sm font-semibold ${guaranteeRemaining === 'Expired' ? 'text-error' : ''}`}>{guaranteeRemaining}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="card bg-base-100 border border-base-200">
                        <div className="card-body">
                            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-3">Timeline</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between"><span className="text-sm text-base-content/60">Hired</span><span className="text-sm">{formatDate(placement.hired_at)}</span></div>
                                <div className="flex justify-between"><span className="text-sm text-base-content/60">Start Date</span><span className="text-sm">{formatDate(placement.start_date)}</span></div>
                                <div className="flex justify-between"><span className="text-sm text-base-content/60">End Date</span><span className="text-sm">{formatDate(placement.end_date)}</span></div>
                                <div className="flex justify-between"><span className="text-sm text-base-content/60">Created</span><span className="text-sm">{formatDate(placement.created_at)}</span></div>
                            </div>
                        </div>
                    </div>

                    {/* System */}
                    <div className="card bg-base-100 border border-base-200">
                        <div className="card-body">
                            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-3">System</h3>
                            <div className="space-y-2">
                                <div><p className="text-xs text-base-content/40">Placement ID</p><p className="font-mono text-xs text-base-content/60 break-all">{placement.id}</p></div>
                                <div><p className="text-xs text-base-content/40">Job ID</p><p className="font-mono text-xs text-base-content/60 break-all">{placement.job_id}</p></div>
                                <div><p className="text-xs text-base-content/40">Candidate ID</p><p className="font-mono text-xs text-base-content/60 break-all">{placement.candidate_id}</p></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
