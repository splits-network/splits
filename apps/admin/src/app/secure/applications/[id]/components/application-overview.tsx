'use client';

import Link from 'next/link';
import type { ApplicationDetail, ApplicationNote } from '../page';

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex justify-between items-start py-2 border-b border-base-200 last:border-0">
            <span className="text-sm text-base-content/50 font-medium w-36 flex-shrink-0">{label}</span>
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

const NOTE_TYPE_BADGE: Record<string, string> = {
    stage_change: 'badge-info',
    admin_note: 'badge-warning',
    recruiter_note: 'badge-primary',
    system: 'badge-ghost',
    feedback: 'badge-accent',
    pitch: 'badge-secondary',
};

function NoteTimeline({ notes }: { notes: ApplicationNote[] }) {
    if (notes.length === 0) return <p className="text-sm text-base-content/40">No notes yet.</p>;

    return (
        <div className="space-y-3">
            {notes.map((note) => (
                <div key={note.id} className="flex gap-3">
                    <div className="w-1.5 rounded-full bg-base-300 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className={`badge badge-xs capitalize ${NOTE_TYPE_BADGE[note.note_type] ?? 'badge-ghost'}`}>
                                {note.note_type.replace(/_/g, ' ')}
                            </span>
                            {note.author_name && (
                                <span className="text-xs text-base-content/50">{note.author_name}</span>
                            )}
                            <span className="text-xs text-base-content/40 ml-auto">{formatDateTime(note.created_at)}</span>
                        </div>
                        <p className="text-sm text-base-content/70 whitespace-pre-wrap">{note.body}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

type Props = { app: ApplicationDetail };

export function ApplicationOverview({ app }: Props) {
    const candidate = app.candidate;
    const job = app.job;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-4">
                {/* Candidate info */}
                <div className="card bg-base-100 border border-base-200">
                    <div className="card-body">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">Candidate</h3>
                            {candidate && (
                                <Link href={`/secure/candidates`} className="btn btn-xs btn-ghost">
                                    View Candidates <i className="fa-duotone fa-regular fa-arrow-right ml-1" />
                                </Link>
                            )}
                        </div>
                        <InfoRow label="Name" value={
                            candidate
                                ? [candidate.first_name, candidate.last_name].filter(Boolean).join(' ') || app.candidate_name
                                : app.candidate_name
                        } />
                        <InfoRow label="Email" value={candidate?.email ?? app.candidate_email} />
                        <InfoRow label="Phone" value={candidate?.phone} />
                        <InfoRow label="Location" value={candidate?.location} />
                        <InfoRow label="Resume" value={
                            candidate?.resume_status ? (
                                <span className={`badge badge-sm capitalize ${candidate.resume_status === 'uploaded' ? 'badge-success' : 'badge-ghost'}`}>
                                    {candidate.resume_status}
                                </span>
                            ) : null
                        } />
                    </div>
                </div>

                {/* Job info */}
                <div className="card bg-base-100 border border-base-200">
                    <div className="card-body">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">Job</h3>
                            {job && (
                                <Link href={`/secure/jobs/${job.id}`} className="btn btn-xs btn-ghost">
                                    View Job <i className="fa-duotone fa-regular fa-arrow-right ml-1" />
                                </Link>
                            )}
                        </div>
                        <InfoRow label="Title" value={job?.title ?? app.job_title} />
                        <InfoRow label="Company" value={job?.company?.name ?? app.company_name} />
                        <InfoRow label="Job Status" value={
                            job ? <span className="badge badge-sm capitalize">{job.status}</span> : null
                        } />
                    </div>
                </div>

                {/* Cover letter */}
                {app.cover_letter && (
                    <div className="card bg-base-100 border border-base-200">
                        <div className="card-body">
                            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2">Cover Letter</h3>
                            <p className="text-sm text-base-content/80 whitespace-pre-wrap leading-relaxed">{app.cover_letter}</p>
                        </div>
                    </div>
                )}

                {/* Notes from various sources */}
                {(app.recruiter_notes || app.internal_notes || app.candidate_notes) && (
                    <div className="card bg-base-100 border border-base-200">
                        <div className="card-body space-y-3">
                            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">Inline Notes</h3>
                            {app.recruiter_notes && (
                                <div>
                                    <p className="text-xs font-semibold text-base-content/50 mb-1">Recruiter Notes</p>
                                    <p className="text-sm text-base-content/70 whitespace-pre-wrap">{app.recruiter_notes}</p>
                                </div>
                            )}
                            {app.internal_notes && (
                                <div>
                                    <p className="text-xs font-semibold text-base-content/50 mb-1">Internal Notes</p>
                                    <p className="text-sm text-base-content/70 whitespace-pre-wrap">{app.internal_notes}</p>
                                </div>
                            )}
                            {app.candidate_notes && (
                                <div>
                                    <p className="text-xs font-semibold text-base-content/50 mb-1">Candidate Notes</p>
                                    <p className="text-sm text-base-content/70 whitespace-pre-wrap">{app.candidate_notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Application notes timeline */}
                <div className="card bg-base-100 border border-base-200">
                    <div className="card-body">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-3">
                            Activity ({app.notes_list.length})
                        </h3>
                        <NoteTimeline notes={app.notes_list} />
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
                {/* Application details */}
                <div className="card bg-base-100 border border-base-200">
                    <div className="card-body">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-3">Details</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-base-content/60">Source</span>
                                <span className="text-sm capitalize">{app.application_source ?? '—'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-base-content/60">AI Reviewed</span>
                                <span className={`badge badge-sm ${app.ai_reviewed ? 'badge-success' : 'badge-ghost'}`}>
                                    {app.ai_reviewed ? 'Yes' : 'No'}
                                </span>
                            </div>
                            {app.salary && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-base-content/60">Salary</span>
                                    <span className="text-sm font-medium">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(app.salary)}
                                    </span>
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
                            <div className="flex justify-between">
                                <span className="text-sm text-base-content/60">Created</span>
                                <span className="text-sm">{formatDate(app.created_at)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-base-content/60">Submitted</span>
                                <span className="text-sm">{formatDate(app.submitted_at)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-base-content/60">Accepted</span>
                                <span className="text-sm">{formatDate(app.accepted_at)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-base-content/60">Hired</span>
                                <span className="text-sm">{formatDate(app.hired_at)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-base-content/60">Updated</span>
                                <span className="text-sm">{formatDate(app.updated_at)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System */}
                <div className="card bg-base-100 border border-base-200">
                    <div className="card-body">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-3">System</h3>
                        <div className="space-y-2">
                            <div>
                                <p className="text-xs text-base-content/40">Application ID</p>
                                <p className="font-mono text-xs text-base-content/60 break-all">{app.id}</p>
                            </div>
                            <div>
                                <p className="text-xs text-base-content/40">Candidate ID</p>
                                <p className="font-mono text-xs text-base-content/60 break-all">{app.candidate_id}</p>
                            </div>
                            <div>
                                <p className="text-xs text-base-content/40">Job ID</p>
                                <p className="font-mono text-xs text-base-content/60 break-all">{app.job_id}</p>
                            </div>
                            {app.candidate_recruiter_id && (
                                <div>
                                    <p className="text-xs text-base-content/40">Recruiter ID</p>
                                    <p className="font-mono text-xs text-base-content/60 break-all">{app.candidate_recruiter_id}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
