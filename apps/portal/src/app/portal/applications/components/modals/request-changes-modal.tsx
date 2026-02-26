"use client";

import { useState, FormEvent } from "react";
import { MarkdownEditor } from "@splits-network/shared-ui";
import {
    BaselModal,
    BaselModalHeader,
    BaselModalBody,
    BaselModalFooter,
    BaselAlertBox,
} from "@splits-network/basel-ui";

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
        <BaselModal isOpen={isOpen} onClose={handleClose} maxWidth="max-w-2xl">
            <BaselModalHeader
                title="Request Changes"
                subtitle="Application Feedback"
                icon="fa-comment-edit"
                iconColor="warning"
                onClose={handleClose}
                closeDisabled={submitting}
            />

            <form onSubmit={handleSubmit}>
                <BaselModalBody>
                    <div className="space-y-5">
                        {/* Candidate Summary */}
                        <div className="bg-base-200 p-4 border-l-4 border-warning">
                            <p className="font-semibold text-base-content">
                                {candidateName}
                            </p>
                            <p className="text-sm text-base-content/70">
                                {jobTitle}
                            </p>
                        </div>

                        <BaselAlertBox variant="info" title="What happens next">
                            The candidate will be notified of your feedback and can
                            make improvements before resubmitting.
                        </BaselAlertBox>

                        {error && (
                            <BaselAlertBox variant="error">{error}</BaselAlertBox>
                        )}

                        <div>
                            <MarkdownEditor
                                label="Feedback for Candidate *"
                                value={notes}
                                onChange={setNotes}
                                placeholder="Please provide specific feedback about what changes are needed. For example: skills to highlight, experience to clarify, documents to attach, or sections to improve..."
                                height={200}
                            />
                        </div>
                    </div>
                </BaselModalBody>

                <BaselModalFooter>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="btn btn-ghost"
                        style={{ borderRadius: 0 }}
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-warning"
                        style={{ borderRadius: 0 }}
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
                </BaselModalFooter>
            </form>
        </BaselModal>
    );
}