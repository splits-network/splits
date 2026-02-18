"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { ButtonLoading, ModalPortal } from "@splits-network/shared-ui";
import type { Company } from "../../types";

interface RequestConnectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    company: Company;
    onSuccess: () => void;
}

export default function RequestConnectionModal({
    isOpen,
    onClose,
    company,
    onSuccess,
}: RequestConnectionModalProps) {
    const { getToken } = useAuth();
    const [message, setMessage] = useState("");
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

            await client.post("/recruiter-companies/request-connection", {
                company_id: company.id,
                message: message.trim() || undefined,
            });

            setMessage("");
            onSuccess();
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.error?.message ||
                err?.message ||
                "Failed to send connection request";
            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!submitting) {
            setMessage("");
            setError(null);
            onClose();
        }
    };

    return (
        <ModalPortal>
            <dialog
                open={isOpen}
                className="modal modal-open"
                onClick={(e) => {
                    if (e.target === e.currentTarget) handleClose();
                }}
            >
                <div className="modal-box border-4 border-dark bg-white">
                    <h3 className="font-black text-xl uppercase tracking-tight mb-4 text-dark">
                        <i className="fa-duotone fa-regular fa-link mr-2 text-coral" />
                        Request Connection
                    </h3>

                    <p className="text-sm text-dark/60 mb-4">
                        Send a connection request to{" "}
                        <span className="font-bold text-dark">{company.name}</span>
                    </p>

                    {error && (
                        <div className="p-3 mb-4 border-4 border-coral bg-coral/10">
                            <i className="fa-duotone fa-regular fa-circle-exclamation text-coral mr-2" />
                            <span className="text-sm font-bold text-dark">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-2 block">
                                Message (optional)
                            </label>
                            <textarea
                                className="textarea w-full border-2 border-dark/20 focus:border-coral bg-cream"
                                placeholder="Introduce yourself and explain why you'd like to connect..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                maxLength={500}
                                rows={4}
                                disabled={submitting}
                            />
                            <div className="text-xs font-bold text-dark/40 text-right mt-1">
                                {message.length}/500
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={handleClose}
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
                                    text="Send Request"
                                    loadingText="Sending..."
                                />
                            </button>
                        </div>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop" onClick={handleClose}>
                    <button type="button">close</button>
                </form>
            </dialog>
        </ModalPortal>
    );
}
