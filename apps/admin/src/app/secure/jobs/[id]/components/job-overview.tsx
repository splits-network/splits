'use client';

import { useState } from 'react';
import type { JobDetail } from '../page';
import { JobEditModal } from './job-edit-modal';

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

function formatDate(iso?: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

type Props = { job: JobDetail; onUpdate: () => void };

export function JobOverview({ job, onUpdate }: Props) {
    const [editOpen, setEditOpen] = useState(false);
    const location = [job.city, job.state].filter(Boolean).join(', ') || job.location;
    const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);
    const commute = job.commute_types?.map(c => c.replace(/_/g, ' ')).join(', ') ?? job.commute_type?.replace(/_/g, ' ') ?? null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
                {/* Job details */}
                <div className="card bg-base-100 border border-base-200">
                    <div className="card-body">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">Job Details</h3>
                            <button type="button" className="btn btn-sm btn-ghost" onClick={() => setEditOpen(true)}>
                                <i className="fa-duotone fa-regular fa-pen-to-square" /> Edit
                            </button>
                        </div>
                        <InfoRow label="Status" value={<span className="badge badge-sm capitalize">{job.status}</span>} />
                        <InfoRow label="Company" value={job.company?.name} />
                        <InfoRow label="Industry" value={job.company?.industry} />
                        <InfoRow label="Department" value={job.department} />
                        <InfoRow label="Location" value={location} />
                        <InfoRow label="Commute" value={commute} />
                        <InfoRow label="Level" value={job.job_level?.replace(/_/g, ' ')} />
                        <InfoRow label="Employment" value={job.employment_type?.replace(/_/g, ' ')} />
                        <InfoRow label="Salary" value={salary} />
                        <InfoRow label="Fee %" value={job.fee_percentage != null ? `${job.fee_percentage}%` : null} />
                        <InfoRow label="Guarantee" value={job.guarantee_days ? `${job.guarantee_days} days` : null} />
                        <InfoRow label="Created" value={formatDate(job.created_at)} />
                        <InfoRow label="Updated" value={formatDate(job.updated_at)} />
                    </div>
                </div>

                {job.description && (
                    <div className="card bg-base-100 border border-base-200">
                        <div className="card-body">
                            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2">Description</h3>
                            <p className="text-sm text-base-content/80 whitespace-pre-wrap leading-relaxed">{job.description}</p>
                        </div>
                    </div>
                )}

                {job.recruiter_description && (
                    <div className="card bg-base-100 border border-base-200">
                        <div className="card-body">
                            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2">Recruiter Notes</h3>
                            <p className="text-sm text-base-content/80 whitespace-pre-wrap leading-relaxed">{job.recruiter_description}</p>
                        </div>
                    </div>
                )}

                {job.requirements && (
                    <div className="card bg-base-100 border border-base-200">
                        <div className="card-body">
                            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2">Requirements</h3>
                            <p className="text-sm text-base-content/80 whitespace-pre-wrap leading-relaxed">{job.requirements}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
                <div className="card bg-base-100 border border-base-200">
                    <div className="card-body">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-3">Flags</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-base-content/60">Early Access</span>
                                <span className={`badge badge-sm ${job.is_early_access ? 'badge-success' : 'badge-ghost'}`}>
                                    {job.is_early_access ? 'Yes' : 'No'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-base-content/60">Priority</span>
                                <span className={`badge badge-sm ${job.is_priority ? 'badge-warning' : 'badge-ghost'}`}>
                                    {job.is_priority ? 'Yes' : 'No'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card bg-base-100 border border-base-200">
                    <div className="card-body">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-3">Schedule</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-base-content/60">Activates</span>
                                <span className="text-sm">{formatDate(job.activates_at)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-base-content/60">Closes</span>
                                <span className="text-sm">{formatDate(job.closes_at)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card bg-base-100 border border-base-200">
                    <div className="card-body">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-3">System</h3>
                        <div className="space-y-2">
                            <div>
                                <p className="text-xs text-base-content/40">Job ID</p>
                                <p className="font-mono text-xs text-base-content/60 break-all">{job.id}</p>
                            </div>
                            {job.company && (
                                <div>
                                    <p className="text-xs text-base-content/40">Company ID</p>
                                    <p className="font-mono text-xs text-base-content/60 break-all">{job.company.id}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <JobEditModal job={job} isOpen={editOpen} onClose={() => setEditOpen(false)} onSuccess={() => { setEditOpen(false); onUpdate(); }} />
        </div>
    );
}
