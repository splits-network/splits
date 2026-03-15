"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import type { Job } from "../types";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export type JobStatus = "draft" | "pending" | "active" | "paused" | "filled" | "closed";

export interface UseStatusActionsOpts {
    job: Job;
    onRefresh?: () => void;
    onUpdateItem?: (id: string, patch: Partial<Job>) => void;
}

/* ─── Hook ───────────────────────────────────────────────────────────────── */

export function useStatusActions({ job, onRefresh, onUpdateItem }: UseStatusActionsOpts) {
    const { getToken } = useAuth();
    const toast = useToast();

    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [statusAction, setStatusAction] = useState<string | null>(null);
    const [pendingStatus, setPendingStatus] = useState<JobStatus | null>(null);
    const [pendingEarlyAccess, setPendingEarlyAccess] = useState(false);
    const [activatesAtInput, setActivatesAtInput] = useState("");

    const refresh = onRefresh ?? (() => {});

    /* ── Status Change ── */

    const handleStatusChange = useCallback((newStatus: JobStatus) => {
        setPendingStatus(newStatus);
    }, []);

    const confirmStatusChange = useCallback(async () => {
        if (!pendingStatus) return;
        const newStatus = pendingStatus;

        setPendingStatus(null);
        setUpdatingStatus(true);
        setStatusAction(newStatus);
        try {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            const client = createAuthenticatedClient(token);
            await client.patch(`/jobs/${job.id}`, { status: newStatus });
            toast.success(`Role status updated to ${newStatus}.`);
            onUpdateItem?.(job.id, { status: newStatus });
            refresh();
        } catch (error: any) {
            console.error("Failed to update status:", error);
            toast.error(`Failed to update status: ${error.message}`);
        } finally {
            setUpdatingStatus(false);
            setStatusAction(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pendingStatus, job.id]);

    const cancelStatusChange = useCallback(() => {
        setPendingStatus(null);
    }, []);

    /* ── Toggle Early Access ── */

    const handleToggleEarlyAccess = useCallback(() => {
        if (job.is_early_access) {
            doToggleEarlyAccess(false, null);
        } else {
            setActivatesAtInput("");
            setPendingEarlyAccess(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [job.is_early_access]);

    const confirmEarlyAccess = useCallback(async () => {
        if (!activatesAtInput) {
            toast.error("Activation date required for Early Access.");
            return;
        }
        setPendingEarlyAccess(false);
        await doToggleEarlyAccess(true, activatesAtInput);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activatesAtInput]);

    const cancelEarlyAccess = useCallback(() => {
        setPendingEarlyAccess(false);
    }, []);

    const doToggleEarlyAccess = async (enable: boolean, activatesAt: string | null) => {
        setUpdatingStatus(true);
        setStatusAction("early_access");
        try {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            const client = createAuthenticatedClient(token);
            const payload: Record<string, any> = { is_early_access: enable };
            if (enable && activatesAt) {
                payload.activates_at = new Date(activatesAt).toISOString();
            }
            await client.patch(`/jobs/${job.id}`, payload);
            toast.success(enable ? "Early access enabled." : "Early access disabled.");
            onUpdateItem?.(job.id, { is_early_access: enable });
            refresh();
        } catch (error: any) {
            console.error("Failed to toggle early access:", error);
            toast.error(`Failed to toggle early access: ${error.message}`);
        } finally {
            setUpdatingStatus(false);
            setStatusAction(null);
        }
    };

    /* ── Toggle Priority ── */

    const handleTogglePriority = useCallback(async () => {
        const newValue = !job.is_priority;
        setUpdatingStatus(true);
        setStatusAction("priority");
        try {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            const client = createAuthenticatedClient(token);
            await client.patch(`/jobs/${job.id}`, { is_priority: newValue });
            toast.success(newValue ? "Priority enabled." : "Priority disabled.");
            onUpdateItem?.(job.id, { is_priority: newValue });
            refresh();
        } catch (error: any) {
            console.error("Failed to toggle priority:", error);
            toast.error(`Failed to toggle priority: ${error.message}`);
        } finally {
            setUpdatingStatus(false);
            setStatusAction(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [job.id, job.is_priority]);

    return {
        updatingStatus,
        statusAction,
        pendingStatus,
        pendingEarlyAccess,
        activatesAtInput,
        setActivatesAtInput,
        handleStatusChange,
        confirmStatusChange,
        cancelStatusChange,
        handleToggleEarlyAccess,
        confirmEarlyAccess,
        cancelEarlyAccess,
        handleTogglePriority,
    };
}
