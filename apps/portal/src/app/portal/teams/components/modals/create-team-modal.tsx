"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { Modal, Input, Button, AlertBanner } from "@splits-network/memphis-ui";
import { ButtonLoading } from "@splits-network/shared-ui";

interface CreateTeamModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateTeamModal({ onClose, onSuccess }: CreateTeamModalProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const [name, setName] = useState("");
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        try {
            setCreating(true);
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
            setCreating(false);
        }
    };

    return (
        <Modal
            open
            onClose={onClose}
            title="Create New Team"
            closeOnBackdrop={!creating}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    label="Team Name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Tech Recruiters Inc."
                    required
                    autoFocus
                    disabled={creating}
                />
                <p className="text-xs text-dark/50 -mt-4">
                    Choose a name for your recruiting team or agency
                </p>

                {error && <AlertBanner type="error">{error}</AlertBanner>}

                <div className="flex gap-3 justify-end">
                    <Button
                        type="button"
                        color="dark"
                        variant="ghost"
                        onClick={onClose}
                        disabled={creating}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        color="teal"
                        disabled={creating || !name.trim()}
                    >
                        <ButtonLoading
                            loading={creating}
                            text="Create Team"
                            loadingText="Creating..."
                            icon="fa-duotone fa-regular fa-check"
                        />
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
