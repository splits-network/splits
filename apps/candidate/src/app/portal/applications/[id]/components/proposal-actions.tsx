'use client';

import { useState } from 'react';
import { MarkdownEditor } from '@splits-network/shared-ui';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

interface ProposalActionsProps {
    applicationId: string;
    jobTitle: string;
    recruiterName?: string;
}

export function ProposalActions({ applicationId, jobTitle, recruiterName }: ProposalActionsProps) {
    const router = useRouter();
    const { getToken } = useAuth();
    const [accepting, setAccepting] = useState(false);
    const [declining, setDeclining] = useState(false);
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const [declineReason, setDeclineReason] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleAccept = async () => {
        setAccepting(true);
        setError(null);
        try {
            const token = await getToken();
            if (!token) {
                setError('Authentication required');
                return;
            }

            const client = createAuthenticatedClient(token);
            await client.post(`/applications/${applicationId}/accept-proposal`);

            // Close modal and redirect to application detail (will now show as draft)
            setShowAcceptModal(false);
            router.refresh();
        } catch (err) {
            console.error('Error accepting proposal:', err);
            setError(err instanceof Error ? err.message : 'Failed to accept proposal');
        } finally {
            setAccepting(false);
        }
    };

    const handleDecline = async () => {
        if (!declineReason.trim()) {
            setError('Please provide a reason for declining');
            return;
        }

        setDeclining(true);
        setError(null);
        try {
            const token = await getToken();
            if (!token) {
                setError('Authentication required');
                return;
            }

            const client = createAuthenticatedClient(token);
            await client.post(`/applications/${applicationId}/decline-proposal`, {
                reason: declineReason.trim()
            });

            // Close modal and redirect to applications list
            setShowDeclineModal(false);
            router.push('/portal/applications');
        } catch (err) {
            console.error('Error declining proposal:', err);
            setError(err instanceof Error ? err.message : 'Failed to decline proposal');
        } finally {
            setDeclining(false);
        }
    };

    return (
        <div className="card bg-base-100 shadow">
            <div className="card-body">
                <h2 className="card-title">
                    <i className="fa-duotone fa-regular fa-handshake"></i>
                    Job Proposal
                </h2>

                <div className="alert alert-info">
                    <i className="fa-duotone fa-regular fa-circle-info"></i>
                    <div>
                        <div className="font-semibold">You've been proposed for this opportunity</div>
                        <div className="text-sm mt-1">
                            {recruiterName ? `${recruiterName} thinks` : 'Your recruiter thinks'} you'd be a great fit for this role.
                            Review the job details above and decide if you want to apply.
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-error">
                        <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                        <span>{error}</span>
                    </div>
                )}

                <div className="card-actions justify-end mt-4">
                    <button
                        onClick={() => setShowDeclineModal(true)}
                        className="btn btn-outline btn-error"
                        disabled={accepting || declining}
                    >
                        <i className="fa-duotone fa-regular fa-times"></i>
                        Decline Proposal
                    </button>
                    <button
                        onClick={() => setShowAcceptModal(true)}
                        className="btn btn-primary"
                        disabled={accepting || declining}
                    >
                        <i className="fa-duotone fa-regular fa-check"></i>
                        Accept & Apply
                    </button>
                </div>
            </div>

            {/* Accept Confirmation Modal */}
            {showAcceptModal && (
                <dialog open className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">
                            <i className="fa-duotone fa-regular fa-check-circle text-success mr-2"></i>
                            Accept Job Proposal
                        </h3>
                        <p className="mb-4">
                            By accepting this proposal, you'll create a draft application for <strong>{jobTitle}</strong>.
                            You'll be able to review and complete your application before submitting it.
                        </p>
                        {error && (
                            <div className="alert alert-error mb-4">
                                <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                                <span>{error}</span>
                            </div>
                        )}
                        <div className="modal-action">
                            <button
                                onClick={() => {
                                    setShowAcceptModal(false);
                                    setError(null);
                                }}
                                className="btn"
                                disabled={accepting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAccept}
                                className="btn btn-success"
                                disabled={accepting}
                            >
                                {accepting ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Accepting...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-duotone fa-regular fa-check"></i>
                                        Yes, Accept Proposal
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="modal-backdrop" onClick={() => !accepting && setShowAcceptModal(false)}></div>
                </dialog>
            )}

            {/* Decline Modal */}
            {showDeclineModal && (
                <dialog open className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">
                            <i className="fa-duotone fa-regular fa-times-circle text-error mr-2"></i>
                            Decline Job Proposal
                        </h3>
                        <p className="mb-4">
                            Please let {recruiterName || 'your recruiter'} know why you're declining this opportunity.
                            This helps them propose better-fitting roles in the future.
                        </p>

                        <MarkdownEditor
                            className="fieldset mb-4"
                            label="Reason for declining *"
                            value={declineReason}
                            onChange={(value) => {
                                setDeclineReason(value);
                                setError(null);
                            }}
                            placeholder="e.g., Location doesn't work for me, Salary is below my target, Not interested in this type of role..."
                            maxLength={500}
                            showCount
                            height={180}
                            preview="edit"
                            disabled={declining}
                        />

                        {error && (
                            <div className="alert alert-error mb-4">
                                <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="modal-action">
                            <button
                                onClick={() => {
                                    setShowDeclineModal(false);
                                    setDeclineReason('');
                                    setError(null);
                                }}
                                className="btn"
                                disabled={declining}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDecline}
                                className="btn btn-error"
                                disabled={declining || !declineReason.trim()}
                            >
                                {declining ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Declining...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-duotone fa-regular fa-times"></i>
                                        Decline Proposal
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="modal-backdrop" onClick={() => !declining && setShowDeclineModal(false)}></div>
                </dialog>
            )}
        </div>
    );
}
