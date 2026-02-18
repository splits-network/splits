"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import {
    Modal,
    Input,
    Select,
    Button,
    AlertBanner,
} from "@splits-network/memphis-ui";
import { ButtonLoading } from "@splits-network/shared-ui";

const ROLES = [
    { value: "member", label: "Member" },
    { value: "admin", label: "Admin" },
    { value: "collaborator", label: "Collaborator" },
];

interface InviteMemberModalProps {
    teamId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export function InviteMemberModal({
    teamId,
    onClose,
    onSuccess,
}: InviteMemberModalProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("member");
    const [inviting, setInviting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        try {
            setInviting(true);
            setError(null);
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            await client.post(`/teams/${teamId}/invitations`, { email, role });

            toast.success(`Invitation sent to ${email}`);
            onSuccess();
        } catch (err: any) {
            setError(err.message || "Failed to send invitation");
        } finally {
            setInviting(false);
        }
    };

    return (
        <Modal
            open
            onClose={onClose}
            title="Invite Team Member"
            closeOnBackdrop={!inviting}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="recruiter@example.com"
                    required
                    autoFocus
                    disabled={inviting}
                />

                <Select
                    label="Role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    options={ROLES}
                    disabled={inviting}
                />
                <p className="text-xs text-dark/50 -mt-4">
                    Admins can manage members and settings
                </p>

                {error && <AlertBanner type="error">{error}</AlertBanner>}

                <div className="flex gap-3 justify-end">
                    <Button
                        type="button"
                        color="dark"
                        variant="ghost"
                        onClick={onClose}
                        disabled={inviting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        color="teal"
                        disabled={inviting || !email.trim()}
                    >
                        <ButtonLoading
                            loading={inviting}
                            text="Send Invitation"
                            loadingText="Sending..."
                            icon="fa-duotone fa-regular fa-paper-plane"
                        />
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
