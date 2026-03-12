"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { useUserProfile } from "@/contexts";
import { ModalPortal } from "@splits-network/shared-ui";
import RoleWizardModal from "../modals/role-wizard-modal";
import BaselSubmitCandidateWizard from "@/components/basel/applications/submit-candidate-wizard";
import PipelineModal from "../modals/pipeline-modal";
import type { Job } from "../../types";
import {
    Button,
    SpeedMenu,
    BaselConfirmModal,
    type SpeedDialAction,
} from "@splits-network/basel-ui";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface RoleActionsToolbarProps {
    job: Job;
    variant: "icon-only" | "descriptive";
    layout?: "horizontal" | "vertical";
    size?: "xs" | "sm" | "md" | "lg";
    showActions?: {
        viewDetails?: boolean;
        viewPipeline?: boolean;
        submitCandidate?: boolean;
        edit?: boolean;
        statusActions?: boolean;
        share?: boolean;
        save?: boolean;
    };
    onRefresh?: () => void;
    /** Synchronously patches the item in the React Query cache so every view
     *  using the same query key re-renders immediately on mutation success. */
    onUpdateItem?: (id: string, patch: Partial<Job>) => void;
    onViewDetails?: (jobId: string) => void;
    onViewPipeline?: (jobId: string) => void;
    className?: string;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function RoleActionsToolbar({
    job,
    variant,
    layout = "horizontal",
    size = "sm",
    showActions = {},
    onRefresh,
    onUpdateItem,
    onViewDetails,
    onViewPipeline,
    className = "",
}: RoleActionsToolbarProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const { profile, isAdmin, isRecruiter, hasPermissionForCompany } =
        useUserProfile();
    const refresh = onRefresh ?? (() => {});

    const [showEditModal, setShowEditModal] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showPipelineModal, setShowPipelineModal] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [statusAction, setStatusAction] = useState<string | null>(null);
    const [pendingStatus, setPendingStatus] = useState<"draft" | "pending" | "active" | "paused" | "filled" | "closed" | null>(null);
    const [pendingEarlyAccess, setPendingEarlyAccess] = useState(false);
    const [activatesAtInput, setActivatesAtInput] = useState("");

    /* ── Permissions ── */

    const canManageRole = useMemo(() => {
        if (isAdmin) return true;
        const isCompanyAdmin = profile?.roles?.includes("company_admin");
        if (isCompanyAdmin) return true;
        if (
            isRecruiter &&
            job.company_id &&
            hasPermissionForCompany(job.company_id, "can_edit_jobs")
        )
            return true;
        return false;
    }, [isAdmin, profile, isRecruiter, job.company_id, hasPermissionForCompany]);

    const canSubmitCandidate = useMemo(() => {
        if (isAdmin) return true;
        if (!isRecruiter) return false;
        if (!job.company_id) return true; // Firm job — recruiter has full access
        return hasPermissionForCompany(job.company_id, "can_submit_candidates");
    }, [isRecruiter, isAdmin, job.company_id, hasPermissionForCompany]);

    /* ── Status Change ── */

    const handleStatusChange = (
        newStatus: "draft" | "pending" | "active" | "paused" | "filled" | "closed",
    ) => {
        setPendingStatus(newStatus);
    };

    const confirmStatusChange = async () => {
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
    };

    /* ── Toggle Early Access ── */

    const handleToggleEarlyAccess = () => {
        if (job.is_early_access) {
            // Turn off — no confirmation needed
            doToggleEarlyAccess(false, null);
        } else {
            // Turn on — need activation date
            setActivatesAtInput("");
            setPendingEarlyAccess(true);
        }
    };

    const confirmEarlyAccess = async () => {
        if (!activatesAtInput) {
            toast.error("Activation date required for Early Access.");
            return;
        }
        setPendingEarlyAccess(false);
        await doToggleEarlyAccess(true, activatesAtInput);
    };

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

    const handleTogglePriority = async () => {
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
    };

    /* ── Share ── */

    const handleShare = async () => {
        if (!job) return;
        setIsSharing(true);
        const candidateAppUrl =
            process.env.NEXT_PUBLIC_CANDIDATE_APP_URL ||
            "https://staging.applicant.network";

        // Fetch default referral code to attach attribution
        let recCodeParam = "";
        if (isRecruiter) {
            try {
                const token = await getToken();
                if (token) {
                    const client = createAuthenticatedClient(token);
                    const res = await client.get("/recruiter-codes/default");
                    const defaultCode = res?.data?.code;
                    if (defaultCode) {
                        recCodeParam = `?rec_code=${defaultCode}`;
                    }
                }
            } catch {
                // Share without rec_code if fetch fails
            }
        }

        const shareUrl = `${candidateAppUrl}/jobs/${job.id}${recCodeParam}`;
        const shareText = `Check out this job: ${job.title || "Job Opportunity"} at ${job.company?.name || "Company"}`;
        const clipboardText = `${shareText}\n${shareUrl}`;
        try {
            if (navigator.share && navigator.canShare?.({ url: shareUrl })) {
                await navigator.share({
                    title: `${job.title || "Job Opportunity"} at ${job.company?.name || "Company"}`,
                    text: shareText,
                    url: shareUrl,
                });
            } else {
                await navigator.clipboard.writeText(clipboardText);
                toast.info("Link copied to clipboard.");
            }
        } catch (error: any) {
            if (error.name !== "AbortError") {
                try {
                    await navigator.clipboard.writeText(clipboardText);
                    toast.info("Link copied to clipboard.");
                } catch {
                    toast.error("Link couldn't be copied. Try again.");
                }
            }
        } finally {
            setIsSharing(false);
        }
    };

    /* ── Save/Bookmark ── */

    const handleToggleSave = async () => {
        setIsSaving(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            const client = createAuthenticatedClient(token);

            if (job.is_saved && job.saved_record_id) {
                await client.delete(`/api/v3/recruiter-saved-jobs/${job.saved_record_id}`);
                onUpdateItem?.(job.id, { is_saved: false, saved_record_id: null });
                toast.info("Role removed from saved.");
            } else {
                const res = await client.post("/api/v3/recruiter-saved-jobs", { job_id: job.id });
                onUpdateItem?.(job.id, { is_saved: true, saved_record_id: res?.data?.id });
                toast.success("Role saved.");
            }
        } catch (error: any) {
            console.error("Failed to toggle save:", error);
            if (error?.response?.status === 403 && error?.response?.data?.entitlement) {
                toast.error(`You've reached your saved roles limit. Upgrade your plan for more.`);
            } else {
                toast.error("Failed to update saved status.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    /* ── Handlers ── */

    const handleViewDetails = () => onViewDetails?.(job.id);
    const handleViewPipeline = () => {
        if (onViewPipeline) {
            onViewPipeline(job.id);
        } else {
            setShowPipelineModal(true);
        }
    };
    const handleEditSuccess = () => {
        setShowEditModal(false);
        refresh();
    };

    /* ── Visibility ── */

    const actions = {
        viewDetails: showActions.viewDetails !== false,
        viewPipeline: showActions.viewPipeline !== false,
        submitCandidate:
            showActions.submitCandidate !== false && canSubmitCandidate,
        edit: showActions.edit !== false && canManageRole,
        statusActions: showActions.statusActions !== false && canManageRole,
        share: showActions.share !== false,
        save: showActions.save !== false && isRecruiter,
    };

    const getSizeClass = () => `btn-${size}`;
    const getLayoutClass = () =>
        layout === "horizontal" ? "gap-1" : "flex-col gap-2";

    /* ── Quick Status Button (icon-only) ── */

    const isLiveStatus = job.status === "active";

    const renderQuickStatusButton = () => {
        if (variant !== "icon-only" || !actions.statusActions) return null;
        if (isLiveStatus) {
            return (
                <Button
                    icon="fa-duotone fa-regular fa-pause"
                    variant="btn-secondary"
                    size={size}
                    onClick={() => handleStatusChange("paused")}
                    disabled={updatingStatus}
                    loading={updatingStatus && statusAction === "paused"}
                    title="Pause Role"
                />
            );
        }
        if (job.status === "paused") {
            return (
                <Button
                    icon="fa-duotone fa-regular fa-play"
                    variant="btn-success"
                    size={size}
                    onClick={() => handleStatusChange("active")}
                    disabled={updatingStatus}
                    loading={updatingStatus && statusAction === "active"}
                    title="Activate Role"
                />
            );
        }
        if (job.status === "draft") {
            return (
                <Button
                    icon="fa-duotone fa-regular fa-play"
                    variant="btn-success"
                    size={size}
                    onClick={() => handleStatusChange("active")}
                    disabled={updatingStatus}
                    loading={updatingStatus && statusAction === "active"}
                    title="Publish Role"
                />
            );
        }
        return null;
    };

    /* ── Status Dropdown ── */

    const statusDropdownRef = useRef<HTMLDetailsElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (
                statusDropdownRef.current &&
                !statusDropdownRef.current.contains(e.target as Node)
            ) {
                statusDropdownRef.current.removeAttribute("open");
            }
        };
        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, []);

    type StatusItem = {
        key: string;
        status?: "draft" | "pending" | "active" | "paused" | "filled" | "closed";
        label: string;
        icon: string;
        btnClass: string;
        action?: () => void;
    };

    const statusItems = useMemo(() => {
        const items: StatusItem[] = [];

        if (job.status === "draft") {
            items.push({ key: "active", status: "active", label: "Publish Live", icon: "fa-duotone fa-regular fa-play", btnClass: "text-success" });
            items.push({ key: "pending", status: "pending", label: "Submit for Approval", icon: "fa-duotone fa-regular fa-paper-plane", btnClass: "text-warning" });
        }
        if (job.status === "pending") {
            items.push({ key: "active", status: "active", label: "Activate", icon: "fa-duotone fa-regular fa-play", btnClass: "text-success" });
            items.push({ key: "paused", status: "paused", label: "Pause", icon: "fa-duotone fa-regular fa-pause", btnClass: "text-warning" });
        }
        if (job.status === "active") {
            items.push({ key: "paused", status: "paused", label: "Pause", icon: "fa-duotone fa-regular fa-pause", btnClass: "text-warning" });
        }
        if (job.status === "paused") {
            items.push({ key: "active", status: "active", label: "Activate", icon: "fa-duotone fa-regular fa-play", btnClass: "text-success" });
        }
        if (job.status === "filled" || job.status === "closed") {
            items.push({ key: "active", status: "active", label: "Reopen", icon: "fa-duotone fa-regular fa-rotate-left", btnClass: "text-success" });
        }

        // Toggle modifiers (only for active/paused jobs)
        if (["active", "paused"].includes(job.status)) {
            items.push({
                key: "early_access",
                label: job.is_early_access ? "Disable Early Access" : "Enable Early Access",
                icon: job.is_early_access ? "fa-duotone fa-regular fa-lock" : "fa-duotone fa-regular fa-lock-open",
                btnClass: job.is_early_access ? "text-base-content/60" : "text-accent",
                action: handleToggleEarlyAccess,
            });
            items.push({
                key: "priority",
                label: job.is_priority ? "Remove Priority" : "Set Priority",
                icon: job.is_priority ? "fa-duotone fa-regular fa-star" : "fa-regular fa-star",
                btnClass: job.is_priority ? "text-base-content/60" : "text-primary",
                action: handleTogglePriority,
            });
        }

        // Terminal options — always available unless already in that state
        if (job.status !== "filled" && !["draft", "pending"].includes(job.status)) {
            items.push({ key: "filled", status: "filled", label: "Mark Filled", icon: "fa-duotone fa-regular fa-check", btnClass: "text-info" });
        }
        if (job.status !== "closed") {
            items.push({ key: "closed", status: "closed", label: "Close", icon: "fa-duotone fa-regular fa-xmark", btnClass: "text-error" });
        }

        return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [job.status, job.is_early_access, job.is_priority]);

    const renderStatusDropdown = () => {
        if (!actions.statusActions || statusItems.length === 0) return null;
        return (
            <details ref={statusDropdownRef} className="dropdown dropdown-end">
                <summary
                    className={`btn ${getSizeClass()} btn-primary gap-2 list-none`}
                    style={{ borderRadius: 0 }}
                    title="Change Status"
                >
                    {updatingStatus ? (
                        <span className="loading loading-spinner loading-xs" />
                    ) : (
                        <i className="fa-duotone fa-regular fa-ellipsis-vertical" />
                    )}
                    <span className="hidden md:inline">Status</span>
                </summary>
                <ul
                    className="dropdown-content menu bg-base-100 border-2 border-base-300 shadow-md p-2 w-48 mt-1"
                    style={{ borderRadius: 0 }}
                >
                    {statusItems.map((item) => (
                        <li key={item.key}>
                            <button
                                onClick={() => {
                                    statusDropdownRef.current?.removeAttribute(
                                        "open",
                                    );
                                    if (item.action) {
                                        item.action();
                                    } else if (item.status) {
                                        handleStatusChange(item.status);
                                    }
                                }}
                                className={`${item.btnClass} font-bold`}
                                disabled={updatingStatus}
                            >
                                {updatingStatus &&
                                statusAction === (item.status || item.key) ? (
                                    <span className="loading loading-spinner loading-xs" />
                                ) : (
                                    <i className={item.icon} />
                                )}
                                {item.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </details>
        );
    };

    /* ── Modals ── */

    const modals = (
        <>
            <BaselConfirmModal
                isOpen={!!pendingStatus}
                onClose={() => setPendingStatus(null)}
                onConfirm={confirmStatusChange}
                title="Change Role Status"
                icon="fa-triangle-exclamation"
                confirmColor={pendingStatus === "closed" ? "btn-error" : pendingStatus === "paused" ? "btn-warning" : "btn-primary"}
            >
                <p>Are you sure you want to change the status to {pendingStatus}?</p>
            </BaselConfirmModal>
            <BaselConfirmModal
                isOpen={pendingEarlyAccess}
                onClose={() => setPendingEarlyAccess(false)}
                onConfirm={confirmEarlyAccess}
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
                        onChange={(e) => setActivatesAtInput(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                        required
                    />
                    <p className="label text-sm text-base-content/60">
                        The role will become visible to all recruiters on this date.
                    </p>
                </fieldset>
            </BaselConfirmModal>
            <ModalPortal>
                {showEditModal && (
                    <RoleWizardModal
                        isOpen={showEditModal}
                        jobId={job.id}
                        mode="edit"
                        onClose={() => setShowEditModal(false)}
                        onSuccess={handleEditSuccess}
                    />
                )}
                {showSubmitModal && (
                    <BaselSubmitCandidateWizard
                        isOpen={showSubmitModal}
                        onClose={() => setShowSubmitModal(false)}
                        onSuccess={refresh}
                        preSelectedJob={{
                            id: job.id,
                            title: job.title,
                            company_id: job.company_id || "",
                            company_name: job.company?.name || undefined,
                            location: job.location,
                            fee_percentage: job.fee_percentage,
                            status: job.status,
                        }}
                    />
                )}
            </ModalPortal>
            {showPipelineModal && (
                <PipelineModal
                    isOpen={showPipelineModal}
                    roleId={job.id}
                    roleTitle={job.title || "Untitled Role"}
                    onClose={() => setShowPipelineModal(false)}
                />
            )}
        </>
    );

    /* ── Icon-Only Variant (SpeedDial) ── */

    if (variant === "icon-only") {
        const speedDialActions: SpeedDialAction[] = [];

        if (actions.submitCandidate) {
            speedDialActions.push({
                key: "submit",
                icon: "fa-duotone fa-regular fa-user-plus",
                label: "Submit Candidate",
                variant: "btn-primary",
                onClick: () => setShowSubmitModal(true),
            });
        }
        if (actions.edit) {
            speedDialActions.push({
                key: "edit",
                icon: "fa-duotone fa-regular fa-pen-to-square",
                label: "Edit Role",
                variant: "btn-ghost",
                onClick: () => setShowEditModal(true),
            });
        }
        if (actions.save) {
            speedDialActions.push({
                key: "save",
                icon: job.is_saved ? "fa-solid fa-bookmark" : "fa-regular fa-bookmark",
                label: job.is_saved ? "Unsave Role" : "Save Role",
                variant: job.is_saved ? "btn-warning" : "btn-ghost",
                loading: isSaving,
                disabled: isSaving,
                onClick: handleToggleSave,
            });
        }
        if (actions.share) {
            speedDialActions.push({
                key: "share",
                icon: "fa-duotone fa-regular fa-share-nodes",
                label: "Share Job",
                variant: "btn-ghost",
                loading: isSharing,
                onClick: handleShare,
            });
        }
        if (actions.statusActions) {
            if (isLiveStatus) {
                speedDialActions.push({
                    key: "status",
                    icon: "fa-duotone fa-regular fa-pause",
                    label: "Pause Role",
                    variant: "btn-secondary",
                    loading: updatingStatus && statusAction === "paused",
                    disabled: updatingStatus,
                    onClick: () => handleStatusChange("paused"),
                });
            } else if (job.status === "paused") {
                speedDialActions.push({
                    key: "status",
                    icon: "fa-duotone fa-regular fa-play",
                    label: "Activate Role",
                    variant: "btn-success",
                    loading: updatingStatus && statusAction === "active",
                    disabled: updatingStatus,
                    onClick: () => handleStatusChange("active"),
                });
            } else if (job.status === "draft") {
                speedDialActions.push({
                    key: "status",
                    icon: "fa-duotone fa-regular fa-play",
                    label: "Publish Role",
                    variant: "btn-success",
                    loading: updatingStatus && statusAction === "active",
                    disabled: updatingStatus,
                    onClick: () => handleStatusChange("active"),
                });
            }
        }
        if (actions.viewPipeline) {
            speedDialActions.push({
                key: "pipeline",
                icon: "fa-duotone fa-regular fa-users-line",
                label: "View Pipeline",
                variant: "btn-accent btn-soft",
                onClick: handleViewPipeline,
            });
        }
        if (actions.viewDetails) {
            speedDialActions.push({
                key: "details",
                icon: "fa-duotone fa-regular fa-eye",
                label: "View Details",
                variant: "btn-primary",
                onClick: onViewDetails ? handleViewDetails : undefined,
                href: !onViewDetails
                    ? `/portal/roles?roleId=${job.id}`
                    : undefined,
            });
        }

        return (
            <>
                <SpeedMenu
                    actions={speedDialActions}
                    size={size === "lg" ? "md" : (size ?? "sm")}
                    className={className}
                />
                {modals}
            </>
        );
    }

    /* ── Descriptive Variant ── */

    return (
        <>
            <div
                className={`flex flex-wrap items-center ${getLayoutClass()} ${className}`}
            >
                {actions.submitCandidate && (
                    <button
                        onClick={() => setShowSubmitModal(true)}
                        className={`btn ${getSizeClass()} btn-primary gap-2`}
                        style={{ borderRadius: 0 }}
                        title="Submit Candidate"
                    >
                        <i className="fa-duotone fa-regular fa-user-plus" />
                        <span className="hidden md:inline">
                            Submit Candidate
                        </span>
                    </button>
                )}
                {actions.edit && (
                    <button
                        onClick={() => setShowEditModal(true)}
                        className={`btn ${getSizeClass()} btn-secondary gap-2`}
                        style={{ borderRadius: 0 }}
                        title="Edit Role"
                    >
                        <i className="fa-duotone fa-regular fa-pen-to-square" />
                        <span className="hidden md:inline">Edit</span>
                    </button>
                )}
                {actions.save && (
                    <button
                        onClick={handleToggleSave}
                        className={`btn ${getSizeClass()} ${job.is_saved ? "btn-warning" : "btn-primary"} gap-2`}
                        style={{ borderRadius: 0 }}
                        title={job.is_saved ? "Unsave Role" : "Save Role"}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : (
                            <i className={job.is_saved ? "fa-solid fa-bookmark" : "fa-regular fa-bookmark"} />
                        )}
                        <span className="hidden md:inline">{job.is_saved ? "Saved" : "Save"}</span>
                    </button>
                )}
                {actions.share && (
                    <button
                        onClick={handleShare}
                        className={`btn ${getSizeClass()} btn-primary gap-2`}
                        style={{ borderRadius: 0 }}
                        title="Share Job"
                        disabled={isSharing}
                    >
                        {isSharing ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : (
                            <i className="fa-duotone fa-regular fa-share-nodes" />
                        )}
                        <span className="hidden md:inline">Share</span>
                    </button>
                )}
                {renderStatusDropdown()}
                {actions.viewPipeline &&
                    (actions.submitCandidate ||
                        actions.edit ||
                        actions.share ||
                        actions.statusActions) && (
                        <div className="hidden sm:block w-px self-stretch bg-neutral-content/20 mx-1" />
                    )}
                {actions.viewPipeline && (
                    <button
                        onClick={handleViewPipeline}
                        className={`btn ${getSizeClass()} btn-accent gap-2`}
                        style={{ borderRadius: 0 }}
                        title="View Pipeline"
                    >
                        <i className="fa-duotone fa-regular fa-users-line" />
                        <span className="hidden md:inline">Pipeline</span>
                    </button>
                )}
                {actions.viewDetails && (
                    <>
                        <div className="hidden sm:block w-px self-stretch bg-neutral-content/20 mx-1" />
                        {onViewDetails ? (
                            <button
                                onClick={handleViewDetails}
                                className={`btn ${getSizeClass()} btn-primary gap-2`}
                                style={{ borderRadius: 0 }}
                                title="View Details"
                            >
                                <i className="fa-duotone fa-regular fa-eye" />
                                <span className="hidden md:inline">
                                    View Details
                                </span>
                            </button>
                        ) : (
                            <Link
                                href={`/portal/roles?roleId=${job.id}`}
                                className={`btn ${getSizeClass()} btn-primary gap-2`}
                                style={{ borderRadius: 0 }}
                                title="View Details"
                            >
                                <i className="fa-duotone fa-regular fa-eye" />
                                <span className="hidden md:inline">
                                    View Details
                                </span>
                            </Link>
                        )}
                    </>
                )}
            </div>
            {modals}
        </>
    );
}
