'use client';

import { useState, FormEvent } from 'react';

interface ApproveGateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApprove: (notes?: string, salary?: number) => Promise<void>;
    candidateName: string;
    jobTitle: string;
    gateName: string;
    isHireTransition?: boolean;
}

export default function ApproveGateModal({
    isOpen,
    onClose,
    onApprove,
    candidateName,
    jobTitle,
    gateName,
    isHireTransition = false,
}: ApproveGateModalProps) {
    const [notes, setNotes] = useState('');
    const [salary, setSalary] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            // Validate salary for hire transitions
            if (isHireTransition) {
                const salaryValue = parseFloat(salary);
                if (!salary || isNaN(salaryValue) || salaryValue <= 0) {
                    setError('Please enter a valid salary amount');
                    setSubmitting(false);
                    return;
                }
                await onApprove(notes.trim() || undefined, salaryValue);
            } else {
                await onApprove(notes.trim() || undefined);
            }
            setNotes('');
            setSalary('');
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
            setSalary('');
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
                        You are {isHireTransition ? 'marking this candidate as hired' : `approving this application at the ${gateName} gate`}:
                    </p>
                    <div className="bg-base-200 p-3 rounded">
                        <p className="font-semibold">{candidateName}</p>
                        <p className="text-sm text-base-content/70">{jobTitle}</p>
                    </div>
                    {isHireTransition && (
                        <div className="alert alert-success mt-3">
                            <i className="fa-duotone fa-regular fa-check-circle"></i>
                            <span>This will create a placement record and calculate earnings.</span>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="alert alert-error mb-4">
                        <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {isHireTransition && (
                        <fieldset className="fieldset mb-4">
                            <legend className="fieldset-legend">Annual Salary (USD) *</legend>
                            <input
                                type="number"
                                className="input w-full"
                                value={salary}
                                onChange={(e) => setSalary(e.target.value)}
                                placeholder="150000"
                                required
                                min="0"
                                step="1000"
                                disabled={submitting}
                            />
                            <p className="fieldset-label">
                                The candidate's agreed annual salary amount
                            </p>
                        </fieldset>
                    )}

                    <fieldset className="fieldset mb-4">
                        <legend className="fieldset-legend">{isHireTransition ? 'Notes (Optional)' : 'Approval Notes (Optional)'}</legend>
                        <textarea
                            className="textarea w-full h-24"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={isHireTransition ? 'Add any notes about the hire...' : 'Add any notes or feedback for the next reviewer...'}
                            disabled={submitting}
                        />
                        <p className="fieldset-label">
                            {isHireTransition ? 'These notes will be visible in the placement record.' : 'These notes will be visible to the next gate reviewer and the candidate.'}
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
                                    {isHireTransition ? 'Creating Placement...' : 'Approving...'}
                                </>
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-check"></i>
                                    {isHireTransition ? 'Mark as Hired' : 'Approve Application'}
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
