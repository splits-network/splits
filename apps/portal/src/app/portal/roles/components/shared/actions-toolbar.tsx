"use client";

import { useState, useMemo } from "react";
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
import { useBillingReadiness } from "../../hooks/billing-readiness-context";
import { useStatusActions } from "../../hooks/use-status-actions";
import { StatusDropdown } from "./status-dropdown";
import { StatusModals } from "./status-modals";
import {
    Button,
    SpeedMenu,
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
    const { profile, isAdmin, isRecruiter, isCompanyUser, hasPermissionForCompany, isFirmMember } =
        useUserProfile();
    const { isBillingReady } = useBillingReadiness();
    const billingReady = isBillingReady(job);
    const refresh = onRefresh ?? (() => {});

    const [showEditModal, setShowEditModal] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showPipelineModal, setShowPipelineModal] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const status = useStatusActions({ job, onRefresh, onUpdateItem });

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
        // Firm jobs: recruiter can manage if they belong to the owning firm
        if (isRecruiter && job.source_firm_id && isFirmMember(job.source_firm_id))
            return true;
        return false;
    }, [isAdmin, profile, isRecruiter, job.company_id, job.source_firm_id, hasPermissionForCompany, isFirmMember]);

    const canSubmitCandidate = useMemo(() => {
        if (isAdmin) return true;
        if (isCompanyUser) return true;
        if (!isRecruiter) return false;
        if (!job.company_id) return true;
        return hasPermissionForCompany(job.company_id, "can_submit_candidates");
    }, [isRecruiter, isCompanyUser, isAdmin, job.company_id, hasPermissionForCompany]);

    /* ── Share ── */

    const handleShare = async () => {
        if (!job) return;
        setIsSharing(true);
        const candidateAppUrl =
            process.env.NEXT_PUBLIC_CANDIDATE_APP_URL ||
            "https://staging.applicant.network";

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
                await client.delete(`/recruiter-saved-jobs/${job.saved_record_id}`);
                onUpdateItem?.(job.id, { is_saved: false, saved_record_id: null });
                toast.info("Role removed from saved.");
            } else {
                const res = await client.post("/recruiter-saved-jobs", { job_id: job.id });
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

    const isLiveStatus = job.status === "active";

    /* ── Modals ── */

    const modals = (
        <>
            <StatusModals
                pendingStatus={status.pendingStatus}
                pendingEarlyAccess={status.pendingEarlyAccess}
                activatesAtInput={status.activatesAtInput}
                onActivatesAtChange={status.setActivatesAtInput}
                onConfirmStatus={status.confirmStatusChange}
                onCancelStatus={status.cancelStatusChange}
                onConfirmEarlyAccess={status.confirmEarlyAccess}
                onCancelEarlyAccess={status.cancelEarlyAccess}
            />
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
                    loading: status.updatingStatus && status.statusAction === "paused",
                    disabled: status.updatingStatus,
                    onClick: () => status.handleStatusChange("paused"),
                });
            } else if (job.status === "paused" && billingReady) {
                speedDialActions.push({
                    key: "status",
                    icon: "fa-duotone fa-regular fa-play",
                    label: "Activate Role",
                    variant: "btn-success",
                    loading: status.updatingStatus && status.statusAction === "active",
                    disabled: status.updatingStatus,
                    onClick: () => status.handleStatusChange("active"),
                });
            } else if (job.status === "draft" && billingReady) {
                speedDialActions.push({
                    key: "status",
                    icon: "fa-duotone fa-regular fa-play",
                    label: "Publish Role",
                    variant: "btn-success",
                    loading: status.updatingStatus && status.statusAction === "active",
                    disabled: status.updatingStatus,
                    onClick: () => status.handleStatusChange("active"),
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
                {actions.statusActions && (
                    <StatusDropdown
                        job={job}
                        billingReady={billingReady}
                        size={size}
                        updatingStatus={status.updatingStatus}
                        statusAction={status.statusAction}
                        onStatusChange={status.handleStatusChange}
                        onToggleEarlyAccess={status.handleToggleEarlyAccess}
                        onTogglePriority={status.handleTogglePriority}
                    />
                )}
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
