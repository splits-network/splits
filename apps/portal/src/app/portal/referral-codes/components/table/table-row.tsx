"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { Button, BaselConfirmModal } from "@splits-network/basel-ui";
import type { RecruiterCode } from "../../types";
import { statusColor } from "../shared/status-color";
import { formatDate, copyShareLink } from "../shared/helpers";

export function TableRow({
    code,
    idx,
    onRefresh,
}: {
    code: RecruiterCode;
    idx: number;
    onRefresh?: () => void;
}) {
    const { getToken } = useAuth();
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [toggling, setToggling] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleCopy = useCallback(() => {
        copyShareLink(code.code);
        setCopiedId(code.id);
        setTimeout(() => setCopiedId(null), 2000);
    }, [code.code, code.id]);

    const handleToggleStatus = useCallback(async () => {
        try {
            setToggling(true);
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const newStatus = code.status === "active" ? "inactive" : "active";
            await client.patch(`/recruiter-codes/${code.id}`, {
                status: newStatus,
            });
            onRefresh?.();
        } catch (err) {
            console.error("Failed to toggle code status:", err);
        } finally {
            setToggling(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code.id, code.status, onRefresh]);

    const handleDelete = useCallback(async () => {
        try {
            setDeleting(true);
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            await client.delete(`/recruiter-codes/${code.id}`);
            setShowDeleteModal(false);
            onRefresh?.();
        } catch (err) {
            console.error("Failed to delete code:", err);
        } finally {
            setDeleting(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code.id, onRefresh]);

    return (
        <>
            <tr
                className={`transition-colors border-b border-base-200 ${
                    idx % 2 === 0 ? "bg-base-100" : "bg-base-200/30"
                }`}
            >
                {/* Code */}
                <td className="px-6 py-4">
                    <span className="font-mono text-sm font-bold tracking-wide bg-base-200 px-3 py-1.5 border border-base-300 inline-block">
                        {code.code}
                    </span>
                </td>

                {/* Label */}
                <td className="px-6 py-4">
                    <span className="text-sm text-base-content/70">
                        {code.label || (
                            <span className="text-base-content/30 italic">
                                No label
                            </span>
                        )}
                    </span>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                    <span
                        className={`text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-1 ${statusColor(code)}`}
                    >
                        <i
                            className={`fa-duotone fa-regular ${
                                code.status === "active"
                                    ? "fa-circle-check"
                                    : "fa-circle-pause"
                            } mr-1`}
                        />
                        {code.status}
                    </span>
                </td>

                {/* Signups */}
                <td className="px-6 py-4">
                    <span className="text-sm font-bold tracking-tight">
                        {code.usage_count ?? 0}
                    </span>
                </td>

                {/* Created */}
                <td className="px-6 py-4 text-sm text-base-content/50">
                    {formatDate(code.created_at)}
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                    <div className="flex items-center gap-1 justify-end">
                        <Button
                            icon={
                                copiedId === code.id
                                    ? "fa-duotone fa-regular fa-check"
                                    : "fa-duotone fa-regular fa-copy"
                            }
                            variant={
                                copiedId === code.id
                                    ? "btn-success btn-square"
                                    : "btn-ghost btn-square"
                            }
                            size="xs"
                            onClick={handleCopy}
                            title="Copy share link"
                        />
                        <Button
                            icon={`fa-duotone fa-regular ${
                                code.status === "active"
                                    ? "fa-pause"
                                    : "fa-play"
                            }`}
                            variant="btn-ghost btn-square"
                            size="xs"
                            onClick={handleToggleStatus}
                            loading={toggling}
                            title={
                                code.status === "active"
                                    ? "Deactivate code"
                                    : "Activate code"
                            }
                        />
                        <div className="w-px h-4 bg-base-300" />
                        <Button
                            icon="fa-duotone fa-regular fa-trash"
                            variant="btn-ghost btn-square text-error"
                            size="xs"
                            onClick={() => setShowDeleteModal(true)}
                            title="Delete code"
                        />
                    </div>
                </td>
            </tr>

            <BaselConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Referral Code"
                subtitle="This action cannot be undone"
                icon="fa-duotone fa-regular fa-trash"
                confirmLabel="Delete Code"
                confirmColor="btn-error"
                confirming={deleting}
                confirmingLabel="Deleting..."
            >
                <p className="text-base-content/70">
                    Are you sure you want to delete the referral code{" "}
                    <span className="font-mono font-bold">{code.code}</span>
                    {code.label && (
                        <>
                            {" "}
                            (<span className="font-semibold">{code.label}</span>)
                        </>
                    )}
                    ? This will permanently remove the code and its share link
                    will stop working.
                </p>
            </BaselConfirmModal>
        </>
    );
}
