"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { ButtonLoading } from "@splits-network/shared-ui";
import { Button } from "@splits-network/memphis-ui";

interface VerificationModalProps {
    candidate: any;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (updatedCandidate: any) => void;
}

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    verified: { bg: "bg-teal/10", border: "border-teal", text: "text-teal", dot: "bg-teal" },
    pending: { bg: "bg-yellow/10", border: "border-yellow", text: "text-yellow", dot: "bg-yellow" },
    unverified: { bg: "bg-purple/10", border: "border-purple", text: "text-purple", dot: "bg-purple" },
    rejected: { bg: "bg-coral/10", border: "border-coral", text: "text-coral", dot: "bg-coral" },
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
                className="modal-box bg-white border-4 border-dark rounded-none max-w-lg w-full p-0"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-teal px-6 py-4 border-b-4 border-dark flex items-center justify-between">
                    <h2 className="text-xl font-black uppercase tracking-tight text-teal-content">
                        Update Verification
                    </h2>
                    <button
                        type="button"
                        className="w-8 h-8 flex items-center justify-center bg-dark text-white font-black text-lg leading-none hover:bg-dark/80 transition-colors"
                        onClick={handleClose}
                        disabled={submitting}
                        aria-label="Close"
                    >
                        <i className="fa-duotone fa-regular fa-times" />
                    </button>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Candidate Info */}
                        <div className="border-4 border-dark p-4">
                            <label className="block text-xs font-black uppercase tracking-wider text-dark/60 mb-2">
                                Candidate
                            </label>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple border-4 border-dark flex items-center justify-center flex-shrink-0">
                                    <span className="text-sm font-black text-white">
                                        {candidate.full_name?.[0] || "?"}
                                    </span>
                                </div>
                                <div>
                                    <div className="font-black text-dark">
                                        {candidate.full_name}
                                    </div>
                                    <div className="text-sm text-dark/60 font-bold">
                                        {candidate.email}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Select */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-dark mb-2">
                                Verification Status <span className="text-coral">*</span>
                            </label>
                            <select
                                className="w-full px-4 py-3 bg-white border-4 border-dark font-bold text-dark focus:outline-none focus:border-teal transition-colors"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                required
                                style={{ borderRadius: 0, appearance: "auto" }}
                                disabled={submitting}
                            >
                                <option value="unverified">Unverified</option>
                                <option value="pending">Pending Review</option>
                                <option value="verified">Verified</option>
                                <option value="rejected">Rejected</option>
                            </select>
                            <div className="mt-2 flex items-center gap-2">
                                <div className={`w-3 h-3 border-2 border-dark ${colors.dot}`} />
                                <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
                                    {status}
                                </span>
                            </div>
                        </div>

                        {/* Notes Textarea */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-dark mb-2">
                                Verification Notes
                            </label>
                            <textarea
                                className="w-full px-4 py-3 bg-white border-4 border-dark font-bold text-dark placeholder:text-dark/30 placeholder:font-medium focus:outline-none focus:border-teal transition-colors resize-none"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Optional notes about the verification decision..."
                                rows={4}
                                style={{ borderRadius: 0 }}
                                disabled={submitting}
                            />
                            <p className="text-xs font-bold text-dark/50 mt-1 uppercase tracking-wider">
                                Add any relevant notes about the verification process or decision
                            </p>
                        </div>

                        {/* Status Info Box */}
                        <div className="bg-sky/10 border-4 border-sky p-4">
                            <div className="flex gap-3 items-start">
                                <i className="fa-duotone fa-regular fa-info-circle text-sky text-lg mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-black text-dark uppercase tracking-wider text-xs mb-2">
                                        Status Meanings
                                    </p>
                                    <ul className="space-y-1.5">
                                        <li className="flex items-start gap-2">
                                            <span className="w-2 h-2 mt-1.5 bg-purple border-2 border-dark flex-shrink-0" />
                                            <span className="text-dark/80">
                                                <strong className="text-dark">Unverified:</strong> Default state, no verification performed
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="w-2 h-2 mt-1.5 bg-yellow border-2 border-dark flex-shrink-0" />
                                            <span className="text-dark/80">
                                                <strong className="text-dark">Pending:</strong> Verification in progress
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="w-2 h-2 mt-1.5 bg-teal border-2 border-dark flex-shrink-0" />
                                            <span className="text-dark/80">
                                                <strong className="text-dark">Verified:</strong> Candidate information confirmed and accurate
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="w-2 h-2 mt-1.5 bg-coral border-2 border-dark flex-shrink-0" />
                                            <span className="text-dark/80">
                                                <strong className="text-dark">Rejected:</strong> Verification failed
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-coral/10 border-4 border-coral p-4">
                                <div className="flex gap-3 items-start">
                                    <i className="fa-duotone fa-regular fa-circle-exclamation text-coral text-lg mt-0.5" />
                                    <span className="font-bold text-dark text-sm">{error}</span>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 justify-end pt-2">
                            <Button
                                type="button"
                                color="dark"
                                variant="outline"
                                size="md"
                                onClick={handleClose}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                color="teal"
                                size="md"
                                disabled={submitting}
                            >
                                <ButtonLoading
                                    loading={submitting}
                                    text="Update Status"
                                    loadingText="Updating..."
                                />
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </dialog>
    );
}
