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
    const { profile, isAdmin, isRecruiter, manageableCompanyIds } =
        useUserProfile();
    const refresh = onRefresh ?? (() => {});

    const [showEditModal, setShowEditModal] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showPipelineModal, setShowPipelineModal] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [statusAction, setStatusAction] = useState<string | null>(null);
    const [pendingStatus, setPendingStatus] = useState<"draft" | "pending" | "early" | "active" | "priority" | "paused" | "filled" | "closed" | null>(null);
    const [activatesAtInput, setActivatesAtInput] = useState("");

    /* ── Permissions ── */

    const canManageRole = useMemo(() => {
        if (isAdmin) return true;
        const isCompanyAdmin = profile?.roles?.includes("company_admin");
        if (isCompanyAdmin) return true;
        if (
            isRecruiter &&
            job.company_id &&
            manageableCompanyIds.includes(job.company_id)
        )
            return true;
        return false;
    }, [isAdmin, profile, isRecruiter, job.company_id, manageableCompanyIds]);

    const canSubmitCandidate = useMemo(
        () => isRecruiter || isAdmin,
        [isRecruiter, isAdmin],
    );

    /* ── Status Change ── */

    const handleStatusChange = (
        newStatus: "draft" | "pending" | "early" | "active" | "priority" | "paused" | "filled" | "closed",
    ) => {
        if (newStatus === "early") setActivatesAtInput("");
        setPendingStatus(newStatus);
    };

    const confirmStatusChange = async () => {
        if (!pendingStatus) return;
        const newStatus = pendingStatus;

        // Validate activates_at for early status
        if (newStatus === "early" && !activatesAtInput) {
            toast.error("An activation date is required for Early Access status");
            return;
        }

        setPendingStatus(null);
        setUpdatingStatus(true);
        setStatusAction(newStatus);
        try {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            const client = createAuthenticatedClient(token);
            const payload: Record<string, any> = { status: newStatus };
            if (newStatus === "early" && activatesAtInput) {
                payload.activates_at = new Date(activatesAtInput).toISOString();
            }
            await client.patch(`/jobs/${job.id}`, payload);
            toast.success(`Role status updated to ${newStatus}!`);
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

    /* ── Share ── */

    const handleShare = async () => {
        if (!job) return;
        setIsSharing(true);
        const candidateAppUrl =
            process.env.NEXT_PUBLIC_CANDIDATE_APP_URL ||
            "https://staging.applicant.network";
        const shareUrl = `${candidateAppUrl}/jobs/${job.id}`;
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
                toast.success("Job link copied to clipboard!");
            }
        } catch (error: any) {
            if (error.name !== "AbortError") {
                try {
                    await navigator.clipboard.writeText(clipboardText);
                    toast.success("Job link copied to clipboard!");
                } catch {
                    toast.error("Failed to share job link");
                }
            }
        } finally {
            setIsSharing(false);
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
    };

    const getSizeClass = () => `btn-${size}`;
    const getLayoutClass = () =>
        layout === "horizontal" ? "gap-1" : "flex-col gap-2";

    /* ── Quick Status Button (icon-only) ── */

    const isLiveStatus = ["early", "active", "priority"].includes(job.status);

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
        status: "draft" | "pending" | "early" | "active" | "priority" | "paused" | "filled" | "closed";
        label: string;
        icon: string;
        btnClass: string;
    };

    const statusItems = useMemo(() => {
        const items: StatusItem[] = [];

        if (job.status === "draft") {
            items.push({ key: "early", status: "early", label: "Publish (Early Access)", icon: "fa-duotone fa-regular fa-lock-open", btnClass: "text-accent" });
            items.push({ key: "active", status: "active", label: "Publish Live", icon: "fa-duotone fa-regular fa-play", btnClass: "text-success" });
            items.push({ key: "pending", status: "pending", label: "Submit for Approval", icon: "fa-duotone fa-regular fa-paper-plane", btnClass: "text-warning" });
        }
        if (job.status === "pending") {
            items.push({ key: "active", status: "active", label: "Activate", icon: "fa-duotone fa-regular fa-play", btnClass: "text-success" });
            items.push({ key: "paused", status: "paused", label: "Pause", icon: "fa-duotone fa-regular fa-pause", btnClass: "text-warning" });
        }
        if (job.status === "early") {
            items.push({ key: "active", status: "active", label: "Go Live", icon: "fa-duotone fa-regular fa-play", btnClass: "text-success" });
            items.push({ key: "priority", status: "priority", label: "Promote", icon: "fa-duotone fa-regular fa-star", btnClass: "text-primary" });
            items.push({ key: "paused", status: "paused", label: "Pause", icon: "fa-duotone fa-regular fa-pause", btnClass: "text-warning" });
        }
        if (job.status === "active") {
            items.push({ key: "priority", status: "priority", label: "Promote to Priority", icon: "fa-duotone fa-regular fa-star", btnClass: "text-primary" });
            items.push({ key: "paused", status: "paused", label: "Pause", icon: "fa-duotone fa-regular fa-pause", btnClass: "text-warning" });
        }
        if (job.status === "priority") {
            items.push({ key: "active", status: "active", label: "Demote to Active", icon: "fa-duotone fa-regular fa-arrow-down", btnClass: "text-success" });
            items.push({ key: "paused", status: "paused", label: "Pause", icon: "fa-duotone fa-regular fa-pause", btnClass: "text-warning" });
        }
        if (job.status === "paused") {
            items.push({ key: "active", status: "active", label: "Activate", icon: "fa-duotone fa-regular fa-play", btnClass: "text-success" });
            items.push({ key: "priority", status: "priority", label: "Promote", icon: "fa-duotone fa-regular fa-star", btnClass: "text-primary" });
        }
        if (job.status === "filled" || job.status === "closed") {
            items.push({ key: "active", status: "active", label: "Reopen", icon: "fa-duotone fa-regular fa-rotate-left", btnClass: "text-success" });
        }

        // Terminal options — always available unless already in that state
        if (job.status !== "filled" && !["draft", "pending"].includes(job.status)) {
            items.push({ key: "filled", status: "filled", label: "Mark Filled", icon: "fa-duotone fa-regular fa-check", btnClass: "text-info" });
        }
        if (job.status !== "closed") {
            items.push({ key: "closed", status: "closed", label: "Close", icon: "fa-duotone fa-regular fa-xmark", btnClass: "text-error" });
        }

        return items;
    }, [job.status]);

    const renderStatusDropdown = () => {
        if (!actions.statusActions || statusItems.length === 0) return null;
        return (
            <details ref={statusDropdownRef} className="dropdown dropdown-end">
                <summary
                    className={`btn ${getSizeClass()} btn-ghost gap-2 list-none`}
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
                                    handleStatusChange(item.status);
                                }}
                                className={`${item.btnClass} font-bold`}
                                disabled={updatingStatus}
                            >
                                {updatingStatus &&
                                statusAction === item.status ? (
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
                {pendingStatus === "early" && (
                    <fieldset className="fieldset mt-4">
                        <legend className="fieldset-legend">Activation Date</legend>
                        <input
                            type="datetime-local"
                            className="input input-bordered w-full"
                            value={activatesAtInput}
                            onChange={(e) => setActivatesAtInput(e.target.value)}
                            min={new Date().toISOString().slice(0, 16)}
                            required
                        />
                        <p className="label text-sm text-base-content/60">
                            The role will automatically go live on this date.
                        </p>
                    </fieldset>
                )}
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
                        className={`btn ${getSizeClass()} btn-ghost gap-2`}
                        style={{ borderRadius: 0 }}
                        title="Edit Role"
                    >
                        <i className="fa-duotone fa-regular fa-pen-to-square" />
                        <span className="hidden md:inline">Edit</span>
                    </button>
                )}
                {actions.share && (
                    <button
                        onClick={handleShare}
                        className={`btn ${getSizeClass()} btn-ghost gap-2`}
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
                        <div className="hidden sm:block w-px self-stretch bg-base-300 mx-1" />
                    )}
                {actions.viewPipeline && (
                    <button
                        onClick={handleViewPipeline}
                        className={`btn ${getSizeClass()} btn-outline gap-2`}
                        style={{ borderRadius: 0 }}
                        title="View Pipeline"
                    >
                        <i className="fa-duotone fa-regular fa-users-line" />
                        <span className="hidden md:inline">Pipeline</span>
                    </button>
                )}
                {actions.viewDetails && (
                    <>
                        <div className="hidden sm:block w-px self-stretch bg-base-300 mx-1" />
                        {onViewDetails ? (
                            <button
                                onClick={handleViewDetails}
                                className={`btn ${getSizeClass()} btn-outline gap-2`}
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
                                className={`btn ${getSizeClass()} btn-outline gap-2`}
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
