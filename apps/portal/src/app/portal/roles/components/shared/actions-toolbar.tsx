"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { useUserProfile } from "@/contexts";
import { ButtonLoading } from "@splits-network/shared-ui";
import RoleWizardModal from "../modals/role-wizard-modal";
import SubmitCandidateWizard from "../wizards/submit-candidate-wizard";

// ===== TYPES =====

export interface Job {
    id: string;
    title: string | null;
    company_id: string | null;
    company?: {
        name: string | null;
        identity_organization_id?: string | null;
        [key: string]: any;
    };
    status: "active" | "paused" | "filled" | "closed" | string | null;
    [key: string]: any;
}

export interface RoleActionsToolbarProps {
    job: Job;
    variant: "icon-only" | "descriptive";
    layout?: "horizontal" | "vertical";
    size?: "xs" | "sm" | "md";
    showActions?: {
        viewDetails?: boolean;
        viewPipeline?: boolean; // NEW: Show pipeline button
        submitCandidate?: boolean;
        edit?: boolean;
        statusActions?: boolean;
        share?: boolean; // NEW: Share job button
    };
    onRefresh?: () => void;
    onViewDetails?: (jobId: string) => void;
    onViewPipeline?: (jobId: string) => void; // NEW: Pipeline callback
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
    const { profile, isAdmin, isRecruiter } = useUserProfile();

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
        if (!isCompanyAdmin) return false;

        // TODO: Enhance with strict org matching
        // For now, allow company_admin to manage all roles
        // Future: Verify job.company.identity_organization_id matches profile.organization_ids
        return true;
    }, [isAdmin, profile]);

    const canSubmitCandidate = useMemo(() => {
        return isRecruiter || isAdmin;
    }, [isRecruiter, isAdmin]);

    // ===== STATUS CHANGE HANDLER =====

    const handleStatusChange = async (
        newStatus: "active" | "paused" | "filled" | "closed",
    ) => {
        const confirmMessage = `Are you sure you want to change the status to ${newStatus}?`;
        if (!confirm(confirmMessage)) {
            return;
        }

        setUpdatingStatus(true);
        setStatusAction(newStatus);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error("No auth token");
            }

            const client = createAuthenticatedClient(token);
            await client.patch(`/jobs/${job.id}`, { status: newStatus });

            toast.success(`Role status updated to ${newStatus}!`);

            if (onRefresh) {
                onRefresh();
            }
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
            // Check if native Web Share API is available
            if (
                navigator.share &&
                navigator.canShare &&
                navigator.canShare(shareData)
            ) {
                await navigator.share(shareData);
            } else {
                // Fallback: Copy to clipboard
                await navigator.clipboard.writeText(shareUrl);
                toast.success("Job link copied to clipboard!");
            }
        } catch (error: any) {
            if (error.name !== "AbortError") {
                // Fallback on any error except user cancellation
                try {
                    await navigator.clipboard.writeText(shareUrl);
                    toast.success("Job link copied to clipboard!");
                } catch (clipboardError) {
                    toast.error("Failed to share job link");
                }
            }
        } finally {
            setIsSharing(false);
        }
    };

    // ===== ACTION HANDLERS =====

    const handleViewDetails = () => {
        if (onViewDetails) {
            onViewDetails(job.id);
        }
        // If no callback, Link component handles navigation
    };

    const handleViewPipeline = () => {
        if (onViewPipeline) {
            onViewPipeline(job.id);
        }
    };

    const handleEditClick = () => {
        setShowEditModal(true);
    };

    const handleSubmitClick = () => {
        setShowSubmitModal(true);
    };

    const handleEditSuccess = () => {
        setShowEditModal(false);
        if (onRefresh) {
            onRefresh();
        }
    };

    // ===== ACTION VISIBILITY =====

    const actions = {
        viewDetails: showActions.viewDetails !== false,
        viewPipeline: showActions.viewPipeline === true, // Only show if explicitly enabled
        submitCandidate:
            showActions.submitCandidate !== false && canSubmitCandidate,
        edit: showActions.edit !== false && canManageRole,
        statusActions: showActions.statusActions !== false && canManageRole,
        share: showActions.share !== false, // Default enabled
    };

    // ===== RENDER HELPERS =====

    const getSizeClass = () => {
        return `btn-${size}`;
    };

    const getLayoutClass = () => {
        return layout === "horizontal" ? "gap-1" : "flex-col gap-2";
    };

    // Quick status action for icon-only variant
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
                        <span className="loading loading-spinner loading-xs"></span>
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
                        <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                        <i className="fa-duotone fa-regular fa-play" />
                    )}
                </button>
            );
        }

        return null;
    };

    // Status buttons for descriptive variant
    const renderStatusButtons = () => {
        if (variant !== "descriptive" || !actions.statusActions) return null;

        const buttons = [];
        const isLoading = updatingStatus && statusAction;

        // Activate button (if not active)
        if (job.status !== "active") {
            buttons.push(
                <button
                    key="activate"
                    onClick={() => handleStatusChange("active")}
                    className={`btn ${getSizeClass()} btn-success gap-2`}
                    disabled={updatingStatus}
                >
                    {isLoading && statusAction === "active" ? (
                        <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                        <i className="fa-duotone fa-regular fa-play"></i>
                    )}
                    Activate
                </button>,
            );
        }

        // Pause button (if active)
        if (job.status === "active") {
            buttons.push(
                <button
                    key="pause"
                    onClick={() => handleStatusChange("paused")}
                    className={`btn ${getSizeClass()} btn-warning gap-2`}
                    disabled={updatingStatus}
                >
                    {isLoading && statusAction === "paused" ? (
                        <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                        <i className="fa-duotone fa-regular fa-pause"></i>
                    )}
                    Pause
                </button>,
            );
        }

        // Mark as Filled button (if not filled)
        if (job.status !== "filled") {
            buttons.push(
                <button
                    key="filled"
                    onClick={() => handleStatusChange("filled")}
                    className={`btn ${getSizeClass()} btn-info gap-2`}
                    disabled={updatingStatus}
                >
                    {isLoading && statusAction === "filled" ? (
                        <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                        <i className="fa-duotone fa-regular fa-check"></i>
                    )}
                    Mark Filled
                </button>,
            );
        }

        // Close button (if not closed)
        if (job.status !== "closed") {
            buttons.push(
                <button
                    key="closed"
                    onClick={() => handleStatusChange("closed")}
                    className={`btn ${getSizeClass()} btn-error gap-2`}
                    disabled={updatingStatus}
                >
                    {isLoading && statusAction === "closed" ? (
                        <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                        <i className="fa-duotone fa-regular fa-xmark"></i>
                    )}
                    Close
                </button>,
            );
        }

        return <>{buttons}</>;
    };

    // ===== RENDER VARIANTS =====

    if (variant === "icon-only") {
        return (
            <>
                <div className={`flex ${getLayoutClass()} ${className}`}>
                    {/* View Details */}
                    {actions.viewDetails && (
                        <>
                            {onViewDetails ? (
                                <button
                                    onClick={handleViewDetails}
                                    className={`btn ${getSizeClass()} btn-square btn-ghost`}
                                    title="View Details"
                                >
                                    <i className="fa-duotone fa-regular fa-eye" />
                                </button>
                            ) : (
                                <Link
                                    href={`/portal/roles/${job.id}`}
                                    className={`btn ${getSizeClass()} btn-square btn-ghost`}
                                    title="View Details"
                                >
                                    <i className="fa-duotone fa-regular fa-eye" />
                                </Link>
                            )}
                        </>
                    )}

                    {/* View Pipeline */}
                    {actions.viewPipeline && (
                        <button
                            onClick={handleViewPipeline}
                            className={`btn ${getSizeClass()} btn-square btn-ghost`}
                            title="View Pipeline"
                        >
                            <i className="fa-duotone fa-regular fa-users-line" />
                        </button>
                    )}

                    {/* Submit Candidate */}
                    {actions.submitCandidate && (
                        <button
                            onClick={handleSubmitClick}
                            className={`btn ${getSizeClass()} btn-square btn-primary`}
                            title="Submit Candidate"
                        >
                            <i className="fa-duotone fa-regular fa-user-plus" />
                        </button>
                    )}

                    {/* Share Job */}
                    {actions.share && (
                        <button
                            onClick={handleShare}
                            className={`btn ${getSizeClass()} btn-square btn-ghost`}
                            title="Share Job"
                            disabled={isSharing}
                        >
                            {isSharing ? (
                                <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                                <i className="fa-duotone fa-regular fa-share-nodes" />
                            )}
                        </button>
                    )}

                    {/* Edit Role */}
                    {actions.edit && (
                        <button
                            onClick={handleEditClick}
                            className={`btn ${getSizeClass()} btn-square btn-ghost`}
                            title="Edit Role"
                        >
                            <i className="fa-duotone fa-regular fa-pen-to-square" />
                        </button>
                    )}

                    {/* Quick Status Action */}
                    {renderQuickStatusButton()}
                </div>

                {/* Modals */}
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
                    />
                )}
            </>
        );
    }

    // Descriptive variant
    return (
        <>
            <div className={`flex ${getLayoutClass()} ${className}`}>
                {/* View Details */}
                {actions.viewDetails && (
                    <>
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

                {/* View Pipeline */}
                {actions.viewPipeline && (
                    <button
                        onClick={handleViewPipeline}
                        className={`btn ${getSizeClass()} btn-outline gap-2`}
                    >
                        <i className="fa-duotone fa-regular fa-users-line" />
                        View Pipeline
                    </button>
                )}

                {/* Submit Candidate */}
                {actions.submitCandidate && (
                    <button
                        onClick={handleSubmitClick}
                        className={`btn ${getSizeClass()} btn-primary gap-2`}
                    >
                        <i className="fa-duotone fa-regular fa-user-plus" />
                        Submit Candidate
                    </button>
                )}

                {/* Share Job */}
                {actions.share && (
                    <button
                        onClick={handleShare}
                        className={`btn ${getSizeClass()} btn-outline gap-2`}
                        disabled={isSharing}
                    >
                        {isSharing ? (
                            <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                            <i className="fa-duotone fa-regular fa-share-nodes" />
                        )}
                        Share Job
                    </button>
                )}

                {/* Edit Role */}
                {actions.edit && (
                    <button
                        onClick={handleEditClick}
                        className={`btn ${getSizeClass()} btn-ghost gap-2`}
                    >
                        <i className="fa-duotone fa-regular fa-pen-to-square" />
                        Edit Role
                    </button>
                )}

                {/* Status Action Buttons */}
                {renderStatusButtons()}
            </div>

            {/* Modals */}
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
                />
            )}
        </>
    );
}
