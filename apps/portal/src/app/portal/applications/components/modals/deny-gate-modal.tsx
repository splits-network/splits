'use client';

import { useState, FormEvent } from 'react';
import { MarkdownEditor } from '@splits-network/shared-ui';

interface DenyGateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDeny: (reason: string) => Promise<void>;
    candidateName: string;
    jobTitle: string;
    gateName: string;
}

export default function DenyGateModal({
    isOpen,
    onClose,
    onDeny,
    candidateName,
    jobTitle,
    gateName,
}: DenyGateModalProps) {
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation: reason is required
        if (!reason.trim()) {
            setError('Please provide a reason for denying this application.');
            return;
        }

        setSubmitting(true);

        try {
            await onDeny(reason.trim());
            setReason('');
            onClose();
        } catch (err) {
            console.error('Failed to deny gate:', err);
            setError(err instanceof Error ? err.message : 'Failed to deny application');
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
        <dialog className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg mb-4">
                    <i className="fa-duotone fa-regular fa-circle-xmark text-error mr-2"></i>
                    Deny Application
                </h3>

                <div className="mb-4">
                    <p className="text-sm text-base-content/70 mb-2">
                        You are denying this application at the <strong>{gateName}</strong> gate:
                    </p>
                    <div className="bg-base-200 p-3 rounded">
                        <p className="font-semibold">{candidateName}</p>
                        <p className="text-sm text-base-content/70">{jobTitle}</p>
                    </div>
                </div>

                <div className="alert alert-warning mb-4">
                    <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                    <div>
                        <p className="font-semibold">This action cannot be undone</p>
                        <p className="text-sm">The candidate and their recruiter will be notified.</p>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-error mb-4">
                        <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <MarkdownEditor
                        className="fieldset mb-4"
                        label="Reason for Denial *"
                        value={reason}
                        onChange={setReason}
                        placeholder="Please provide a detailed reason for denying this application..."
                        helperText="This reason will be shared with the candidate and their recruiter."
                        height={180}
                        preview="edit"
                        disabled={submitting}
                    />

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
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Denying...
                                </>
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-xmark"></i>
                                    Deny Application
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
    );
}
