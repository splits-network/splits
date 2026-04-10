'use client';

import { useState } from 'react';
import type { RecruiterDetail } from '../page';
import { RecruiterEditModal } from './recruiter-edit-modal';

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex justify-between items-start py-2 border-b border-base-200 last:border-0">
            <span className="text-sm text-base-content/50 font-medium w-40 flex-shrink-0">{label}</span>
            <span className="text-sm text-right flex-1">{value ?? <span className="text-base-content/30">—</span>}</span>
        </div>
    );
}

function ReputationBar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    const color = pct >= 80 ? 'progress-success' : pct >= 60 ? 'progress-warning' : 'progress-error';
    return (
        <div className="flex items-center justify-between py-1.5">
            <span className="text-sm text-base-content/70 w-40">{label}</span>
            <div className="flex items-center gap-2 flex-1 justify-end">
                <progress className={`progress w-24 ${color}`} value={pct} max={100} />
                <span className="text-sm font-semibold w-12 text-right">{pct}%</span>
            </div>
        </div>
    );
}

function formatDate(iso?: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

type Props = {
    recruiter: RecruiterDetail;
    onUpdate: () => void;
};

export function RecruiterOverview({ recruiter, onUpdate }: Props) {
    const [editOpen, setEditOpen] = useState(false);
    const rep = recruiter.reputation;
    const firm = recruiter.firm_membership;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: Profile + Details */}
            <div className="lg:col-span-2 space-y-4">
                {/* Profile card */}
                <div className="card bg-base-100 border border-base-200">
                    <div className="card-body">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="avatar placeholder">
                                    <div className="w-14 rounded-full bg-base-300 text-base-content/60">
                                        {recruiter.user?.avatar_url ? (
                                            <img src={recruiter.user.avatar_url} alt="" />
                                        ) : (
                                            <span className="text-xl font-bold">
                                                {(recruiter.user?.name ?? '?').charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-lg font-black">{recruiter.user?.name ?? 'Unknown'}</h2>
                                    <p className="text-sm text-base-content/50">{recruiter.user?.email}</p>
                                    {recruiter.tagline && (
                                        <p className="text-sm text-base-content/70 mt-1">{recruiter.tagline}</p>
                                    )}
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn btn-sm btn-ghost"
                                onClick={() => setEditOpen(true)}
                            >
                                <i className="fa-duotone fa-regular fa-pen-to-square" />
                                Edit
                            </button>
                        </div>

                        {recruiter.bio && (
                            <div className="mt-4 pt-4 border-t border-base-200">
                                <p className="text-xs text-base-content/50 font-semibold uppercase tracking-[0.2em] mb-2">Bio</p>
                                <p className="text-sm text-base-content/80 whitespace-pre-wrap leading-relaxed">{recruiter.bio}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Details card */}
                <div className="card bg-base-100 border border-base-200">
                    <div className="card-body">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2">Details</h3>
                        <InfoRow label="Location" value={recruiter.location} />
                        <InfoRow label="Phone" value={recruiter.phone} />
                        <InfoRow label="Experience" value={recruiter.years_experience ? `${recruiter.years_experience} years` : null} />
                        <InfoRow label="Type" value={
                            <div className="flex gap-1 flex-wrap justify-end">
                                {recruiter.candidate_recruiter && <span className="badge badge-sm badge-ghost">Candidate</span>}
                                {recruiter.company_recruiter && <span className="badge badge-sm badge-ghost">Company</span>}
                                {!recruiter.candidate_recruiter && !recruiter.company_recruiter && <span className="text-base-content/30">—</span>}
                            </div>
                        } />
                        <InfoRow label="Industries" value={
                            recruiter.industries?.length ? (
                                <div className="flex gap-1 flex-wrap justify-end">
                                    {recruiter.industries.map(i => <span key={i} className="badge badge-sm badge-ghost">{i}</span>)}
                                </div>
                            ) : null
                        } />
                        <InfoRow label="Specialties" value={
                            recruiter.specialties?.length ? (
                                <div className="flex gap-1 flex-wrap justify-end">
                                    {recruiter.specialties.map(s => <span key={s} className="badge badge-sm badge-ghost">{s}</span>)}
                                </div>
                            ) : null
                        } />
                        <InfoRow label="Slug" value={recruiter.slug ? <span className="font-mono text-xs">{recruiter.slug}</span> : null} />
                        <InfoRow label="Marketplace" value={
                            recruiter.marketplace_enabled ? (
                                <span className="badge badge-sm badge-success">{recruiter.marketplace_visibility ?? 'public'}</span>
                            ) : (
                                <span className="badge badge-sm badge-ghost">disabled</span>
                            )
                        } />
                        <InfoRow label="Stripe Connected" value={
                            recruiter.stripe_connect_onboarded ? (
                                <span className="badge badge-sm badge-success">Connected</span>
                            ) : (
                                <span className="badge badge-sm badge-warning">Not connected</span>
                            )
                        } />
                        <InfoRow label="Joined" value={formatDate(recruiter.created_at)} />
                        <InfoRow label="Last Updated" value={formatDate(recruiter.updated_at)} />
                    </div>
                </div>

                {/* Reputation card */}
                {rep && (
                    <div className="card bg-base-100 border border-base-200">
                        <div className="card-body">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">Reputation</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-black">{Math.round(rep.reputation_score)}</span>
                                    <span className="text-sm text-base-content/50">/ 100</span>
                                </div>
                            </div>
                            <ReputationBar label="Hire Rate" value={rep.hire_rate * 100} />
                            <ReputationBar label="Completion Rate" value={rep.completion_rate * 100} />
                            <ReputationBar label="Proposal Accept" value={
                                rep.proposals_accepted + rep.proposals_declined > 0
                                    ? (rep.proposals_accepted / (rep.proposals_accepted + rep.proposals_declined)) * 100
                                    : 0
                            } />

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-base-200">
                                <div className="text-center">
                                    <p className="text-lg font-black">{rep.total_submissions}</p>
                                    <p className="text-xs text-base-content/50">Submissions</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-black">{rep.total_hires}</p>
                                    <p className="text-xs text-base-content/50">Hires</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-black">{rep.total_placements}</p>
                                    <p className="text-xs text-base-content/50">Placements</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-black">{rep.avg_response_time_hours ? `${Math.round(rep.avg_response_time_hours)}h` : '—'}</p>
                                    <p className="text-xs text-base-content/50">Avg Response</p>
                                </div>
                            </div>

                            {rep.last_calculated_at && (
                                <p className="text-xs text-base-content/40 mt-3">
                                    Last calculated {formatDate(rep.last_calculated_at)}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Right column: Sidebar */}
            <div className="space-y-4">
                {/* Quick stats */}
                <div className="card bg-base-100 border border-base-200">
                    <div className="card-body">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-3">Quick Stats</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-base-content/60">Companies</span>
                                <span className="text-sm font-semibold">{recruiter.companies.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-base-content/60">Candidates</span>
                                <span className="text-sm font-semibold">{recruiter.candidate_count}</span>
                            </div>
                            {rep && (
                                <>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-base-content/60">Placements</span>
                                        <span className="text-sm font-semibold">{rep.total_placements}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-base-content/60">Hires</span>
                                        <span className="text-sm font-semibold">{rep.total_hires}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Firm membership */}
                <div className="card bg-base-100 border border-base-200">
                    <div className="card-body">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-3">Firm</h3>
                        {firm?.firm ? (
                            <div>
                                <p className="font-semibold text-sm">{firm.firm.name}</p>
                                <p className="text-sm text-base-content/50 capitalize">{firm.role}</p>
                                <span className={`badge badge-sm mt-1 ${firm.firm.status === 'active' ? 'badge-success' : 'badge-ghost'}`}>
                                    {firm.firm.status}
                                </span>
                            </div>
                        ) : (
                            <p className="text-sm text-base-content/40">No firm membership</p>
                        )}
                    </div>
                </div>

                {/* IDs */}
                <div className="card bg-base-100 border border-base-200">
                    <div className="card-body">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-3">System</h3>
                        <div className="space-y-2">
                            <div>
                                <p className="text-xs text-base-content/40">Recruiter ID</p>
                                <p className="font-mono text-xs text-base-content/60 break-all">{recruiter.id}</p>
                            </div>
                            <div>
                                <p className="text-xs text-base-content/40">User ID</p>
                                <p className="font-mono text-xs text-base-content/60 break-all">{recruiter.user_id}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <RecruiterEditModal
                recruiter={recruiter}
                isOpen={editOpen}
                onClose={() => setEditOpen(false)}
                onSuccess={() => { setEditOpen(false); onUpdate(); }}
            />
        </div>
    );
}
