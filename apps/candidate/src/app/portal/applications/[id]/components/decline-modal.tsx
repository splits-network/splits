'use client';

import React, { useState, FormEvent } from 'react';
import { MarkdownEditor } from '@splits-network/shared-ui';

interface DeclineModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string, details?: string) => Promise<void>;
    jobTitle: string;
}

const DECLINE_REASONS = [
    { value: 'not_interested', label: 'Not interested in this role' },
    { value: 'timing', label: 'Not the right timing' },
    { value: 'location', label: 'Location does not work for me' },
    { value: 'compensation', label: 'Compensation expectations do not align' },
    { value: 'found_other', label: 'Accepted another opportunity' },
    { value: 'other', label: 'Other (please specify)' },
];

export function DeclineModal({ isOpen, onClose, onSubmit, jobTitle }: DeclineModalProps) {
    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!reason) {
            setError('Please select a reason');
            return;
        }

        if (reason === 'other' && !details.trim()) {
            setError('Please provide details for "Other"');
            return;
        }

        setError(null);
        setSubmitting(true);

        try {
            await onSubmit(reason, details || undefined);
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to decline opportunity');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setReason('');
        setDetails('');
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
                <h3 className="font-bold text-lg mb-4">
                    <i className="fa-duotone fa-regular fa-times-circle text-error"></i>
                    {' '}Decline Opportunity
                </h3>

                <div className="mb-6">
                    <p className="text-base-content/70">
                        You're about to decline the opportunity for:
                    </p>
                    <p className="font-semibold mt-2">{jobTitle}</p>
                    <p className="text-sm text-base-content/60 mt-2">
                        Your recruiter will be notified. This helps them understand your preferences
                        and find better matches in the future.
                    </p>
                </div>

                {error && (
                    <div className="alert alert-error mb-4">
                        <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="fieldset">
                        <label className="label">Reason for declining *</label>
                        <select
                            className="select"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            disabled={submitting}
                            required
                        >
                            <option value="">Select a reason...</option>
                            {DECLINE_REASONS.map((r) => (
                                <option key={r.value} value={r.value}>
                                    {r.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <MarkdownEditor
                        className="fieldset"
                        label={`Additional details ${reason === 'other' ? '*' : ''}`}
                        value={details}
                        onChange={setDetails}
                        placeholder="Help your recruiter understand your decision (optional)"
                        helperText="This feedback helps your recruiter find better opportunities for you"
                        height={160}
                        preview="edit"
                        disabled={submitting}
                    />

                    <div className="modal-action">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="btn"
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-error"
                            disabled={submitting || !reason}
                        >
                            {submitting ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Declining...
                                </>
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-times"></i>
                                    Decline Opportunity
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
