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
                    "A candidate with this email address already exists. Please use a different email or search for the existing candidate.",
                );
            } else if (errorMessage.includes("Not authenticated")) {
                setError(
                    "Your session has expired. Please refresh the page and try again.",
                );
            } else {
                setError(
                    errorMessage ||
                        "Failed to create candidate. Please try again.",
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
        <dialog className="modal modal-open" onClick={handleClose}>
            <div
                className="modal-box bg-base-100 border-2 border-base-300 max-w-md w-full p-0"
                style={{ borderRadius: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-primary px-6 py-4 border-b border-base-300 flex items-center justify-between">
                    <h2 className="text-lg font-black uppercase tracking-tight text-primary-content">
                        Add Candidate
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
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-6">
                        Invite a candidate to join your network
                    </p>

                    {/* Error Alert */}
                    {error && (
                        <div className="bg-error/10 border-l-4 border-error p-4 mb-4">
                            <div className="flex gap-3 items-start">
                                <i className="fa-duotone fa-regular fa-circle-exclamation text-error text-lg mt-0.5" />
                                <div className="flex-1">
                                    <span className="font-semibold text-base-content text-sm">
                                        {error}
                                    </span>
                                    {error.includes("already exists") && (
                                        <p className="text-sm mt-1 text-base-content/60">
                                            Search the candidates list to find the existing profile.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name Field */}
                        <div>
                            <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                                Full Name <span className="text-error">*</span>
                            </label>
                            <input
                                type="text"
                                className="input input-bordered w-full bg-base-100 border-base-300 font-medium focus:border-primary focus:outline-none"
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
                            <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                                Email Address <span className="text-error">*</span>
                            </label>
                            <input
                                type="email"
                                className="input input-bordered w-full bg-base-100 border-base-300 font-medium focus:border-primary focus:outline-none"
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
                            <p className="text-sm text-base-content/40 mt-2">
                                An invitation will be sent to this address to accept your representation
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 justify-end pt-2 border-t border-base-300">
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
                                disabled={
                                    submitting ||
                                    !formData.full_name.trim() ||
                                    !formData.email.trim()
                                }
                            >
                                <ButtonLoading
                                    loading={submitting}
                                    text="Send Invitation"
                                    loadingText="Creating..."
                                />
                            </button>
                        </div>
                    </form>

                    {/* Info Box */}
                    <div className="bg-info/10 border-l-4 border-info p-4 mt-6">
                        <div className="flex gap-3 items-start">
                            <i className="fa-duotone fa-regular fa-handshake text-info text-lg mt-0.5" />
                            <div className="text-sm">
                                <p className="font-semibold text-base-content uppercase tracking-[0.2em] text-sm mb-1">
                                    What Happens Next
                                </p>
                                <p className="text-base-content/70 leading-relaxed">
                                    The candidate receives an invitation to join Splits
                                    Network and accept your right-to-represent
                                    agreement. Once accepted, they complete their profile and
                                    you can submit them to open roles.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </dialog>
    );
}
