"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { useUserProfile } from "@/contexts";
import { ModalPortal } from "@splits-network/shared-ui";
import RoleWizardModal from "../modals/role-wizard-modal";
import SubmitCandidateModal from "../modals/submit-candidate-modal";
import PipelineModal from "../modals/pipeline-modal";
import type { Job } from "../../types";
import { Button, ExpandableButton } from "@splits-network/basel-ui";

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

    const handleStatusChange = async (
        newStatus: "active" | "paused" | "filled" | "closed",
    ) => {
        if (
            !confirm(
                `Are you sure you want to change the status to ${newStatus}?`,
            )
        )
            return;

        setUpdatingStatus(true);
        setStatusAction(newStatus);
        try {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            const client = createAuthenticatedClient(token);
            await client.patch(`/jobs/${job.id}`, { status: newStatus });
            toast.success(`Role status updated to ${newStatus}!`);
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
        const shareUrl = `${candidateAppUrl}/public/jobs/${job.id}`;
        const shareData = {
            title: `${job.title || "Job Opportunity"} at ${job.company?.name || "Company"}`,
            text: `Check out this job opportunity: ${job.title || "Job Opportunity"}${job.company?.name ? ` at ${job.company.name}` : ""}`,
            url: shareUrl,
        };
        try {
            if (
                navigator.share &&
                navigator.canShare &&
                navigator.canShare(shareData)
            ) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareUrl);
                toast.success("Job link copied to clipboard!");
            }
        } catch (error: any) {
            if (error.name !== "AbortError") {
                try {
                    await navigator.clipboard.writeText(shareUrl);
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

    const renderQuickStatusButton = () => {
        if (variant !== "icon-only" || !actions.statusActions) return null;
        if (job.status === "active") {
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

    const statusItems = useMemo(() => {
        const items: {
            key: string;
            status: "active" | "paused" | "filled" | "closed";
            label: string;
            icon: string;
            btnClass: string;
        }[] = [];
        if (job.status !== "active")
            items.push({
                key: "activate",
                status: "active",
                label: "Activate",
                icon: "fa-duotone fa-regular fa-play",
                btnClass: "text-success",
            });
        if (job.status === "active")
            items.push({
                key: "pause",
                status: "paused",
                label: "Pause",
                icon: "fa-duotone fa-regular fa-pause",
                btnClass: "text-warning",
            });
        if (job.status !== "filled")
            items.push({
                key: "filled",
                status: "filled",
                label: "Mark Filled",
                icon: "fa-duotone fa-regular fa-check",
                btnClass: "text-info",
            });
        if (job.status !== "closed")
            items.push({
                key: "closed",
                status: "closed",
                label: "Close",
                icon: "fa-duotone fa-regular fa-xmark",
                btnClass: "text-error",
            });
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
                    className="dropdown-content menu bg-base-100 border-2 border-base-300 shadow-md p-2 w-48 z-50 mt-1"
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
                    <SubmitCandidateModal
                        roleId={job.id}
                        roleTitle={job.title || "Untitled Role"}
                        companyName={
                            job.company?.name || job.company_id || undefined
                        }
                        onClose={() => setShowSubmitModal(false)}
                        onSuccess={refresh}
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

    /* ── Icon-Only Variant ── */

    if (variant === "icon-only") {
        return (
            <>
                <div
                    className={`flex items-center ${getLayoutClass()} ${className}`}
                >
                    {actions.submitCandidate && (
                        <Button
                            icon="fa-duotone fa-regular fa-user-plus"
                            variant="btn-primary btn-square"
                            size={size}
                            onClick={() => setShowSubmitModal(true)}
                            title="Submit Candidate"
                        ></Button>
                    )}
                    {actions.edit && (
                        <Button
                            icon="fa-duotone fa-regular fa-pen-to-square"
                            variant="btn-ghost btn-square"
                            size={size}
                            onClick={() => setShowEditModal(true)}
                            title="Edit Role"
                        ></Button>
                    )}
                    {actions.share && (
                        <Button
                            icon="fa-duotone fa-regular fa-share-nodes"
                            variant="btn-ghost btn-square"
                            size={size}
                            onClick={handleShare}
                            disabled={isSharing}
                            loading={isSharing}
                            title="Share Job"
                        ></Button>
                    )}
                    {renderQuickStatusButton()}
                    {actions.viewPipeline &&
                        (actions.submitCandidate ||
                            actions.edit ||
                            actions.share ||
                            actions.statusActions) && (
                            <div className="w-px h-4 bg-base-300 mx-0.5" />
                        )}
                    {actions.viewPipeline && (
                        <Button
                            icon="fa-duotone fa-regular fa-users-line"
                            variant="btn-accent btn-soft btn-square"
                            size={size}
                            onClick={handleViewPipeline}
                            title="View Pipeline"
                        ></Button>
                    )}
                    {actions.viewDetails && (
                        <>
                            <div className="w-px h-4 bg-base-300 mx-0.5" />
                            {onViewDetails ? (
                                <Button
                                    icon="fa-duotone fa-regular fa-eye"
                                    variant="btn-primary btn-square"
                                    size={size}
                                    onClick={handleViewDetails}
                                    title="View Details"
                                ></Button>
                            ) : (
                                <Button
                                    icon="fa-duotone fa-regular fa-eye"
                                    variant="btn-primary btn-square"
                                    size={size}
                                    href={`/portal/roles/${job.id}`}
                                    title="View Details"
                                />
                            )}
                        </>
                    )}
                </div>
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
                                href={`/portal/roles/${job.id}`}
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
