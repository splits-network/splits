"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { ButtonLoading } from "@splits-network/shared-ui";

interface RequestToRepresentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    candidateName: string;
    candidateEmail: string;
}

export default function RequestToRepresentModal({
    isOpen,
    onClose,
    onSuccess,
    candidateName,
    candidateEmail,
}: RequestToRepresentModalProps) {
    const { getToken } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        setSubmitting(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            await client.post("/candidates", {
                email: candidateEmail,
                full_name: candidateName,
            });

            setSuccess(true);
        } catch (err: any) {
            console.error("Failed to send RTR request:", err);
            const message =
                err.message || err.response?.data?.error?.message || "";

            if (message.includes("Not authenticated")) {
                setError("Session expired. Refresh the page and try again.");
            } else {
                setError(
                    message ||
                        "Could not send the request. Please try again.",
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (submitting) return;
        if (success) {
            onSuccess();
        }
        setError(null);
        setSuccess(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <dialog className="modal modal-open modal-bottom sm:modal-middle">
            <div
                className="modal-box max-w-md w-full p-0"
                style={{ borderRadius: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-primary px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-black uppercase tracking-tight text-primary-content">
                        {success ? "Request Sent" : "Request to Represent"}
                    </h2>
                    <button
                        type="button"
                        className="btn btn-sm btn-square btn-ghost text-primary-content"
                        onClick={handleClose}
                        disabled={submitting}
                        aria-label="Close"
                    >
                        <i className="fa-duotone fa-regular fa-xmark" />
                    </button>
                </div>

                <div className="p-6">
                    {success ? (
                        <div className="space-y-6">
                            <div className="bg-success/10 border-l-4 border-success p-4">
                                <div className="flex gap-3 items-start">
                                    <i className="fa-duotone fa-regular fa-circle-check text-success text-xl mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-black text-base-content uppercase tracking-wider text-xs mb-1">
                                            RTR request sent
                                        </p>
                                        <p className="text-base-content/70 font-medium leading-relaxed">
                                            <strong>{candidateName}</strong> will
                                            receive an email to accept or decline
                                            your right-to-represent agreement.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    style={{ borderRadius: 0 }}
                                    onClick={handleClose}
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Candidate Info */}
                            <div className="border-2 border-base-300 p-4 mb-5">
                                <label className="text-xs font-black uppercase tracking-wider text-base-content/60 mb-2 block">
                                    Candidate
                                </label>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary flex items-center justify-center">
                                        <span className="text-sm font-black text-primary-content">
                                            {candidateName?.[0] || "?"}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="font-black text-base-content">
                                            {candidateName}
                                        </div>
                                        <div className="text-sm text-base-content/60 font-bold">
                                            {candidateEmail}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="bg-info/10 border-l-4 border-info p-4 mb-5">
                                <div className="flex gap-3 items-start">
                                    <i className="fa-duotone fa-regular fa-handshake text-info text-lg mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-black text-base-content uppercase tracking-wider text-xs mb-1">
                                            What happens next
                                        </p>
                                        <p className="text-base-content/70 font-medium leading-relaxed">
                                            The candidate will receive an email
                                            inviting them to accept your
                                            right-to-represent agreement. Once
                                            accepted, you can submit them to open
                                            roles.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="bg-error/10 border-l-4 border-error p-4 mb-5">
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
                                    type="button"
                                    className="btn btn-primary"
                                    style={{ borderRadius: 0 }}
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                >
                                    <ButtonLoading
                                        loading={submitting}
                                        text="Send RTR Request"
                                        loadingText="Sending..."
                                        icon="fa-duotone fa-regular fa-handshake"
                                    />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button
                    type="button"
                    onClick={handleClose}
                    disabled={submitting}
                >
                    close
                </button>
            </form>
        </dialog>
    );
}
