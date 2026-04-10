'use client';

import Link from 'next/link';
import type { UserDetail } from '../page';

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

function formatDateTime(iso?: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

const ONBOARDING_BADGE: Record<string, string> = {
    completed: 'badge-success',
    in_progress: 'badge-warning',
    pending: 'badge-info',
    skipped: 'badge-ghost',
};

type Props = { user: UserDetail };

export function UserOverview({ user }: Props) {
    const displayName = user.name
        || [user.first_name, user.last_name].filter(Boolean).join(' ')
        || 'Unknown';

    const avatarUrl = user.profile_image_url || user.avatar_url;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-4">
                {/* Profile card */}
                <div className="card bg-base-100 border border-base-200">
                    <div className="card-body">
                        <div className="flex items-center gap-4">
                            <div className="avatar placeholder">
                                <div className="w-14 rounded-full bg-base-300 text-base-content/60">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="" />
                                    ) : (
                                        <span className="text-xl font-bold">
                                            {displayName.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h2 className="text-lg font-black">{displayName}</h2>
                                <p className="text-sm text-base-content/50">{user.email}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account details */}
                <div className="card bg-base-100 border border-base-200">
                    <div className="card-body">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2">Account</h3>
                        <InfoRow label="Email" value={user.email} />
                        <InfoRow label="Onboarding" value={
                            user.onboarding_status ? (
                                <span className={`badge badge-sm capitalize ${ONBOARDING_BADGE[user.onboarding_status] ?? 'badge-ghost'}`}>
                                    {user.onboarding_status.replace(/_/g, ' ')}
                                    {user.onboarding_step ? ` (step ${user.onboarding_step})` : ''}
                                </span>
                            ) : null
                        } />
                        <InfoRow label="Registered" value={formatDate(user.created_at)} />
                        <InfoRow label="Last Active" value={formatDateTime(user.last_active_at)} />
                        <InfoRow label="Last Updated" value={formatDate(user.updated_at)} />
                    </div>
                </div>

                {/* Linked recruiter profile */}
                {user.recruiter && (
                    <div className="card bg-base-100 border border-base-200">
                        <div className="card-body">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">Recruiter Profile</h3>
                                <Link href={`/secure/recruiters/${user.recruiter.id}`} className="btn btn-xs btn-ghost">
                                    View <i className="fa-duotone fa-regular fa-arrow-right ml-1" />
                                </Link>
                            </div>
                            <InfoRow label="Status" value={
                                <span className={`badge badge-sm capitalize ${user.recruiter.status === 'active' ? 'badge-success' : user.recruiter.status === 'pending' ? 'badge-warning' : 'badge-ghost'}`}>
                                    {user.recruiter.status}
                                </span>
                            } />
                            <InfoRow label="Tagline" value={user.recruiter.tagline} />
                            <InfoRow label="Location" value={user.recruiter.location} />
                            <InfoRow label="Experience" value={user.recruiter.years_experience ? `${user.recruiter.years_experience} years` : null} />
                            <InfoRow label="Marketplace" value={
                                user.recruiter.marketplace_enabled
                                    ? <span className="badge badge-sm badge-success">Enabled</span>
                                    : <span className="badge badge-sm badge-ghost">Disabled</span>
                            } />
                            <InfoRow label="Stripe" value={
                                user.recruiter.stripe_connect_onboarded
                                    ? <span className="badge badge-sm badge-success">Connected</span>
                                    : <span className="badge badge-sm badge-warning">Not connected</span>
                            } />
                        </div>
                    </div>
                )}

                {/* Linked candidate profile */}
                {user.candidate && (
                    <div className="card bg-base-100 border border-base-200">
                        <div className="card-body">
                            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2">Candidate Profile</h3>
                            <InfoRow label="Name" value={[user.candidate.first_name, user.candidate.last_name].filter(Boolean).join(' ') || null} />
                            <InfoRow label="Email" value={user.candidate.email} />
                            <InfoRow label="Phone" value={user.candidate.phone} />
                            <InfoRow label="Location" value={user.candidate.location} />
                            <InfoRow label="Resume" value={
                                user.candidate.resume_status ? (
                                    <span className={`badge badge-sm capitalize ${user.candidate.resume_status === 'uploaded' ? 'badge-success' : 'badge-ghost'}`}>
                                        {user.candidate.resume_status}
                                    </span>
                                ) : null
                            } />
                            <InfoRow label="Created" value={formatDate(user.candidate.created_at)} />
                        </div>
                    </div>
                )}
            </div>

            {/* Right column: sidebar */}
            <div className="space-y-4">
                {/* Quick info */}
                <div className="card bg-base-100 border border-base-200">
                    <div className="card-body">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-3">Quick Info</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-base-content/60">Roles</span>
                                <span className="text-sm font-semibold">{user.roles.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-base-content/60">Recruiter</span>
                                <span className="text-sm font-semibold">
                                    {user.recruiter ? (
                                        <span className={`badge badge-sm capitalize ${user.recruiter.status === 'active' ? 'badge-success' : 'badge-ghost'}`}>
                                            {user.recruiter.status}
                                        </span>
                                    ) : 'No'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-base-content/60">Candidate</span>
                                <span className="text-sm font-semibold">{user.candidate ? 'Yes' : 'No'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System IDs */}
                <div className="card bg-base-100 border border-base-200">
                    <div className="card-body">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-3">System</h3>
                        <div className="space-y-2">
                            <div>
                                <p className="text-xs text-base-content/40">User ID</p>
                                <p className="font-mono text-xs text-base-content/60 break-all">{user.id}</p>
                            </div>
                            <div>
                                <p className="text-xs text-base-content/40">Clerk User ID</p>
                                <p className="font-mono text-xs text-base-content/60 break-all">{user.clerk_user_id}</p>
                            </div>
                            {user.recruiter && (
                                <div>
                                    <p className="text-xs text-base-content/40">Recruiter ID</p>
                                    <p className="font-mono text-xs text-base-content/60 break-all">{user.recruiter.id}</p>
                                </div>
                            )}
                            {user.candidate && (
                                <div>
                                    <p className="text-xs text-base-content/40">Candidate ID</p>
                                    <p className="font-mono text-xs text-base-content/60 break-all">{user.candidate.id}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
