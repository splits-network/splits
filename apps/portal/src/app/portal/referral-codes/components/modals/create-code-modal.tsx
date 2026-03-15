"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import {
    BaselModal,
    BaselModalHeader,
    BaselModalBody,
    BaselModalFooter,
    BaselFormField,
    Button,
} from "@splits-network/basel-ui";

interface CreateCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateCodeModal({
    isOpen,
    onClose,
    onSuccess,
}: CreateCodeModalProps) {
    const { getToken } = useAuth();
    const [label, setLabel] = useState("");
    const [isDefault, setIsDefault] = useState(false);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreate = useCallback(async () => {
        try {
            setCreating(true);
            setError(null);
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            await client.post("/recruiter-codes", {
                label: label.trim() || undefined,
                is_default: isDefault || undefined,
            });

            setLabel("");
            setIsDefault(false);
            onSuccess();
        } catch (err: any) {
            if (err?.response?.status === 403 && err?.response?.data?.entitlement) {
                const limit = err.response.data.limit;
                setError(`You've reached your limit of ${limit} referral code${limit === 1 ? '' : 's'}. Upgrade your plan to create more.`);
            } else {
                setError(err.message || "Failed to create referral code");
            }
        } finally {
            setCreating(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [label, isDefault, onSuccess]);

    const handleClose = useCallback(() => {
        if (creating) return;
        setLabel("");
        setIsDefault(false);
        setError(null);
        onClose();
    }, [creating, onClose]);

    return (
        <BaselModal isOpen={isOpen} onClose={handleClose} maxWidth="max-w-md">
            <BaselModalHeader
                title="Create Referral Code"
                subtitle="Generate a new code"
                icon="fa-duotone fa-regular fa-link"
                onClose={handleClose}
                closeDisabled={creating}
            />
            <BaselModalBody>
                <p className="text-sm text-base-content/60 mb-4">
                    A unique code will be generated automatically. Add an
                    optional label to track which campaign or channel this code
                    is for.
                </p>

                <BaselFormField label="Label" hint="e.g., LinkedIn Q1 2026, Tech Meetup, Personal Website">
                    <input
                        type="text"
                        placeholder="Campaign name or description"
                        className="input input-bordered w-full bg-base-200 border-base-300 text-sm"
                        style={{ borderRadius: 0 }}
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        maxLength={255}
                        disabled={creating}
                    />
                </BaselFormField>

                <BaselFormField label="Default Code" className="mt-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={isDefault}
                            onChange={(e) => setIsDefault(e.target.checked)}
                            disabled={creating}
                        />
                        <span className="text-sm text-base-content/70">
                            Auto-attach this code when sharing jobs
                        </span>
                    </label>
                </BaselFormField>

                {error && (
                    <div className="mt-3 p-3 bg-error/10 border border-error/20 text-error text-sm">
                        <i className="fa-duotone fa-regular fa-circle-exclamation mr-2" />
                        {error}
                    </div>
                )}
            </BaselModalBody>
            <BaselModalFooter>
                <Button
                    variant="btn-ghost"
                    size="sm"
                    onClick={handleClose}
                    disabled={creating}
                >
                    Cancel
                </Button>
                <Button
                    variant="btn-primary"
                    size="sm"
                    onClick={handleCreate}
                    loading={creating}
                    icon="fa-duotone fa-regular fa-plus"
                >
                    Create Code
                </Button>
            </BaselModalFooter>
        </BaselModal>
    );
}
