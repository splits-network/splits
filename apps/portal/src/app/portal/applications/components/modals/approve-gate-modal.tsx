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

interface ApproveGateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApprove: (notes?: string) => Promise<void>;
    candidateName: string;
    jobTitle: string;
    gateName: string;
    applicationId?: string;
    currentStage?: string;
}

export default function ApproveGateModal({
    isOpen,
    onClose,
    onApprove,
    candidateName,
    jobTitle,
    gateName,
    currentStage,
}: ApproveGateModalProps) {
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getTitleText = () => {
        switch (currentStage) {
            case "screen":
                return "Approve & Submit to Company";
            case "submitted":
                return "Approve & Move to Company Review";
            case "company_review":
                return "Approve & Move Forward";
            case "recruiter_review":
                return "Approve & Submit to Company";
            case "recruiter_proposed":
                return "Approve Proposal for Company Review";
            case "company_feedback":
                return "Approve & Continue";
            default:
                return "Approve";
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            await onApprove(notes.trim() || undefined);

            setNotes("");
            onClose();
        } catch (err) {
            console.error("Failed to approve gate:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to approve application",
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
                title={getTitleText()}
                subtitle={`${gateName} Gate`}
                icon="fa-circle-check"
                iconColor="success"
                onClose={handleClose}
                closeDisabled={submitting}
            />

            <form onSubmit={handleSubmit}>
                <BaselModalBody>
                    <div className="space-y-5">
                        {/* Candidate Summary */}
                        <div className="bg-base-200 p-4 border-l-4 border-success">
                            <p className="text-sm text-base-content/50 mb-1">
                                Approving at the{" "}
                                <strong className="text-base-content">
                                    {gateName}
                                </strong>{" "}
                                gate
                            </p>
                            <p className="font-semibold text-base-content">
                                {candidateName}
                            </p>
                            <p className="text-sm text-base-content/70">
                                {jobTitle}
                            </p>
                        </div>

                        {error && (
                            <BaselAlertBox variant="error">{error}</BaselAlertBox>
                        )}

                        <MarkdownEditor
                            label="Approval Notes (Optional)"
                            value={notes}
                            onChange={setNotes}
                            placeholder="Add any notes or feedback for the next reviewer..."
                            height={160}
                            preview="edit"
                            disabled={submitting}
                        />
                    </div>
                </BaselModalBody>

                <BaselModalFooter>
                    <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ borderRadius: 0 }}
                        onClick={handleClose}
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-success"
                        style={{ borderRadius: 0 }}
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
                </BaselModalFooter>
            </form>
        </BaselModal>
    );
}
