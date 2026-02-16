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
import type { Job } from "../../types";
import { ExpandableButton } from "./expandable-button";

// ===== TYPES =====

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

// ===== COMPONENT =====

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

    // Modal states
    const [showEditModal, setShowEditModal] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);

    // Loading states
    const [isSharing, setIsSharing] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [statusAction, setStatusAction] = useState<string | null>(null);

    // ===== PERMISSION LOGIC =====

    const canManageRole = useMemo(() => {
        if (isAdmin) return true;
        const isCompanyAdmin = profile?.roles?.includes("company_admin");
        if (isCompanyAdmin) return true;
        if (
            isRecruiter &&
            job.company_id &&
            manageableCompanyIds.includes(job.company_id)
        ) {
            return true;
        }
        return false;
    }, [isAdmin, profile, isRecruiter, job.company_id, manageableCompanyIds]);

    const canSubmitCandidate = useMemo(() => {
        return isRecruiter || isAdmin;
    }, [isRecruiter, isAdmin]);

    // ===== STATUS CHANGE HANDLER =====

    const handleStatusChange = async (
        newStatus: "active" | "paused" | "filled" | "closed",
    ) => {
        const confirmMessage = `Are you sure you want to change the status to ${newStatus}?`;
        if (!confirm(confirmMessage)) return;

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

    // ===== SHARE HANDLER =====

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

    // ===== ACTION HANDLERS =====

    const handleViewDetails = () => {
        if (onViewDetails) onViewDetails(job.id);
    };

    const handleViewPipeline = () => {
        if (onViewPipeline) onViewPipeline(job.id);
    };

    const handleEditSuccess = () => {
        setShowEditModal(false);
        refresh();
    };

    // ===== ACTION VISIBILITY =====

    const actions = {
        viewDetails: showActions.viewDetails !== false,
        viewPipeline: showActions.viewPipeline === true,
        submitCandidate:
            showActions.submitCandidate !== false && canSubmitCandidate,
        edit: showActions.edit !== false && canManageRole,
        statusActions: showActions.statusActions !== false && canManageRole,
        share: showActions.share !== false,
    };

    // ===== RENDER HELPERS =====

    const getSizeClass = () => `btn-${size}`;

    const getLayoutClass = () =>
        layout === "horizontal" ? "gap-1" : "flex-col gap-2";

    const renderQuickStatusButton = () => {
        if (variant !== "icon-only" || !actions.statusActions) return null;

        if (job.status === "active") {
            return (
                <ExpandableButton
                    icon="fa-duotone fa-regular fa-pause"
                    label="Pause"
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
                <ExpandableButton
                    icon="fa-duotone fa-regular fa-play"
                    label="Activate"
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

    // ===== STATUS DROPDOWN =====

    const statusDropdownRef = useRef<HTMLDetailsElement>(null);

    // Close dropdown on outside click
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

        if (job.status !== "active") {
            items.push({
                key: "activate",
                status: "active",
                label: "Activate",
                icon: "fa-duotone fa-regular fa-play",
                btnClass: "text-success",
            });
        }
        if (job.status === "active") {
            items.push({
                key: "pause",
                status: "paused",
                label: "Pause",
                icon: "fa-duotone fa-regular fa-pause",
                btnClass: "text-warning",
            });
        }
        if (job.status !== "filled") {
            items.push({
                key: "filled",
                status: "filled",
                label: "Mark Filled",
                icon: "fa-duotone fa-regular fa-check",
                btnClass: "text-info",
            });
        }
        if (job.status !== "closed") {
            items.push({
                key: "closed",
                status: "closed",
                label: "Close",
                icon: "fa-duotone fa-regular fa-xmark",
                btnClass: "text-error",
            });
        }
        return items;
    }, [job.status]);

    const renderStatusDropdown = () => {
        if (!actions.statusActions || statusItems.length === 0) return null;

        return (
            <details ref={statusDropdownRef} className="dropdown dropdown-end">
                <summary
                    className={`btn ${getSizeClass()} btn-ghost gap-2 list-none`}
                    title="Change Status"
                >
                    {updatingStatus ? (
                        <span className="loading loading-spinner loading-xs" />
                    ) : (
                        <i className="fa-duotone fa-regular fa-ellipsis-vertical" />
                    )}
                    <span className="hidden md:inline">Status</span>
                </summary>
                <ul className="dropdown-content menu bg-white border-4 border-dark p-2 w-48 z-50 mt-1">
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

    // ===== MODALS (shared between both variants) =====

    const modals = (
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
    );

    // ===== ICON-ONLY VARIANT =====

    if (variant === "icon-only") {
        return (
            <>
                <div
                    className={`flex items-center ${getLayoutClass()} ${className}`}
                >
                    {actions.submitCandidate && (
                        <ExpandableButton
                            icon="fa-duotone fa-regular fa-user-plus"
                            label="Submit"
                            variant="btn-primary"
                            size={size}
                            onClick={() => setShowSubmitModal(true)}
                            title="Submit Candidate"
                        />
                    )}

                    {actions.edit && (
                        <ExpandableButton
                            icon="fa-duotone fa-regular fa-pen-to-square"
                            label="Edit"
                            variant="btn-ghost"
                            size={size}
                            onClick={() => setShowEditModal(true)}
                            title="Edit Role"
                        />
                    )}

                    {actions.share && (
                        <ExpandableButton
                            icon="fa-duotone fa-regular fa-share-nodes"
                            label="Share"
                            variant="btn-ghost"
                            size={size}
                            onClick={handleShare}
                            disabled={isSharing}
                            loading={isSharing}
                            title="Share Job"
                        />
                    )}

                    {renderQuickStatusButton()}

                    {actions.viewPipeline &&
                        (actions.submitCandidate ||
                            actions.edit ||
                            actions.share ||
                            actions.statusActions) && (
                            <div className="w-px h-4 bg-dark/20 mx-0.5" />
                        )}

                    {actions.viewPipeline && (
                        <ExpandableButton
                            icon="fa-duotone fa-regular fa-users-line"
                            label="Pipeline"
                            variant="btn-ghost"
                            size={size}
                            onClick={handleViewPipeline}
                            title="View Pipeline"
                        />
                    )}

                    {actions.viewDetails && (
                        <>
                            <div className="w-px h-4 bg-dark/20 mx-0.5" />
                            {onViewDetails ? (
                                <ExpandableButton
                                    icon="fa-duotone fa-regular fa-eye"
                                    label="Details"
                                    variant="btn-primary"
                                    size={size}
                                    onClick={handleViewDetails}
                                    title="View Details"
                                />
                            ) : (
                                <ExpandableButton
                                    icon="fa-duotone fa-regular fa-eye"
                                    label="Details"
                                    variant="btn-primary"
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

    // ===== DESCRIPTIVE VARIANT =====

    return (
        <>
            <div
                className={`flex flex-wrap items-center ${getLayoutClass()} ${className}`}
            >
                {actions.submitCandidate && (
                    <button
                        onClick={() => setShowSubmitModal(true)}
                        className={`btn ${getSizeClass()} btn-primary gap-2`}
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
                        <div className="hidden sm:block w-px self-stretch bg-dark/20 mx-1" />
                    )}

                {actions.viewPipeline && (
                    <button
                        onClick={handleViewPipeline}
                        className={`btn ${getSizeClass()} btn-outline gap-2`}
                        title="View Pipeline"
                    >
                        <i className="fa-duotone fa-regular fa-users-line" />
                        <span className="hidden md:inline">Pipeline</span>
                    </button>
                )}

                {actions.viewDetails && (
                    <>
                        <div className="hidden sm:block w-px self-stretch bg-dark/20 mx-1" />
                        {onViewDetails ? (
                            <button
                                onClick={handleViewDetails}
                                className={`btn ${getSizeClass()} btn-outline gap-2`}
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
