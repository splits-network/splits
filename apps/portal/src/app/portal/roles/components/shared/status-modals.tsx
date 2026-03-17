"use client";

import { BaselConfirmModal } from "@splits-network/basel-ui";
import type { JobStatus } from "../../hooks/use-status-actions";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface StatusModalsProps {
    pendingStatus: JobStatus | null;
    pendingEarlyAccess: boolean;
    activatesAtInput: string;
    onActivatesAtChange: (value: string) => void;
    onConfirmStatus: () => void;
    onCancelStatus: () => void;
    onConfirmEarlyAccess: () => void;
    onCancelEarlyAccess: () => void;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function StatusModals({
    pendingStatus,
    pendingEarlyAccess,
    activatesAtInput,
    onActivatesAtChange,
    onConfirmStatus,
    onCancelStatus,
    onConfirmEarlyAccess,
    onCancelEarlyAccess,
}: StatusModalsProps) {
    return (
        <>
            <BaselConfirmModal
                isOpen={!!pendingStatus}
                onClose={onCancelStatus}
                onConfirm={onConfirmStatus}
                title="Change Role Status"
                icon="fa-triangle-exclamation"
                confirmColor={pendingStatus === "closed" ? "btn-error" : pendingStatus === "paused" ? "btn-warning" : "btn-primary"}
            >
                <p>Are you sure you want to change the status to {pendingStatus}?</p>
            </BaselConfirmModal>
            <BaselConfirmModal
                isOpen={pendingEarlyAccess}
                onClose={onCancelEarlyAccess}
                onConfirm={onConfirmEarlyAccess}
                title="Enable Early Access"
                icon="fa-lock-open"
                confirmColor="btn-accent"
            >
                <p>Only partner-tier recruiters will see this role until the activation date.</p>
                <fieldset className="fieldset mt-4">
                    <legend className="fieldset-legend">Activation Date *</legend>
                    <input
                        type="datetime-local"
                        className="input w-full"
                        value={activatesAtInput}
                        onChange={(e) => onActivatesAtChange(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                        required
                    />
                    <p className="label text-sm text-base-content/60">
                        The role will become visible to all recruiters on this date.
                    </p>
                </fieldset>
            </BaselConfirmModal>
        </>
    );
}
