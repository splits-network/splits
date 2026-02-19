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

interface CreateTeamModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateTeamModal({
    isOpen,
    onClose,
    onSuccess,
}: CreateTeamModalProps) {
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
            await client.post("/teams", { name: name.trim() });

            toast.success("Team created successfully!");
            onSuccess();
        } catch (err: any) {
            setError(err.message || "Failed to create team");
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
                title="Create Team"
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

                        <BaselFormField label="Team Name" required>
                            <input
                                type="text"
                                className="input input-bordered w-full bg-base-200 border-base-300"
                                style={{ borderRadius: 0 }}
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
                        style={{ borderRadius: 0 }}
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ borderRadius: 0 }}
                        disabled={loading || !name.trim()}
                    >
                        <ButtonLoading
                            loading={loading}
                            text="Create Team"
                            loadingText="Creating..."
                        />
                    </button>
                </BaselModalFooter>
            </form>
        </BaselModal>
    );
}
