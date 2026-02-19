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

interface InviteMemberModalProps {
    isOpen?: boolean;
    teamId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export function InviteMemberModal({
    isOpen = true,
    teamId,
    onClose,
    onSuccess,
}: InviteMemberModalProps) {
    console.log("[InviteMemberModal] mounted — teamId:", teamId);
    const { getToken } = useAuth();
    const toast = useToast();

    const [email, setEmail] = useState("");
    const [role, setRole] = useState("member");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        try {
            setLoading(true);
            setError(null);

            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            console.log(
                "[InviteMemberModal] teamId:",
                teamId,
                "email:",
                email,
                "role:",
                role,
            );
            await client.post(`/teams/${teamId}/invitations`, { email, role });

            toast.success(`Invitation sent to ${email}`);
            onSuccess();
        } catch (err: any) {
            setError(err.message || "Failed to send invitation");
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
                title="Invite Team Member"
                icon="fa-user-plus"
                iconColor="secondary"
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

                        <BaselFormField label="Email Address" required>
                            <input
                                type="email"
                                className="input input-bordered w-full bg-base-200 border-base-300"
                                style={{ borderRadius: 0 }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="recruiter@example.com"
                                autoFocus
                                disabled={loading}
                            />
                        </BaselFormField>

                        <BaselFormField label="Role" required>
                            <select
                                className="select select-bordered w-full bg-base-200 border-base-300"
                                style={{ borderRadius: 0 }}
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                disabled={loading}
                            >
                                <option value="admin">Admin</option>
                                <option value="member">Member</option>
                                <option value="collaborator">
                                    Collaborator
                                </option>
                            </select>
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
                        disabled={loading || !email.trim()}
                    >
                        <ButtonLoading
                            loading={loading}
                            text="Send Invitation"
                            loadingText="Sending..."
                        />
                    </button>
                </BaselModalFooter>
            </form>
        </BaselModal>
    );
}
