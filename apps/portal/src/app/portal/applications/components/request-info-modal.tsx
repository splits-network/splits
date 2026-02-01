'use client';

import { useState, FormEvent } from 'react';
import { MarkdownEditor } from '@splits-network/shared-ui';

interface RequestInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRequestInfo: (questions: string) => Promise<void>;
    candidateName: string;
    jobTitle: string;
    gateName: string;
}

export default function RequestInfoModal({
    isOpen,
    onClose,
    onRequestInfo,
    candidateName,
    jobTitle,
    gateName,
}: RequestInfoModalProps) {
    const [questions, setQuestions] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation: questions are required
        if (!questions.trim()) {
            setError('Please provide the information you need from the candidate or recruiter.');
            return;
        }

        setSubmitting(true);

        try {
            await onRequestInfo(questions.trim());
            setQuestions('');
            onClose();
        } catch (err) {
            console.error('Failed to request info:', err);
            setError(err instanceof Error ? err.message : 'Failed to request information');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!submitting) {
            setQuestions('');
            setError(null);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg mb-4">
                    <i className="fa-duotone fa-regular fa-circle-question text-info mr-2"></i>
                    Request Additional Information
                </h3>

                <div className="mb-4">
                    <p className="text-sm text-base-content/70 mb-2">
                        You are requesting additional information at the <strong>{gateName}</strong> gate:
                    </p>
                    <div className="bg-base-200 p-3 rounded">
                        <p className="font-semibold">{candidateName}</p>
                        <p className="text-sm text-base-content/70">{jobTitle}</p>
                    </div>
                </div>

                <div className="alert alert-info mb-4">
                    <i className="fa-duotone fa-regular fa-circle-info"></i>
                    <div>
                        <p className="text-sm">
                            The candidate or their recruiter will be notified to provide the requested information.
                        </p>
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
                        label="Information Needed *"
                        value={questions}
                        onChange={setQuestions}
                        placeholder="Please describe what additional information you need to continue the review..."
                        helperText="Be specific about what information you need and why it's relevant to your review."
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
                            className="btn btn-info"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Requesting...
                                </>
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-paper-plane"></i>
                                    Request Information
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
