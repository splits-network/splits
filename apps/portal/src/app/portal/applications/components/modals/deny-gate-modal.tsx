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
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!reason.trim()) {
            setError("Please provide a reason for denying this application.");
            return;
        }

        setSubmitting(true);

        try {
            await onDeny(reason.trim());
            setReason("");
            onClose();
        } catch (err) {
            console.error("Failed to deny gate:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to deny application",
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!submitting) {
            setReason("");
            setError(null);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <BaselModal isOpen={isOpen} onClose={handleClose} maxWidth="max-w-2xl">
            <BaselModalHeader
                title="Deny Application"
                subtitle={`${gateName} Gate`}
                icon="fa-circle-xmark"
                iconColor="error"
                variant="destructive"
                onClose={handleClose}
                closeDisabled={submitting}
            />

            <form onSubmit={handleSubmit}>
                <BaselModalBody>
                    <div className="space-y-5">
                        {/* Candidate Summary */}
                        <div className="bg-base-200 p-4 border-l-4 border-error">
                            <p className="text-sm text-base-content/50 mb-1">
                                Denying at the{" "}
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

                        <BaselAlertBox variant="warning" title="Irreversible Action">
                            This action cannot be undone. The candidate and their
                            recruiter will be notified.
                        </BaselAlertBox>

                        {error && (
                            <BaselAlertBox variant="error">{error}</BaselAlertBox>
                        )}

                        <MarkdownEditor
                            label="Reason for Denial *"
                            value={reason}
                            onChange={setReason}
                            placeholder="Please provide a detailed reason for denying this application..."
                            height={180}
                            preview="edit"
                            disabled={submitting}
                        />
                        <p className="text-sm text-base-content/40 -mt-3">
                            This reason will be shared with the candidate and their
                            recruiter.
                        </p>
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
                        className="btn btn-error"
                        style={{ borderRadius: 0 }}
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
                </BaselModalFooter>
            </form>
        </BaselModal>
    );
}
