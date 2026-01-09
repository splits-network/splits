'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

interface VerificationModalProps {
    candidate: any;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (updatedCandidate: any) => void;
}

export default function VerificationModal({
    candidate,
    isOpen,
    onClose,
    onUpdate
}: VerificationModalProps) {
    const { getToken } = useAuth();
    const [status, setStatus] = useState(candidate?.verification_status || 'unverified');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error('Not authenticated');
            }

            const client = createAuthenticatedClient(token);

            // Prepare verification metadata
            const verificationMetadata = {
                notes: notes.trim() || undefined,
                verified_at_timestamp: new Date().toISOString(),
                verification_method: 'manual_admin_review'
            };

            // V2 Pattern: Single PATCH endpoint for all updates
            const response = await client.patch(`/candidates/${candidate.id}`, {
                verification_status: status,
                verification_metadata: verificationMetadata,
                verified_at: new Date().toISOString()
                // verified_by_user_id will be set server-side from auth context
            });

            onUpdate(response.data);
            onClose();

            // Reset form
            setNotes('');
            setStatus('unverified');

        } catch (err: any) {
            console.error('Failed to update verification:', err);
            setError(err.message || 'Failed to update verification status');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box">
                <form onSubmit={handleSubmit}>
                    <h3 className="text-lg font-bold mb-4">
                        Update Verification Status
                    </h3>

                    <div className="space-y-4">
                        {/* Current Status Display */}
                        <div className="fieldset">
                            <label className="label">Candidate</label>
                            <div className="flex items-center gap-3">
                                <div className="avatar avatar-placeholder">
                                    <div className="bg-primary text-primary-content rounded-full w-8">
                                        <span className="text-sm">{candidate.full_name[0]}</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="font-semibold">{candidate.full_name}</div>
                                    <div className="text-sm text-base-content/70">{candidate.email}</div>
                                </div>
                            </div>
                        </div>

                        {/* Verification Status */}
                        <div className="fieldset">
                            <label className="label">Verification Status *</label>
                            <select
                                className="select w-full"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                required
                            >
                                <option value="unverified">Unverified</option>
                                <option value="pending">Pending Review</option>
                                <option value="verified">Verified</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>

                        {/* Notes */}
                        <div className="fieldset">
                            <label className="label">Verification Notes</label>
                            <textarea
                                className="textarea h-24 w-full"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Optional notes about the verification decision..."
                            />
                            <label className="label">
                                <span className="label-text-alt">
                                    Add any relevant notes about the verification process or decision
                                </span>
                            </label>
                        </div>

                        {/* Status Descriptions */}
                        <div className="alert alert-info">
                            <i className="fa-duotone fa-regular fa-info-circle"></i>
                            <div className="text-sm">
                                <strong>Status meanings:</strong>
                                <ul className="list-disc list-inside mt-1 space-y-1">
                                    <li><strong>Unverified:</strong> Default state, no verification performed</li>
                                    <li><strong>Pending:</strong> Verification in progress</li>
                                    <li><strong>Verified:</strong> Candidate information confirmed and accurate</li>
                                    <li><strong>Rejected:</strong> Verification failed (e.g., fake profile, incorrect info)</li>
                                </ul>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="alert alert-error">
                                <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    {/* Modal Actions */}
                    <div className="modal-action">
                        <button
                            type="button"
                            className="btn"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Updating...
                                </>
                            ) : (
                                'Update Status'
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button type="button" onClick={onClose}>close</button>
            </form>
        </div>
    );
}