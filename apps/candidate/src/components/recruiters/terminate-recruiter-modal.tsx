'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { ModalPortal } from '@splits-network/shared-ui';

interface AffectedApplication {
    id: string;
    job_title: string;
    company_name: string;
    stage: string;
    created_at: string;
}

interface RecruiterRelationship {
    id: string;
    recruiter_id?: string;
    candidate_id?: string;
    recruiter_name: string;
    recruiter_email: string;
}

interface TerminateRecruiterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    relationship: RecruiterRelationship;
}

export default function TerminateRecruiterModal({
    isOpen,
    onClose,
    onSuccess,
    relationship,
}: TerminateRecruiterModalProps) {
    const { getToken } = useAuth();
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [affectedApps, setAffectedApps] = useState<AffectedApplication[]>([]);
    const [loadingApps, setLoadingApps] = useState(true);
    const [decisions, setDecisions] = useState<Record<string, 'keep' | 'withdraw'>>({});

    useEffect(() => {
        if (!isOpen) return;

        async function fetchAffectedApps() {
            try {
                setLoadingApps(true);
                const token = await getToken();
                if (!token || !relationship.recruiter_id || !relationship.candidate_id) {
                    setLoadingApps(false);
                    return;
                }

                const client = createAuthenticatedClient(token);
                const response = await client.get<{ data: AffectedApplication[] }>(
                    '/applications/affected-by-termination',
                    {
                        params: {
                            recruiter_id: relationship.recruiter_id,
                            candidate_id: relationship.candidate_id,
                        },
                    }
                );

                const apps = response.data || [];
                setAffectedApps(apps);

                // Default all decisions to 'keep'
                const defaultDecisions: Record<string, 'keep' | 'withdraw'> = {};
                apps.forEach((app) => {
                    defaultDecisions[app.id] = 'keep';
                });
                setDecisions(defaultDecisions);
            } catch (err) {
                console.error('Failed to fetch affected applications:', err);
            } finally {
                setLoadingApps(false);
            }
        }

        fetchAffectedApps();
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
            await client.patch(`/recruiter-candidates/${relationship.id}/terminate`, {
                reason: reason.trim(),
            });

            // Step 2: Process application decisions if any
            const decisionsList = Object.entries(decisions).map(([application_id, action]) => ({
                application_id,
                action,
            }));

            if (decisionsList.length > 0) {
                await client.post('/applications/termination-decisions', {
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

    return (
        <ModalPortal>
        <dialog className="modal modal-open">
            <div className="modal-box max-w-2xl">
                <h3 className="font-bold text-lg mb-4">
                    <i className="fa-duotone fa-regular fa-link-slash text-error mr-2"></i>
                    End Representation
                </h3>

                <div className="mb-4">
                    <p className="text-sm text-base-content/70 mb-2">
                        You are ending your relationship with:
                    </p>
                    <div className="bg-base-200 p-3 rounded">
                        <p className="font-semibold">{relationship.recruiter_name}</p>
                        <p className="text-sm text-base-content/70">{relationship.recruiter_email}</p>
                    </div>
                </div>

                <div className="alert alert-warning mb-4">
                    <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                    <div>
                        <p className="font-semibold">This will end your working relationship</p>
                        <p className="text-sm">Your recruiter will be notified. They will no longer be able to submit you for new opportunities.</p>
                    </div>
                </div>

                {/* Affected Applications */}
                {loadingApps ? (
                    <div className="flex items-center gap-2 py-4">
                        <span className="loading loading-spinner loading-sm"></span>
                        <span className="text-sm text-base-content/70">Checking for active applications...</span>
                    </div>
                ) : affectedApps.length > 0 && (
                    <div className="mb-4">
                        <h4 className="font-semibold text-sm mb-2">
                            Active Applications ({affectedApps.length})
                        </h4>
                        <p className="text-xs text-base-content/60 mb-3">
                            Choose what to do with each application currently managed by this recruiter.
                        </p>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {affectedApps.map((app) => (
                                <div key={app.id} className="bg-base-200 p-3 rounded flex items-center justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-sm truncate">{app.job_title}</p>
                                        <p className="text-xs text-base-content/60">{app.company_name} &middot; {app.stage}</p>
                                    </div>
                                    <select
                                        className="select select-sm select-bordered"
                                        value={decisions[app.id] || 'keep'}
                                        onChange={(e) =>
                                            setDecisions((prev) => ({
                                                ...prev,
                                                [app.id]: e.target.value as 'keep' | 'withdraw',
                                            }))
                                        }
                                        disabled={submitting}
                                    >
                                        <option value="keep">Keep in pipeline</option>
                                        <option value="withdraw">Withdraw</option>
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
                                    End Representation
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
