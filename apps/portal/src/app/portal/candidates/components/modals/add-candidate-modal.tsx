"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { ButtonLoading } from "@splits-network/shared-ui";

interface AddCandidateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (candidate: any) => void;
}

export default function AddCandidateModal({
    isOpen,
    onClose,
    onSuccess,
}: AddCandidateModalProps) {
    const { getToken } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            const payload = {
                email: formData.email.trim(),
                full_name: formData.full_name.trim(),
            };

            const response = await client.post("/candidates", payload);
            setFormData({ full_name: "", email: "" });
            onSuccess(response.data);
            onClose();
        } catch (error: any) {
            console.error("Failed to create candidate:", error);
            const errorMessage =
                error.message ||
                error.response?.data?.error?.message ||
                "";

            if (
                errorMessage.includes("candidates_email_key") ||
                errorMessage.includes("duplicate key") ||
                errorMessage.includes("already exists")
            ) {
                setError(
                    "A candidate with this email already exists. Search for them in your candidate list or use a different email.",
                );
            } else if (errorMessage.includes("Not authenticated")) {
                setError(
                    "Session expired. Refresh the page and try again.",
                );
            } else {
                setError(
                    errorMessage ||
                        "Could not create candidate. Check your input and try again.",
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (submitting) return;
        setFormData({ full_name: "", email: "" });
        setError(null);
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
                        Add Candidate
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
                    <p className="text-sm font-bold uppercase tracking-wider text-base-content/60 mb-6">
                        Invite a candidate to join your pipeline
                    </p>

                    {/* Error Alert */}
                    {error && (
                        <div className="bg-error/10 border-l-4 border-error p-4 mb-4">
                            <div className="flex gap-3 items-start">
                                <i className="fa-duotone fa-regular fa-circle-exclamation text-error text-lg mt-0.5" />
                                <div className="flex-1">
                                    <span className="font-bold text-base-content text-sm">
                                        {error}
                                    </span>
                                    {error.includes("already exists") && (
                                        <p className="text-sm mt-1 text-base-content/60 font-medium">
                                            Use the search bar on the candidates
                                            page to find them.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name Field */}
                        <div>
                            <label className="block text-sm font-bold uppercase tracking-wider text-base-content/60 mb-2">
                                Full Name <span className="text-error">*</span>
                            </label>
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                style={{ borderRadius: 0 }}
                                value={formData.full_name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        full_name: e.target.value,
                                    })
                                }
                                placeholder="John Doe"
                                required
                                disabled={submitting}
                                autoFocus
                            />
                        </div>

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-bold uppercase tracking-wider text-base-content/60 mb-2">
                                Email <span className="text-error">*</span>
                            </label>
                            <input
                                type="email"
                                className="input input-bordered w-full"
                                style={{ borderRadius: 0 }}
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        email: e.target.value,
                                    })
                                }
                                placeholder="john@example.com"
                                required
                                disabled={submitting}
                            />
                            <p className="text-xs font-bold text-base-content/50 mt-2 uppercase tracking-wider">
                                An invitation to accept your representation will
                                be sent to this address
                            </p>
                        </div>

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
                                disabled={
                                    submitting ||
                                    !formData.full_name.trim() ||
                                    !formData.email.trim()
                                }
                            >
                                <ButtonLoading
                                    loading={submitting}
                                    text="Send Invitation"
                                    loadingText="Sending..."
                                />
                            </button>
                        </div>
                    </form>

                    {/* Info Box */}
                    <div className="bg-info/10 border-l-4 border-info p-4 mt-6">
                        <div className="flex gap-3 items-start">
                            <i className="fa-duotone fa-regular fa-handshake text-info text-lg mt-0.5" />
                            <div className="text-sm">
                                <p className="font-black text-base-content uppercase tracking-wider text-xs mb-1">
                                    What happens next
                                </p>
                                <p className="text-base-content/70 font-medium leading-relaxed">
                                    The candidate receives an email inviting them
                                    to join Splits Network and accept your right-to-represent
                                    agreement. Once they accept, you can complete their
                                    profile and submit them to open roles.
                                </p>
                            </div>
                        </div>
                    </div>
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
