"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { ButtonLoading } from "@splits-network/shared-ui";
import { Company } from "../../types";

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
        <dialog
            open={isOpen}
            className="modal"
            onClick={(e) => {
                if (e.target === e.currentTarget) handleClose();
            }}
        >
            <div className="modal-box">
                <h3 className="font-bold text-lg mb-4">
                    <i className="fa-duotone fa-regular fa-link mr-2" />
                    Request Connection
                </h3>

                <p className="text-sm text-base-content/60 mb-4">
                    Send a connection request to{" "}
                    <span className="font-semibold">{company.name}</span>
                </p>

                {error && (
                    <div className="alert alert-error mb-4">
                        <i className="fa-duotone fa-regular fa-circle-exclamation" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            Message (optional)
                        </legend>
                        <textarea
                            className="textarea w-full"
                            placeholder="Introduce yourself and explain why you'd like to connect..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={500}
                            rows={4}
                            disabled={submitting}
                        />
                        <div className="text-xs text-base-content/40 text-right mt-1">
                            {message.length}/500
                        </div>
                    </fieldset>

                    <div className="modal-action">
                        <button
                            type="button"
                            className="btn"
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
        </dialog>
    );
}
