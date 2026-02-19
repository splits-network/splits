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
                <div
                    className="modal-box border-2 border-base-300 bg-base-100 shadow-md"
                    style={{ borderRadius: 0 }}
                >
                    <h3 className="text-xl font-black tracking-tight mb-4">
                        <i className="fa-duotone fa-regular fa-link mr-2 text-primary" />
                        Request Connection
                    </h3>

                    <p className="text-sm text-base-content/60 mb-4">
                        Send a connection request to{" "}
                        <span className="font-bold text-base-content">
                            {company.name}
                        </span>
                    </p>

                    {error && (
                        <div className="p-3 mb-4 border-l-4 border-error bg-error/10">
                            <i className="fa-duotone fa-regular fa-circle-exclamation text-error mr-2" />
                            <span className="text-sm font-bold">
                                {error}
                            </span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40 mb-2 block">
                                Message (optional)
                            </label>
                            <textarea
                                className="textarea w-full border-2 border-base-300 focus:border-primary bg-base-200"
                                style={{ borderRadius: 0 }}
                                placeholder="Introduce yourself and explain why you'd like to connect..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                maxLength={500}
                                rows={4}
                                disabled={submitting}
                            />
                            <div className="text-xs font-bold text-base-content/30 text-right mt-1">
                                {message.length}/500
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
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
                                className="btn btn-primary"
                                style={{ borderRadius: 0 }}
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
                <form
                    method="dialog"
                    className="modal-backdrop"
                    onClick={handleClose}
                >
                    <button type="button">close</button>
                </form>
            </dialog>
        </ModalPortal>
    );
}
