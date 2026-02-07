"use client";

import { useState } from "react";
import { MarkdownEditor, ButtonLoading } from "@splits-network/shared-ui";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";

interface VerificationModalProps {
    candidate: any;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (updatedCandidate: any) => void;
}

export default function VerificationModal({
    candidate,
    isOpen,
    onClose,
    onUpdate,
}: VerificationModalProps) {
    const { getToken } = useAuth();
    const [status, setStatus] = useState(
        candidate?.verification_status || "unverified",
    );
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);

            const verificationMetadata = {
                notes: notes.trim() || undefined,
                verified_at_timestamp: new Date().toISOString(),
                verification_method: "manual_admin_review",
            };

            const response = await client.patch(
                `/candidates/${candidate.id}`,
                {
                    verification_status: status,
                    verification_metadata: verificationMetadata,
                    verified_at: new Date().toISOString(),
                },
            );

            onUpdate(response.data);
            onClose();
            setNotes("");
            setStatus("unverified");
        } catch (err: any) {
            console.error("Failed to update verification:", err);
            setError(
                err.message || "Failed to update verification status",
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box">
                <form onSubmit={handleSubmit}>
                    <h3 className="text-lg font-bold mb-4">
                        Update Verification Status
                    </h3>

                    <div className="space-y-4">
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">
                                Candidate
                            </legend>
                            <div className="flex items-center gap-3">
                                <div className="avatar avatar-placeholder">
                                    <div className="bg-primary text-primary-content rounded-full w-8">
                                        <span className="text-sm">
                                            {candidate.full_name[0]}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <div className="font-semibold">
                                        {candidate.full_name}
                                    </div>
                                    <div className="text-sm text-base-content/70">
                                        {candidate.email}
                                    </div>
                                </div>
                            </div>
                        </fieldset>

                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">
                                Verification Status *
                            </legend>
                            <select
                                className="select w-full"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                required
                            >
                                <option value="unverified">Unverified</option>
                                <option value="pending">Pending Review</option>
                                <option value="verified">Verified</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </fieldset>

                        <MarkdownEditor
                            className="fieldset"
                            label="Verification Notes"
                            value={notes}
                            onChange={setNotes}
                            placeholder="Optional notes about the verification decision..."
                            helperText="Add any relevant notes about the verification process or decision"
                            height={160}
                            preview="edit"
                        />

                        <div className="alert alert-info">
                            <i className="fa-duotone fa-regular fa-info-circle" />
                            <div className="text-sm">
                                <strong>Status meanings:</strong>
                                <ul className="list-disc list-inside mt-1 space-y-1">
                                    <li>
                                        <strong>Unverified:</strong> Default
                                        state, no verification performed
                                    </li>
                                    <li>
                                        <strong>Pending:</strong> Verification
                                        in progress
                                    </li>
                                    <li>
                                        <strong>Verified:</strong> Candidate
                                        information confirmed and accurate
                                    </li>
                                    <li>
                                        <strong>Rejected:</strong> Verification
                                        failed
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {error && (
                            <div className="alert alert-error">
                                <i className="fa-duotone fa-regular fa-circle-exclamation" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    <div className="modal-action">
                        <button
                            type="button"
                            className="btn"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting}
                        >
                            <ButtonLoading
                                loading={submitting}
                                text="Update Status"
                                loadingText="Updating..."
                            />
                        </button>
                    </div>
                </form>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button type="button" onClick={onClose}>
                    close
                </button>
            </form>
        </div>
    );
}
