"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { useUserProfile } from "@/contexts";
import type { Placement } from "../../types";

export interface ActionsToolbarProps {
    placement: Placement;
    variant: "icon-only" | "descriptive";
    layout?: "horizontal" | "vertical";
    size?: "xs" | "sm" | "md";
    showActions?: {
        viewDetails?: boolean;
        viewJob?: boolean;
        viewCandidate?: boolean;
        viewApplication?: boolean;
        viewCompany?: boolean;
        statusActions?: boolean;
    };
    onViewDetails?: (placementId: string) => void;
    onRefresh?: () => void;
    className?: string;
}

export default function ActionsToolbar({
    placement,
    variant,
    layout = "horizontal",
    size = "sm",
    showActions = {},
    onViewDetails,
    onRefresh,
    className = "",
}: ActionsToolbarProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const { profile, isAdmin } = useUserProfile();

    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [statusAction, setStatusAction] = useState<string | null>(null);

    // Permission logic
    const canManagePlacement = useMemo(() => {
        if (isAdmin) return true;

        const isCompanyAdmin = profile?.roles?.includes("company_admin");
        if (!isCompanyAdmin) return false;

        const jobOrgId = placement.job?.company?.identity_organization_id;
        const userOrgIds = profile?.organization_ids || [];
        return jobOrgId ? userOrgIds.includes(jobOrgId) : false;
    }, [isAdmin, profile, placement]);

    // Status change handler
    const handleStatusChange = async (
        newStatus: "active" | "completed" | "failed",
    ) => {
        let confirmMessage = `Are you sure you want to mark this placement as ${newStatus}?`;
        if (newStatus === "failed") {
            confirmMessage =
                "Are you sure you want to mark this placement as failed? This may affect billing.";
        }
        if (!confirm(confirmMessage)) return;

        setUpdatingStatus(true);
        setStatusAction(newStatus);

        try {
            const token = await getToken();
            if (!token) throw new Error("No auth token");

            const client = createAuthenticatedClient(token);
            await client.patch(`/placements/${placement.id}`, {
                status: newStatus,
            });

            toast.success(`Placement status updated to ${newStatus}!`);
            onRefresh?.();
        } catch (error: any) {
            console.error("Failed to update status:", error);
            toast.error(`Failed to update status: ${error.message}`);
        } finally {
            setUpdatingStatus(false);
            setStatusAction(null);
        }
    };

    // Action visibility
    const actions = {
        viewDetails: showActions.viewDetails !== false,
        viewJob: showActions.viewJob !== false && placement.job_id,
        viewCandidate:
            showActions.viewCandidate !== false && placement.candidate_id,
        viewApplication:
            showActions.viewApplication !== false && placement.application_id,
        viewCompany:
            showActions.viewCompany !== false && placement.company_id,
        statusActions:
            showActions.statusActions !== false && canManagePlacement,
    };

    const sizeClass = `btn-${size}`;
    const layoutClass =
        layout === "horizontal" ? "gap-1" : "flex-col gap-2";
    const isNonTerminal =
        placement.state === "hired" || placement.state === "active";
    const isLoading = updatingStatus && statusAction;

    // Icon-only variant
    if (variant === "icon-only") {
        return (
            <div className={`flex items-center ${layoutClass} ${className}`}>
                {/* Mark Completed - CTA */}
                {actions.statusActions &&
                    isNonTerminal &&
                    placement.state === "active" && (
                        <button
                            onClick={() => handleStatusChange("completed")}
                            className={`btn ${sizeClass} btn-square btn-success`}
                            title="Mark Completed"
                            disabled={updatingStatus}
                        >
                            {isLoading && statusAction === "completed" ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                <i className="fa-duotone fa-regular fa-check" />
                            )}
                        </button>
                    )}
                {actions.viewJob && (
                    <Link
                        href={`/portal/roles/${placement.job_id}`}
                        className={`btn ${sizeClass} btn-square btn-ghost`}
                        title="View Job"
                    >
                        <i className="fa-duotone fa-regular fa-briefcase" />
                    </Link>
                )}
                {actions.viewCandidate && (
                    <Link
                        href={`/portal/candidates/${placement.candidate_id}`}
                        className={`btn ${sizeClass} btn-square btn-ghost`}
                        title="View Candidate"
                    >
                        <i className="fa-duotone fa-regular fa-user" />
                    </Link>
                )}
                {actions.viewApplication && (
                    <Link
                        href={`/portal/applications/${placement.application_id}`}
                        className={`btn ${sizeClass} btn-square btn-ghost`}
                        title="View Application"
                    >
                        <i className="fa-duotone fa-regular fa-file-lines" />
                    </Link>
                )}
                {actions.viewCompany && (
                    <Link
                        href={`/portal/companies/${placement.company_id}`}
                        className={`btn ${sizeClass} btn-square btn-ghost`}
                        title="View Company"
                    >
                        <i className="fa-duotone fa-regular fa-building" />
                    </Link>
                )}
                {/* View Details - far right */}
                {actions.viewDetails && onViewDetails && (
                    <>
                        <div className="w-px h-4 bg-base-300 mx-0.5" />
                        <button
                            onClick={() => onViewDetails(placement.id)}
                            className={`btn ${sizeClass} btn-square btn-primary`}
                            title="View Details"
                        >
                            <i className="fa-duotone fa-regular fa-eye" />
                        </button>
                    </>
                )}
            </div>
        );
    }

    // Descriptive variant
    return (
        <div className={`flex ${layoutClass} ${className}`}>
            {/* Status actions - CTAs first */}
            {actions.statusActions && isNonTerminal && (
                <>
                    <button
                        onClick={() => handleStatusChange("completed")}
                        className={`btn ${sizeClass} btn-success gap-2`}
                        disabled={updatingStatus}
                    >
                        {isLoading && statusAction === "completed" ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : (
                            <i className="fa-duotone fa-regular fa-check" />
                        )}
                        Mark Completed
                    </button>
                    <button
                        onClick={() => handleStatusChange("failed")}
                        className={`btn ${sizeClass} btn-error gap-2`}
                        disabled={updatingStatus}
                    >
                        {isLoading && statusAction === "failed" ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : (
                            <i className="fa-duotone fa-regular fa-xmark" />
                        )}
                        Mark Failed
                    </button>
                </>
            )}
            {actions.viewJob && (
                <Link
                    href={`/portal/roles/${placement.job_id}`}
                    className={`btn ${sizeClass} btn-ghost gap-2`}
                >
                    <i className="fa-duotone fa-regular fa-briefcase" />
                    View Job
                </Link>
            )}
            {actions.viewCandidate && (
                <Link
                    href={`/portal/candidates/${placement.candidate_id}`}
                    className={`btn ${sizeClass} btn-ghost gap-2`}
                >
                    <i className="fa-duotone fa-regular fa-user" />
                    View Candidate
                </Link>
            )}
            {actions.viewApplication && (
                <Link
                    href={`/portal/applications/${placement.application_id}`}
                    className={`btn ${sizeClass} btn-ghost gap-2`}
                >
                    <i className="fa-duotone fa-regular fa-file-lines" />
                    View Application
                </Link>
            )}
            {actions.viewCompany && (
                <Link
                    href={`/portal/companies/${placement.company_id}`}
                    className={`btn ${sizeClass} btn-ghost gap-2`}
                >
                    <i className="fa-duotone fa-regular fa-building" />
                    View Company
                </Link>
            )}
            {/* View Details - far right */}
            {actions.viewDetails && onViewDetails && (
                <>
                    <div className="divider divider-horizontal mx-0" />
                    <button
                        onClick={() => onViewDetails(placement.id)}
                        className={`btn ${sizeClass} btn-outline gap-2`}
                    >
                        <i className="fa-duotone fa-regular fa-eye" />
                        View Details
                    </button>
                </>
            )}
        </div>
    );
}
