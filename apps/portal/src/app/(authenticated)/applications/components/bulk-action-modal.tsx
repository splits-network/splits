'use client';

import { useState } from 'react';

interface BulkActionModalProps {
    action: 'stage' | 'reject';
    selectedCount: number;
    onClose: () => void;
    onConfirm: (data: { newStage?: string; reason?: string; notes?: string }) => Promise<void>;
    loading: boolean;
}

const STAGE_OPTIONS = [
    { value: 'screen', label: 'Screening' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'interview', label: 'Interview' },
    { value: 'offer', label: 'Offer' },
    { value: 'hired', label: 'Hired' },
    { value: 'rejected', label: 'Rejected' },
];

export default function BulkActionModal({
    action,
    selectedCount,
    onClose,
    onConfirm,
    loading,
}: BulkActionModalProps) {
    const [newStage, setNewStage] = useState('');
    const [notes, setNotes] = useState('');
    const [reason, setReason] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (action === 'stage' && !newStage) {
            alert('Please select a stage');
            return;
        }

        if (action === 'reject' && !reason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        await onConfirm({
            newStage: action === 'stage' ? newStage : undefined,
            reason: action === 'reject' ? reason : undefined,
            notes: notes || undefined,
        });
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
                <h3 className="font-bold text-lg mb-4">
                    {action === 'stage' && (
                        <>
                            <i className="fa-solid fa-list-check mr-2"></i>
                            Bulk Update Stage
                        </>
                    )}
                    {action === 'reject' && (
                        <>
                            <i className="fa-solid fa-ban mr-2"></i>
                            Bulk Reject Applications
                        </>
                    )}
                </h3>

                <div className="alert alert-warning mb-4">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                    <span>
                        You are about to {action === 'stage' ? 'update' : 'reject'}{' '}
                        <strong>{selectedCount}</strong> application{selectedCount !== 1 ? 's' : ''}.
                        This action will apply to all selected applications.
                    </span>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {action === 'stage' && (
                            <div className="fieldset">
                                <label className="label">New Stage *</label>
                                <select
                                    className="select w-full"
                                    value={newStage}
                                    onChange={(e) => setNewStage(e.target.value)}
                                    required
                                >
                                    <option value="">Select stage...</option>
                                    {STAGE_OPTIONS.map(stage => (
                                        <option key={stage.value} value={stage.value}>
                                            {stage.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {action === 'reject' && (
                            <div className="fieldset">
                                <label className="label">Rejection Reason *</label>
                                <textarea
                                    className="textarea h-24 w-full"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="E.g., Qualifications do not match requirements, Position filled, etc."
                                    required
                                />
                            </div>
                        )}

                        <div className="fieldset">
                            <label className="label">Additional Notes (Optional)</label>
                            <textarea
                                className="textarea h-24 w-full"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add any additional context or details..."
                            />
                        </div>
                    </div>

                    <div className="modal-action">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`btn ${action === 'reject' ? 'btn-error' : 'btn-primary'}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <i className={`fa-solid ${action === 'stage' ? 'fa-check' : 'fa-ban'}`}></i>
                                    Confirm {action === 'stage' ? 'Update' : 'Rejection'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
