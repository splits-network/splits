'use client';

import { useState, FormEvent } from 'react';

interface ApproveGateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApprove: (notes?: string) => Promise<void>;
    candidateName: string;
    jobTitle: string;
    gateName: string;
}

export default function ApproveGateModal({
    isOpen,
    onClose,
    onApprove,
    candidateName,
    jobTitle,
    gateName,
}: ApproveGateModalProps) {
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            await onApprove(notes.trim() || undefined);
            setNotes('');
            onClose();
        } catch (err) {
            console.error('Failed to approve gate:', err);
            setError(err instanceof Error ? err.message : 'Failed to approve application');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!submitting) {
            setNotes('');
            setError(null);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg mb-4">
                    <i className="fa-duotone fa-regular fa-circle-check text-success mr-2"></i>
                    Approve Application
                </h3>

                <div className="mb-4">
                    <p className="text-sm text-base-content/70 mb-2">
                        You are approving this application at the <strong>{gateName}</strong> gate:
                    </p>
                    <div className="bg-base-200 p-3 rounded">
                        <p className="font-semibold">{candidateName}</p>
                        <p className="text-sm text-base-content/70">{jobTitle}</p>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-error mb-4">
                        <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <fieldset className="fieldset mb-4">
                        <legend className="fieldset-legend">Approval Notes (Optional)</legend>
                        <textarea
                            className="textarea w-full h-24"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any notes or feedback for the next reviewer..."
                            disabled={submitting}
                        />
                        <p className="fieldset-label">
                            These notes will be visible to the next gate reviewer and the candidate.
                        </p>
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
                            className="btn btn-success"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Approving...
                                </>
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-check"></i>
                                    Approve Application
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <div className="modal-backdrop" onClick={handleClose}></div>
        </div>
    );
}
