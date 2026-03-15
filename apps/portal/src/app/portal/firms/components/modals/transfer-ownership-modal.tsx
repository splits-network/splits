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
import type { FirmMember } from "../../types";

interface TransferOwnershipModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    firmId: string;
    members: FirmMember[];
}

export default function TransferOwnershipModal({
    isOpen,
    onClose,
    onSuccess,
    firmId,
    members,
}: TransferOwnershipModalProps) {
    const { getToken } = useAuth();
    const toast = useToast();

    const [selectedRecruiterId, setSelectedRecruiterId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [confirmed, setConfirmed] = useState(false);

    // Filter to active non-owner members
    const eligibleMembers = members.filter(
        (m) => m.status === "active" && m.role !== "owner",
    );

    const selectedMember = eligibleMembers.find(
        (m) => m.recruiter_id === selectedRecruiterId,
    );

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedRecruiterId || !confirmed) return;

        try {
            setLoading(true);
            setError(null);

            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            await client.post(`/firms/${firmId}/transfer-ownership`, {
                newOwnerRecruiterId: selectedRecruiterId,
            });

            toast.success("Ownership transferred.");
            onSuccess();
        } catch (err: any) {
            const message =
                err?.response?.data?.error || err.message || "Failed to transfer ownership";
            setError(message);
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
                title="Transfer Ownership"
                icon="fa-arrow-right-arrow-left"
                iconColor="warning"
                onClose={onClose}
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

                        <div className="bg-warning/10 text-warning text-sm p-3">
                            <i className="fa-duotone fa-regular fa-triangle-exclamation mr-2" />
                            This action will transfer firm ownership to another member.
                            You will be demoted to Admin. The new owner must have an
                            active Partner subscription.
                        </div>

                        {eligibleMembers.length === 0 ? (
                            <div className="bg-base-200 text-base-content/60 text-sm p-4 text-center">
                                No eligible members. Only active members can receive
                                ownership.
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2 block">
                                        New Owner
                                    </label>
                                    <select
                                        value={selectedRecruiterId}
                                        onChange={(e) => {
                                            setSelectedRecruiterId(e.target.value);
                                            setConfirmed(false);
                                        }}
                                        className="select w-full"
                                        style={{ borderRadius: 0 }}
                                        disabled={loading}
                                    >
                                        <option value="">Select a member</option>
                                        {eligibleMembers.map((m) => (
                                            <option
                                                key={m.recruiter_id}
                                                value={m.recruiter_id}
                                            >
                                                {m.recruiter?.user?.name || m.recruiter?.user?.email || "Unknown"}{" "}
                                                ({m.role})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedMember && (
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-warning mt-0.5"
                                            checked={confirmed}
                                            onChange={(e) =>
                                                setConfirmed(e.target.checked)
                                            }
                                            disabled={loading}
                                        />
                                        <span className="text-sm text-base-content/70">
                                            I confirm I want to transfer ownership to{" "}
                                            <strong>
                                                {selectedMember.recruiter?.user?.name ||
                                                    "this member"}
                                            </strong>
                                            . This cannot be undone without the new
                                            owner&apos;s consent.
                                        </span>
                                    </label>
                                )}
                            </>
                        )}
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
                        className="btn btn-warning"
                        style={{ borderRadius: 0 }}
                        disabled={
                            loading ||
                            !selectedRecruiterId ||
                            !confirmed ||
                            eligibleMembers.length === 0
                        }
                    >
                        <ButtonLoading
                            loading={loading}
                            text="Transfer Ownership"
                            loadingText="Transferring..."
                        />
                    </button>
                </BaselModalFooter>
            </form>
        </BaselModal>
    );
}
