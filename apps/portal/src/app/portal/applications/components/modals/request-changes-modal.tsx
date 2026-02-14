"use client";

import { useState, FormEvent } from "react";
import { MarkdownEditor } from "@splits-network/shared-ui";

interface RequestChangesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRequestChanges: (notes: string) => Promise<void>;
    candidateName: string;
    jobTitle: string;
}

export default function RequestChangesModal({
    isOpen,
    onClose,
    onRequestChanges,
    candidateName,
    jobTitle,
}: RequestChangesModalProps) {
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation: notes are required
        if (!notes.trim()) {
            setError("Please provide specific feedback for the candidate.");
            return;
        }

        setSubmitting(true);

        try {
            await onRequestChanges(notes.trim());
            setNotes("");
            onClose();
        } catch (err) {
            console.error("Failed to request changes:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to request changes",
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!submitting) {
            setNotes("");
            setError(null);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <dialog className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg mb-4">
                    <i className="fa-duotone fa-regular fa-comment-edit text-warning mr-2"></i>
                    Request Changes
                </h3>

                <div className="mb-4">
                    <p className="text-sm text-base-content/70 mb-2">
                        You are requesting changes to this application:
                    </p>
                    <div className="bg-base-200 p-3 rounded">
                        <p className="font-semibold">{candidateName}</p>
                        <p className="text-sm text-base-content/70">
                            {jobTitle}
                        </p>
                    </div>
                </div>

                <div className="alert alert-info mb-4">
                    <i className="fa-duotone fa-regular fa-circle-info"></i>
                    <div>
                        <p className="font-semibold">What happens next</p>
                        <p className="text-sm">
                            The candidate will be notified of your feedback and
                            can make improvements before resubmitting.
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
                        label="Feedback for Candidate *"
                        value={notes}
                        onChange={setNotes}
                        placeholder="Please provide specific feedback about what changes are needed. For example: skills to highlight, experience to clarify, documents to attach, or sections to improve..."
                        height={200}
                    />

                    <div className="modal-action">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="btn btn-outline"
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-warning"
                            disabled={submitting || !notes.trim()}
                        >
                            {submitting ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-paper-plane"></i>
                                    Request Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button type="button" onClick={handleClose}>
                    Close
                </button>
            </form>
        </dialog>
    );
}
