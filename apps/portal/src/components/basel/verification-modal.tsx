"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { ButtonLoading } from "@splits-network/shared-ui";

interface VerificationModalProps {
    candidate: any;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (updatedCandidate: any) => void;
}

const STATUS_COLORS: Record<
    string,
    { bg: string; text: string; dot: string }
> = {
    verified: {
        bg: "bg-success/10",
        text: "text-success",
        dot: "bg-success",
    },
    pending: {
        bg: "bg-warning/10",
        text: "text-warning",
        dot: "bg-warning",
    },
    unverified: {
        bg: "bg-base-content/10",
        text: "text-base-content/50",
        dot: "bg-base-content/50",
    },
    rejected: {
        bg: "bg-error/10",
        text: "text-error",
        dot: "bg-error",
    },
};

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
                err.message || "Failed to update verification status",
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

    const colors = STATUS_COLORS[status] || STATUS_COLORS.unverified;

    return (
        <dialog className="modal modal-open" onClick={handleClose}>
            <div
                className="modal-box bg-base-100 border-2 border-base-300 max-w-lg w-full p-0"
                style={{ borderRadius: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-primary px-6 py-4 border-b border-base-300 flex items-center justify-between">
                    <h2 className="text-lg font-black uppercase tracking-tight text-primary-content">
                        Verify Candidate
                    </h2>
                    <button
                        onClick={handleClose}
                        className="btn btn-ghost btn-sm btn-square text-primary-content"
                        disabled={submitting}
                    >
                        <i className="fa-duotone fa-regular fa-xmark text-lg"></i>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Candidate Info Card */}
                        <div className="bg-base-200 p-4">
                            <label className="block text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2">
                                Candidate
                            </label>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-neutral text-neutral-content flex items-center justify-center flex-shrink-0 font-bold text-sm">
                                    {candidate.full_name?.[0] || "?"}
                                </div>
                                <div>
                                    <div className="font-bold text-base-content">
                                        {candidate.full_name}
                                    </div>
                                    <div className="text-sm text-base-content/60">
                                        {candidate.email}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Select */}
                        <div>
                            <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                                Verification Status{" "}
                                <span className="text-error">*</span>
                            </label>
                            <select
                                className="select select-bordered w-full bg-base-100 border-base-300 font-medium focus:border-primary focus:outline-none"
                                style={{ borderRadius: 0, appearance: "auto" }}
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                required
                                disabled={submitting}
                            >
                                <option value="unverified">Unverified</option>
                                <option value="pending">Pending Review</option>
                                <option value="verified">Verified</option>
                                <option value="rejected">Rejected</option>
                            </select>
                            <div className="mt-2 flex items-center gap-2">
                                <div
                                    className={`w-3 h-3 ${colors.dot}`}
                                />
                                <span
                                    className={`text-sm font-bold uppercase tracking-[0.15em] ${colors.text}`}
                                >
                                    {status}
                                </span>
                            </div>
                        </div>

                        {/* Notes Textarea */}
                        <div>
                            <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                                Notes
                            </label>
                            <textarea
                                className="textarea textarea-bordered w-full bg-base-100 border-base-300 font-medium focus:border-primary focus:outline-none resize-none"
                                style={{ borderRadius: 0 }}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Optional notes about the verification decision..."
                                rows={4}
                                disabled={submitting}
                            />
                            <p className="text-sm text-base-content/40 mt-1">
                                Record any context about this verification decision for your team
                            </p>
                        </div>

                        {/* Status Info Box */}
                        <div className="bg-info/10 border-l-4 border-info p-4">
                            <div className="flex gap-3 items-start">
                                <i className="fa-duotone fa-regular fa-info-circle text-info text-lg mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-semibold text-base-content uppercase tracking-[0.2em] text-sm mb-2">
                                        Status Reference
                                    </p>
                                    <ul className="space-y-1.5">
                                        <li className="flex items-start gap-2">
                                            <span className="w-2 h-2 mt-1.5 bg-base-content/50 flex-shrink-0" />
                                            <span className="text-base-content/80">
                                                <strong className="text-base-content">
                                                    Unverified:
                                                </strong>{" "}
                                                Initial state. No review has been conducted.
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="w-2 h-2 mt-1.5 bg-warning flex-shrink-0" />
                                            <span className="text-base-content/80">
                                                <strong className="text-base-content">
                                                    Pending:
                                                </strong>{" "}
                                                Review is in progress.
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="w-2 h-2 mt-1.5 bg-success flex-shrink-0" />
                                            <span className="text-base-content/80">
                                                <strong className="text-base-content">
                                                    Verified:
                                                </strong>{" "}
                                                Profile information has been confirmed as accurate.
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="w-2 h-2 mt-1.5 bg-error flex-shrink-0" />
                                            <span className="text-base-content/80">
                                                <strong className="text-base-content">
                                                    Rejected:
                                                </strong>{" "}
                                                Verification did not pass review.
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
                                    <span className="font-semibold text-base-content text-sm">
                                        {error}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Footer Actions */}
                        <div className="px-0 py-4 border-t border-base-300 flex justify-end gap-3">
                            <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                style={{ borderRadius: 0 }}
                                onClick={handleClose}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary btn-sm"
                                style={{ borderRadius: 0 }}
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
            </div>
        </dialog>
    );
}
