'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { ModalPortal } from '@splits-network/shared-ui';

interface AffectedJob {
    id: string;
    title: string;
    status: string;
    application_count: number;
    created_at: string;
}

interface TerminateCompanyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    relationshipId: string;
    recruiterId: string;
    companyId: string;
    /** The name of the party being disconnected from (company name or recruiter name depending on perspective) */
    targetName: string;
    targetEmail?: string;
    /** Label context: 'recruiter' when company terminates recruiter, 'company' when recruiter terminates company */
    targetRole: 'recruiter' | 'company';
}

export default function TerminateCompanyModal({
    isOpen,
    onClose,
    onSuccess,
    relationshipId,
    recruiterId,
    companyId,
    targetName,
    targetEmail,
    targetRole,
}: TerminateCompanyModalProps) {
    const { getToken } = useAuth();
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [affectedJobs, setAffectedJobs] = useState<AffectedJob[]>([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [decisions, setDecisions] = useState<Record<string, 'keep' | 'pause' | 'close'>>({});

    useEffect(() => {
        if (!isOpen) return;

        async function fetchAffectedJobs() {
            try {
                setLoadingJobs(true);
                const token = await getToken();
                if (!token) {
                    setLoadingJobs(false);
                    return;
                }

                const client = createAuthenticatedClient(token);
                const response = await client.get<{ data: AffectedJob[] }>(
                    '/jobs/affected-by-termination',
                    {
                        params: {
                            recruiter_id: recruiterId,
                            company_id: companyId,
                        },
                    }
                );

                const jobs = response.data || [];
                setAffectedJobs(jobs);

                const defaultDecisions: Record<string, 'keep' | 'pause' | 'close'> = {};
                jobs.forEach((job) => {
                    defaultDecisions[job.id] = 'keep';
                });
                setDecisions(defaultDecisions);
            } catch (err) {
                console.error('Failed to fetch affected jobs:', err);
            } finally {
                setLoadingJobs(false);
            }
        }

        fetchAffectedJobs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!reason.trim()) {
            setError('Please provide a reason for ending this relationship.');
            return;
        }

        setSubmitting(true);

        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');

            const client = createAuthenticatedClient(token);

            // Step 1: Terminate the relationship
            await client.patch(`/recruiter-companies/${relationshipId}/terminate`, {
                reason: reason.trim(),
            });

            // Step 2: Process job decisions if any
            const decisionsList = Object.entries(decisions).map(([job_id, action]) => ({
                job_id,
                action,
            }));

            if (decisionsList.length > 0) {
                await client.post('/jobs/termination-decisions', {
                    recruiter_id: recruiterId,
                    decisions: decisionsList,
                });
            }

            setReason('');
            onSuccess();
        } catch (err) {
            console.error('Failed to terminate relationship:', err);
            setError(err instanceof Error ? err.message : 'Failed to end relationship');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!submitting) {
            setReason('');
            setError(null);
            onClose();
        }
    };

    if (!isOpen) return null;

    const notificationTarget = targetRole === 'recruiter'
        ? 'The recruiter will be notified and will lose access to manage your jobs.'
        : 'The company will be notified. You will lose job management permissions.';

    return (
        <ModalPortal>
            <dialog className="modal modal-open" open>
                <div className="modal-box max-w-2xl">
                    <h3 className="font-bold text-lg mb-4">
                        <i className="fa-duotone fa-regular fa-link-slash text-error mr-2"></i>
                        End Relationship
                    </h3>

                    <div className="mb-4">
                        <p className="text-sm text-base-content/70 mb-2">
                            You are ending your relationship with:
                        </p>
                        <div className="bg-base-200 p-3 rounded">
                            <p className="font-semibold">{targetName}</p>
                            {targetEmail && (
                                <p className="text-sm text-base-content/70">{targetEmail}</p>
                            )}
                        </div>
                    </div>

                    <div className="alert alert-warning mb-4">
                        <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                        <div>
                            <p className="font-semibold">This will end your working relationship</p>
                            <p className="text-sm">{notificationTarget}</p>
                        </div>
                    </div>

                    {/* Affected Jobs */}
                    {loadingJobs ? (
                        <div className="flex items-center gap-2 py-4">
                            <span className="loading loading-spinner loading-sm"></span>
                            <span className="text-sm text-base-content/70">Checking for affected jobs...</span>
                        </div>
                    ) : affectedJobs.length > 0 && (
                        <div className="mb-4">
                            <h4 className="font-semibold text-sm mb-2">
                                Affected Jobs ({affectedJobs.length})
                            </h4>
                            <p className="text-xs text-base-content/60 mb-3">
                                Choose what to do with each job managed by this recruiter.
                            </p>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {affectedJobs.map((job) => (
                                    <div key={job.id} className="bg-base-200 p-3 rounded flex items-center justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-sm truncate">{job.title}</p>
                                            <p className="text-xs text-base-content/60">
                                                {job.status} &middot; {job.application_count} active application{job.application_count !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                        <select
                                            className="select select-sm select-bordered"
                                            value={decisions[job.id] || 'keep'}
                                            onChange={(e) =>
                                                setDecisions((prev) => ({
                                                    ...prev,
                                                    [job.id]: e.target.value as 'keep' | 'pause' | 'close',
                                                }))
                                            }
                                            disabled={submitting}
                                        >
                                            <option value="keep">Keep active (unassign recruiter)</option>
                                            <option value="pause">Pause job</option>
                                            <option value="close">Close job</option>
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-error mb-4">
                            <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <fieldset className="mb-4">
                            <label className="label">
                                <span className="label-text font-medium">Reason *</span>
                            </label>
                            <textarea
                                className="textarea textarea-bordered w-full"
                                rows={3}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Please explain why you want to end this relationship..."
                                disabled={submitting}
                            />
                        </fieldset>

                        <div className="flex gap-2 justify-end">
                            <button
                                type="button"
                                className="btn"
                                onClick={handleClose}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-error"
                                disabled={submitting || !reason.trim()}
                            >
                                {submitting ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Ending...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-duotone fa-regular fa-link-slash"></i>
                                        End Relationship
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop" onClick={handleClose}>
                    <button type="button">close</button>
                </form>
            </dialog>
        </ModalPortal>
    );
}
