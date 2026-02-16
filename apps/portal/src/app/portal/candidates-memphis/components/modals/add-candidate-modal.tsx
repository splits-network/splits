"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { Button } from "@splits-network/memphis-ui";
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
                className="modal-box bg-white border-4 border-dark rounded-none max-w-md w-full p-0"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-coral px-6 py-4 border-b-4 border-dark flex items-center justify-between">
                    <h2 className="text-xl font-black uppercase tracking-tight text-coral-content">
                        Add New Candidate
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
                    <p className="text-dark/70 font-bold text-sm uppercase tracking-wider mb-6">
                        Send a candidate an invitation to join your network
                    </p>

                    {/* Error Alert */}
                    {error && (
                        <div className="bg-coral/10 border-4 border-coral p-4 mb-4">
                            <div className="flex gap-3 items-start">
                                <i className="fa-duotone fa-regular fa-circle-exclamation text-coral text-lg mt-0.5" />
                                <div className="flex-1">
                                    <span className="font-bold text-dark text-sm">{error}</span>
                                    {error.includes("already exists") && (
                                        <p className="text-sm mt-1 text-dark/60 font-medium">
                                            You can search for existing candidates
                                            from the candidates list.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name Field */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-dark mb-2">
                                Full Name <span className="text-coral">*</span>
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-white border-4 border-dark font-bold text-dark placeholder:text-dark/30 placeholder:font-medium focus:outline-none focus:border-coral transition-colors"
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
                            <label className="block text-xs font-black uppercase tracking-wider text-dark mb-2">
                                Email <span className="text-coral">*</span>
                            </label>
                            <input
                                type="email"
                                className="w-full px-4 py-3 bg-white border-4 border-dark font-bold text-dark placeholder:text-dark/30 placeholder:font-medium focus:outline-none focus:border-teal transition-colors"
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
                            <p className="text-xs font-bold text-dark/50 mt-2 uppercase tracking-wider">
                                They'll receive an invitation to join and accept
                                your representation
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 justify-end pt-2">
                            <Button
                                type="button"
                                variant="dark"
                                size="md"
                                onClick={handleClose}
                                disabled={submitting}
                                className="btn-outline"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="coral"
                                size="md"
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
                            </Button>
                        </div>
                    </form>

                    {/* Info Box */}
                    <div className="bg-teal/10 border-4 border-teal p-4 mt-6">
                        <div className="flex gap-3 items-start">
                            <i className="fa-duotone fa-regular fa-handshake text-teal text-lg mt-0.5" />
                            <div className="text-sm">
                                <p className="font-black text-dark uppercase tracking-wider text-xs mb-1">
                                    What happens next:
                                </p>
                                <p className="text-dark/70 font-medium leading-relaxed">
                                    The candidate will receive an invitation email
                                    to join Splits Network and accept your "right to
                                    represent" agreement. Once accepted, they can
                                    complete their profile and you can submit them to
                                    relevant job roles.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </dialog>
    );
}
