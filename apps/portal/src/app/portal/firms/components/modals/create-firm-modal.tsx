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
    BaselFormField,
} from "@splits-network/basel-ui";
import { ButtonLoading } from "@splits-network/shared-ui";

interface CreateFirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateFirmModal({
    isOpen,
    onClose,
    onSuccess,
}: CreateFirmModalProps) {
    const { getToken } = useAuth();
    const toast = useToast();

    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        try {
            setLoading(true);
            setError(null);

            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            await client.post("/firms", { name: name.trim() });

            toast.success("Firm created.");
            onSuccess();
        } catch (err: any) {
            setError(err.message || "Failed to create firm");
        } finally {
            setLoading(false);
        }
    };

    return (
        <BaselModal
            isOpen={isOpen}
            onClose={onClose}
            closeOnBackdropClick={!loading}
        >
            <BaselModalHeader
                title="Create Firm"
                icon="fa-users"
                iconColor="primary"
                onClose={onClose}
                closeDisabled={loading}
            />

            <form onSubmit={handleSubmit}>
                <BaselModalBody>
                    <div className="space-y-4">
                        {error && (
                            <div className="bg-error/10 text-error text-sm p-3 mb-4">
                                {error}
                            </div>
                        )}

                        <BaselFormField label="Firm Name" required>
                            <input
                                type="text"
                                className="input w-full bg-base-200 border-base-300"

                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Tech Recruiters Inc."
                                autoFocus
                                disabled={loading}
                            />
                        </BaselFormField>
                    </div>
                </BaselModalBody>

                <BaselModalFooter>
                    <button
                        type="button"
                        className="btn btn-ghost"

                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"

                        disabled={loading || !name.trim()}
                    >
                        <ButtonLoading
                            loading={loading}
                            text="Create Firm"
                            loadingText="Creating..."
                        />
                    </button>
                </BaselModalFooter>
            </form>
        </BaselModal>
    );
}
