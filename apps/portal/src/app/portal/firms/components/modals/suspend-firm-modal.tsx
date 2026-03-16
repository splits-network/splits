"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import {
    BaselModal,
    BaselModalHeader,
    BaselModalBody,
    BaselModalFooter,
} from "@splits-network/basel-ui";
import { ButtonLoading } from "@splits-network/shared-ui";

interface SuspendFirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    firmId: string;
    firmName: string;
    currentStatus: "active" | "suspended";
}

export default function SuspendFirmModal({
    isOpen,
    onClose,
    onSuccess,
    firmId,
    firmName,
    currentStatus,
}: SuspendFirmModalProps) {
    const { getToken } = useAuth();
    const toast = useToast();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [confirmed, setConfirmed] = useState(false);

    const isSuspending = currentStatus === "active";
    const newStatus = isSuspending ? "suspended" : "active";

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!confirmed) return;

        try {
            setLoading(true);
            setError(null);

            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            await client.patch(`/firms/${firmId}`, {
                status: newStatus,
            });

            toast.success(
                isSuspending
                    ? "Firm has been suspended."
                    : "Firm has been reactivated.",
            );
            onSuccess();
        } catch (err: any) {
            const message =
                err?.response?.data?.error ||
                err.message ||
                `Failed to ${isSuspending ? "suspend" : "activate"} firm`;
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading) return;
        setConfirmed(false);
        setError(null);
        onClose();
    };

    return (
        <BaselModal
            isOpen={isOpen}
            onClose={handleClose}
            closeOnBackdropClick={!loading}
        >
            <BaselModalHeader
                title={isSuspending ? "Suspend Firm" : "Activate Firm"}
                icon={isSuspending ? "fa-ban" : "fa-check-circle"}
                iconColor={isSuspending ? "error" : "success"}
                onClose={handleClose}
                closeDisabled={loading}
            />

            <form onSubmit={handleSubmit}>
                <BaselModalBody>
                    <div className="space-y-4">
                        {error && (
                            <div className="bg-error/10 text-error text-sm p-3">
                                {error}
                            </div>
                        )}

                        <div
                            className={`${isSuspending ? "bg-error/10 text-error" : "bg-success/10 text-success"} text-sm p-3`}
                        >
                            <i
                                className={`fa-duotone fa-regular ${isSuspending ? "fa-triangle-exclamation" : "fa-circle-info"} mr-2`}
                            />
                            {isSuspending
                                ? "Suspending this firm will disable all member access and pause active placements. This action can be reversed."
                                : "Reactivating this firm will restore member access and resume normal operations."}
                        </div>

                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className={`checkbox ${isSuspending ? "checkbox-error" : "checkbox-success"} mt-0.5`}
                                checked={confirmed}
                                onChange={(e) =>
                                    setConfirmed(e.target.checked)
                                }
                                disabled={loading}
                            />
                            <span className="text-sm text-base-content/70">
                                I confirm I want to{" "}
                                {isSuspending ? "suspend" : "reactivate"}{" "}
                                <strong>{firmName}</strong>.
                            </span>
                        </label>
                    </div>
                </BaselModalBody>

                <BaselModalFooter>
                    <button
                        type="button"
                        className="btn btn-ghost"

                        onClick={handleClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={`btn ${isSuspending ? "btn-error" : "btn-success"}`}

                        disabled={loading || !confirmed}
                    >
                        <ButtonLoading
                            loading={loading}
                            text={isSuspending ? "Suspend Firm" : "Activate Firm"}
                            loadingText={
                                isSuspending ? "Suspending..." : "Activating..."
                            }
                        />
                    </button>
                </BaselModalFooter>
            </form>
        </BaselModal>
    );
}
