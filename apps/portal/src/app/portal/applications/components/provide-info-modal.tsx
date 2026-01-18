'use client';

import { useState, FormEvent } from 'react';

interface ProvideInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProvideInfo: (answers: string) => Promise<void>;
    candidateName: string;
    jobTitle: string;
    gateName: string;
    questions: string;
}

export default function ProvideInfoModal({
    isOpen,
    onClose,
    onProvideInfo,
    candidateName,
    jobTitle,
    gateName,
    questions,
}: ProvideInfoModalProps) {
    const [answers, setAnswers] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation: answers are required
        if (!answers.trim()) {
            setError('Please provide answers to the requested information.');
            return;
        }

        setSubmitting(true);

        try {
            await onProvideInfo(answers.trim());
            setAnswers('');
            onClose();
        } catch (err) {
            console.error('Failed to provide info:', err);
            setError(err instanceof Error ? err.message : 'Failed to provide information');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!submitting) {
            setAnswers('');
            setError(null);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
                <h3 className="font-bold text-lg mb-4">
                    <i className="fa-duotone fa-regular fa-circle-info text-info mr-2"></i>
                    Provide Requested Information
                </h3>

                <div className="mb-4">
                    <p className="text-sm text-base-content/70 mb-2">
                        The reviewer at the <strong>{gateName}</strong> gate has requested additional information:
                    </p>
                    <div className="bg-base-200 p-3 rounded">
                        <p className="font-semibold">{candidateName}</p>
                        <p className="text-sm text-base-content/70">{jobTitle}</p>
                    </div>
                </div>

                <div className="alert alert-info mb-4">
                    <i className="fa-duotone fa-regular fa-lightbulb"></i>
                    <div>
                        <p className="text-sm font-medium mb-1">Information Requested:</p>
                        <p className="text-sm text-base-content/80 whitespace-pre-wrap">{questions}</p>
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
                        <legend className="fieldset-legend">Your Response *</legend>
                        <textarea
                            className="textarea w-full h-40"
                            value={answers}
                            onChange={(e) => setAnswers(e.target.value)}
                            placeholder="Provide detailed answers to the questions above..."
                            disabled={submitting}
                            required
                        />
                        <p className="fieldset-label">
                            Your response will be sent to the reviewer for their consideration.
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
                            className="btn btn-primary"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-paper-plane"></i>
                                    Submit Response
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
