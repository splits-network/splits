"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { useUserProfile } from "@/contexts";
import { ModalPortal } from "@splits-network/shared-ui";
import RoleWizardModal from "@/app/portal/roles/components/modals/role-wizard-modal";
import SubmitCandidateWizard from "@/app/portal/roles/components/wizards/submit-candidate-wizard";
import type { Job } from "../../roles/types";

// ===== TYPES =====

export interface RoleActionsToolbarProps {
    job: Job;
    variant: "icon-only" | "descriptive";
    layout?: "horizontal" | "vertical";
    size?: "xs" | "sm" | "md";
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

        const isLoading = updatingStatus && statusAction;

        if (job.status === "active") {
            return (
                <button
                    onClick={() => handleStatusChange("paused")}
                    className={`btn ${getSizeClass()} btn-square btn-warning`}
                    title="Pause Role"
                    disabled={updatingStatus}
                >
                    {isLoading && statusAction === "paused" ? (
                        <span className="loading loading-spinner loading-xs" />
                    ) : (
                        <i className="fa-duotone fa-regular fa-pause" />
                    )}
                </button>
            );
        }

        if (job.status === "paused") {
            return (
                <button
                    onClick={() => handleStatusChange("active")}
                    className={`btn ${getSizeClass()} btn-square btn-success`}
                    title="Activate Role"
                    disabled={updatingStatus}
                >
                    {isLoading && statusAction === "active" ? (
                        <span className="loading loading-spinner loading-xs" />
                    ) : (
                        <i className="fa-duotone fa-regular fa-play" />
                    )}
                </button>
            );
        }

        return null;
    };

    const renderStatusButtons = () => {
        if (variant !== "descriptive" || !actions.statusActions) return null;

        const buttons = [];
        const isLoading = updatingStatus && statusAction;

        if (job.status !== "active") {
            buttons.push(
                <button
                    key="activate"
                    onClick={() => handleStatusChange("active")}
                    className={`btn ${getSizeClass()} btn-success gap-2`}
                    disabled={updatingStatus}
                >
                    {isLoading && statusAction === "active" ? (
                        <span className="loading loading-spinner loading-xs" />
                    ) : (
                        <i className="fa-duotone fa-regular fa-play" />
                    )}
                    Activate
                </button>,
            );
        }

        if (job.status === "active") {
            buttons.push(
                <button
                    key="pause"
                    onClick={() => handleStatusChange("paused")}
                    className={`btn ${getSizeClass()} btn-warning gap-2`}
                    disabled={updatingStatus}
                >
                    {isLoading && statusAction === "paused" ? (
                        <span className="loading loading-spinner loading-xs" />
                    ) : (
                        <i className="fa-duotone fa-regular fa-pause" />
                    )}
                    Pause
                </button>,
            );
        }

        if (job.status !== "filled") {
            buttons.push(
                <button
                    key="filled"
                    onClick={() => handleStatusChange("filled")}
                    className={`btn ${getSizeClass()} btn-info gap-2`}
                    disabled={updatingStatus}
                >
                    {isLoading && statusAction === "filled" ? (
                        <span className="loading loading-spinner loading-xs" />
                    ) : (
                        <i className="fa-duotone fa-regular fa-check" />
                    )}
                    Mark Filled
                </button>,
            );
        }

        if (job.status !== "closed") {
            buttons.push(
                <button
                    key="closed"
                    onClick={() => handleStatusChange("closed")}
                    className={`btn ${getSizeClass()} btn-error gap-2`}
                    disabled={updatingStatus}
                >
                    {isLoading && statusAction === "closed" ? (
                        <span className="loading loading-spinner loading-xs" />
                    ) : (
                        <i className="fa-duotone fa-regular fa-xmark" />
                    )}
                    Close
                </button>,
            );
        }

        return <>{buttons}</>;
    };

    // ===== RENDER =====

    if (variant === "icon-only") {
        return (
            <>
                <div className={`flex ${getLayoutClass()} ${className}`}>
                    {actions.submitCandidate && (
                        <button
                            onClick={() => setShowSubmitModal(true)}
                            className={`btn ${getSizeClass()} btn-square btn-primary`}
                            title="Submit Candidate"
                        >
                            <i className="fa-duotone fa-regular fa-user-plus" />
                        </button>
                    )}

                    {actions.edit && (
                        <button
                            onClick={() => setShowEditModal(true)}
                            className={`btn ${getSizeClass()} btn-square btn-ghost`}
                            title="Edit Role"
                        >
                            <i className="fa-duotone fa-regular fa-pen-to-square" />
                        </button>
                    )}

                    {actions.share && (
                        <button
                            onClick={handleShare}
                            className={`btn ${getSizeClass()} btn-square btn-ghost`}
                            title="Share Job"
                            disabled={isSharing}
                        >
                            {isSharing ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                <i className="fa-duotone fa-regular fa-share-nodes" />
                            )}
                        </button>
                    )}

                    {renderQuickStatusButton()}

                    {actions.viewPipeline &&
                        (actions.submitCandidate || actions.edit || actions.share || actions.statusActions) && (
                            <div className="w-px h-4 bg-base-300 mx-0.5" />
                        )}

                    {actions.viewPipeline && (
                        <button
                            onClick={handleViewPipeline}
                            className={`btn ${getSizeClass()} btn-square btn-ghost`}
                            title="View Pipeline"
                        >
                            <i className="fa-duotone fa-regular fa-users-line" />
                        </button>
                    )}

                    {actions.viewDetails && (
                        <>
                            <div className="w-px h-4 bg-base-300 mx-0.5" />
                            {onViewDetails ? (
                                <button
                                    onClick={handleViewDetails}
                                    className={`btn ${getSizeClass()} btn-square btn-primary`}
                                    title="View Details"
                                >
                                    <i className="fa-duotone fa-regular fa-eye" />
                                </button>
                            ) : (
                                <Link
                                    href={`/portal/roles/${job.id}`}
                                    className={`btn ${getSizeClass()} btn-square btn-primary`}
                                    title="View Details"
                                >
                                    <i className="fa-duotone fa-regular fa-eye" />
                                </Link>
                            )}
                        </>
                    )}
                </div>

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
                        <SubmitCandidateWizard
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
            </>
        );
    }

    // Descriptive variant
    return (
        <>
            <div className={`flex ${getLayoutClass()} ${className}`}>
                {actions.submitCandidate && (
                    <button
                        onClick={() => setShowSubmitModal(true)}
                        className={`btn ${getSizeClass()} btn-primary gap-2`}
                    >
                        <i className="fa-duotone fa-regular fa-user-plus" />
                        Submit Candidate
                    </button>
                )}

                {actions.edit && (
                    <button
                        onClick={() => setShowEditModal(true)}
                        className={`btn ${getSizeClass()} btn-ghost gap-2`}
                    >
                        <i className="fa-duotone fa-regular fa-pen-to-square" />
                        Edit
                    </button>
                )}

                {actions.share && (
                    <button
                        onClick={handleShare}
                        className={`btn ${getSizeClass()} btn-circle gap-2`}
                        disabled={isSharing}
                    >
                        {isSharing ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : (
                            <i className="fa-duotone fa-regular fa-share-nodes" />
                        )}
                    </button>
                )}

                {renderStatusButtons()}

                {actions.viewPipeline &&
                    (actions.submitCandidate || actions.edit || actions.share || actions.statusActions) && (
                        <div className="divider divider-horizontal mx-0" />
                    )}

                {actions.viewPipeline && (
                    <button
                        onClick={handleViewPipeline}
                        className={`btn ${getSizeClass()} btn-outline gap-2`}
                    >
                        <i className="fa-duotone fa-regular fa-users-line" />
                        Pipeline
                    </button>
                )}

                {actions.viewDetails && (
                    <>
                        <div className="divider divider-horizontal mx-0" />
                        {onViewDetails ? (
                            <button
                                onClick={handleViewDetails}
                                className={`btn ${getSizeClass()} btn-outline gap-2`}
                            >
                                <i className="fa-duotone fa-regular fa-eye" />
                                View Details
                            </button>
                        ) : (
                            <Link
                                href={`/portal/roles/${job.id}`}
                                className={`btn ${getSizeClass()} btn-outline gap-2`}
                            >
                                <i className="fa-duotone fa-regular fa-eye" />
                                View Details
                            </Link>
                        )}
                    </>
                )}
            </div>

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
                    <SubmitCandidateWizard
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
        </>
    );
}
