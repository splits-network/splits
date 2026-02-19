"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { ButtonLoading } from "@splits-network/shared-ui";
import { statusDot } from "../shared/status-color";

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
                err.message || "Could not update verification. Try again.",
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (submitting) return;
        setNotes("");
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <dialog className="modal modal-open modal-bottom sm:modal-middle">
            <div
                className="modal-box max-w-lg w-full p-0"
                style={{ borderRadius: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-accent px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-black uppercase tracking-tight text-accent-content">
                        Verify Candidate
                    </h2>
                    <button
                        type="button"
                        className="btn btn-sm btn-square btn-ghost text-accent-content"
                        onClick={handleClose}
                        disabled={submitting}
                        aria-label="Close"
                    >
                        <i className="fa-duotone fa-regular fa-xmark" />
                    </button>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Candidate Info */}
                        <div className="border-2 border-base-300 p-4">
                            <label className="block text-xs font-black uppercase tracking-wider text-base-content/60 mb-2">
                                Candidate
                            </label>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary flex items-center justify-center flex-shrink-0">
                                    <span className="text-sm font-black text-primary-content">
                                        {candidate.full_name?.[0] || "?"}
                                    </span>
                                </div>
                                <div>
                                    <div className="font-black text-base-content">
                                        {candidate.full_name}
                                    </div>
                                    <div className="text-sm text-base-content/60 font-bold">
                                        {candidate.email}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Select */}
                        <div>
                            <label className="block text-sm font-bold uppercase tracking-wider text-base-content/60 mb-2">
                                Verification Status{" "}
                                <span className="text-error">*</span>
                            </label>
                            <select
                                className="select select-bordered w-full"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                required
                                style={{ borderRadius: 0 }}
                                disabled={submitting}
                            >
                                <option value="unverified">Unverified</option>
                                <option value="pending">Pending Review</option>
                                <option value="verified">Verified</option>
                                <option value="rejected">Rejected</option>
                            </select>
                            <div className="mt-2 flex items-center gap-2">
                                <div
                                    className={`w-3 h-3 ${statusDot(status)}`}
                                    style={{ borderRadius: 0 }}
                                />
                                <span className="text-xs font-bold uppercase tracking-wider text-base-content/70">
                                    {status}
                                </span>
                            </div>
                        </div>

                        {/* Notes Textarea */}
                        <div>
                            <label className="block text-sm font-bold uppercase tracking-wider text-base-content/60 mb-2">
                                Verification Notes
                            </label>
                            <textarea
                                className="textarea textarea-bordered w-full"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Record any context about this verification decision..."
                                rows={4}
                                style={{ borderRadius: 0 }}
                                disabled={submitting}
                            />
                            <p className="text-xs font-bold text-base-content/50 mt-1 uppercase tracking-wider">
                                Internal only. Not visible to the candidate.
                            </p>
                        </div>

                        {/* Status Info Box */}
                        <div className="bg-info/10 border-l-4 border-info p-4">
                            <div className="flex gap-3 items-start">
                                <i className="fa-duotone fa-regular fa-info-circle text-info text-lg mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-black text-base-content uppercase tracking-wider text-xs mb-2">
                                        Status Reference
                                    </p>
                                    <ul className="space-y-1.5">
                                        <li className="flex items-start gap-2">
                                            <span
                                                className="w-2 h-2 mt-1.5 bg-info flex-shrink-0"
                                                style={{ borderRadius: 0 }}
                                            />
                                            <span className="text-base-content/80">
                                                <strong className="text-base-content">
                                                    Unverified:
                                                </strong>{" "}
                                                No review has been performed yet
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span
                                                className="w-2 h-2 mt-1.5 bg-warning flex-shrink-0"
                                                style={{ borderRadius: 0 }}
                                            />
                                            <span className="text-base-content/80">
                                                <strong className="text-base-content">
                                                    Pending:
                                                </strong>{" "}
                                                Review is in progress
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span
                                                className="w-2 h-2 mt-1.5 bg-success flex-shrink-0"
                                                style={{ borderRadius: 0 }}
                                            />
                                            <span className="text-base-content/80">
                                                <strong className="text-base-content">
                                                    Verified:
                                                </strong>{" "}
                                                Identity and credentials confirmed
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span
                                                className="w-2 h-2 mt-1.5 bg-error flex-shrink-0"
                                                style={{ borderRadius: 0 }}
                                            />
                                            <span className="text-base-content/80">
                                                <strong className="text-base-content">
                                                    Rejected:
                                                </strong>{" "}
                                                Verification did not pass review
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-error/10 border-l-4 border-error p-4">
                                <div className="flex gap-3 items-start">
                                    <i className="fa-duotone fa-regular fa-circle-exclamation text-error text-lg mt-0.5" />
                                    <span className="font-bold text-base-content text-sm">
                                        {error}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 justify-end pt-2">
                            <button
                                type="button"
                                className="btn btn-outline"
                                style={{ borderRadius: 0 }}
                                onClick={handleClose}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ borderRadius: 0 }}
                                disabled={submitting}
                            >
                                <ButtonLoading
                                    loading={submitting}
                                    text="Save Verification"
                                    loadingText="Saving..."
                                />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button type="button" onClick={handleClose}>
                    close
                </button>
            </form>
        </dialog>
    );
}
