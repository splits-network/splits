"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { LoadingState } from "@splits-network/shared-ui";
import PlacementActionsToolbar, {
    Placement,
} from "./placement-actions-toolbar";
import PlacementLifecycle from "@/components/placement-lifecycle";
import PlacementCollaborators from "@/components/placement-collaborators";

// ===== TYPES =====

interface PlacementDetailSidebarProps {
    placementId: string | null;
    onClose: () => void;
}

// ===== HELPERS =====

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const getStatusBadgeClass = (status: string) => {
    switch (status) {
        case "hired":
            return "badge-info";
        case "active":
            return "badge-primary";
        case "completed":
            return "badge-success";
        case "failed":
            return "badge-error";
        default:
            return "badge-ghost";
    }
};

// ===== COMPONENT =====

export default function PlacementDetailSidebar({
    placementId,
    onClose,
}: PlacementDetailSidebarProps) {
    const { getToken } = useAuth();
    const [placement, setPlacement] = useState<Placement | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (placementId) {
            fetchPlacement(placementId);
        } else {
            setPlacement(null);
        }
    }, [placementId]);

    const fetchPlacement = async (id: string) => {
        setLoading(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error("No auth token available");
            }

            const client = createAuthenticatedClient(token);
            const response: any = await client.get(`/placements/${id}`);
            setPlacement(response.data);
        } catch (err: any) {
            console.error("Failed to fetch placement:", err);
            const errorMessage =
                err?.message ||
                err?.response?.error?.message ||
                "Unknown error";
            setError(`Failed to load placement: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        if (placementId) {
            fetchPlacement(placementId);
        }
    };

    // Don't render if no ID
    if (!placementId) {
        return null;
    }

    // Loading state
    if (loading && !placement) {
        return (
            <div className="drawer drawer-end">
                <input
                    id="placement-detail-drawer"
                    type="checkbox"
                    className="drawer-toggle"
                    checked={!!placementId}
                    readOnly
                />
                <div className="drawer-side z-50">
                    <label
                        className="drawer-overlay"
                        onClick={onClose}
                        aria-label="Close sidebar"
                    ></label>
                    <div className="bg-base-100 min-h-full w-full md:w-2/3 lg:w-1/2 xl:w-2/5 flex flex-col">
                        <div className="flex-1 overflow-y-auto">
                            <div className="p-8">
                                <LoadingState message="Loading placement details..." />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show error state if there's an error (even without placement data)
    if (error && !placement) {
        return (
            <div className="drawer drawer-end">
                <input
                    id="placement-detail-drawer"
                    type="checkbox"
                    className="drawer-toggle"
                    checked={!!placementId}
                    readOnly
                />
                <div className="drawer-side z-50">
                    <label
                        className="drawer-overlay"
                        onClick={onClose}
                        aria-label="Close sidebar"
                    ></label>
                    <div className="bg-base-100 min-h-full w-full md:w-2/3 lg:w-1/2 xl:w-2/5 flex flex-col">
                        <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 p-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold">
                                Placement Details
                            </h2>
                            <button
                                onClick={onClose}
                                className="btn btn-sm btn-circle btn-ghost"
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="alert alert-error">
                                <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                                <span>{error}</span>
                            </div>
                            <button
                                onClick={() =>
                                    placementId && fetchPlacement(placementId)
                                }
                                className="btn btn-outline btn-sm mt-4"
                            >
                                <i className="fa-duotone fa-regular fa-refresh"></i>
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // If no placement loaded and no error, don't render
    if (!placement) {
        return null;
    }

    const candidateName = placement.candidate?.full_name || "Unknown Candidate";
    const jobTitle = placement.job?.title || "Unknown Role";
    const companyName = placement.job?.company?.name || "Unknown Company";

    return (
        <div className="drawer drawer-end">
            <input
                id="placement-detail-drawer"
                type="checkbox"
                className="drawer-toggle"
                checked={!!placementId}
                readOnly
            />

            <div className="drawer-side z-50">
                <label
                    className="drawer-overlay"
                    onClick={onClose}
                    aria-label="Close sidebar"
                ></label>

                <div className="bg-base-100 min-h-full w-full md:w-2/3 lg:w-1/2 xl:w-2/5 flex flex-col">
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 p-4 flex items-center justify-between">
                        <h2 className="text-lg font-bold">Placement Details</h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onClose}
                                className="btn btn-sm btn-circle btn-ghost"
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        {error && !loading && (
                            <div className="p-4">
                                <div className="alert alert-error">
                                    <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                                    <span>{error}</span>
                                </div>
                            </div>
                        )}

                        {placement && !loading && (
                            <div className="p-4 space-y-6">
                                {/* Header Section */}
                                <div>
                                    <div className="flex items-top gap-2 mb-1 justify-between">
                                        <div>
                                            <h1 className="text-2xl font-bold mb-1">
                                                {candidateName}
                                            </h1>
                                            <p className="text-base-content/70 mb-3">
                                                {jobTitle} at {companyName}
                                            </p>
                                        </div>

                                        {/* Actions Section */}
                                        <PlacementActionsToolbar
                                            placement={placement}
                                            variant="descriptive"
                                            layout="vertical"
                                            size="sm"
                                            onRefresh={handleRefresh}
                                            showActions={{
                                                viewDetails: false, // Already viewing
                                            }}
                                        />
                                    </div>

                                    {/* Status Badge */}
                                    <div className="flex flex-wrap items-center gap-2 mb-4">
                                        <span
                                            className={`badge ${getStatusBadgeClass(placement.state)} gap-1`}
                                        >
                                            <i
                                                className={`fa-duotone fa-regular ${
                                                    placement.state ===
                                                    "completed"
                                                        ? "fa-check"
                                                        : placement.state ===
                                                            "failed"
                                                          ? "fa-xmark"
                                                          : placement.state ===
                                                              "active"
                                                            ? "fa-briefcase"
                                                            : "fa-user-check"
                                                }`}
                                            ></i>
                                            {placement.state
                                                ? placement.state
                                                      .charAt(0)
                                                      .toUpperCase() +
                                                  placement.state.slice(1)
                                                : "Unknown"}
                                        </span>
                                        <span className="badge badge-success badge-lg">
                                            {formatCurrency(
                                                placement.recruiter_share,
                                            )}
                                        </span>
                                    </div>

                                    {/* Key Dates */}
                                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-base-content/70">
                                        <div className="flex items-center gap-1">
                                            <i className="fa-duotone fa-regular fa-calendar-check"></i>
                                            <span>
                                                Hired:{" "}
                                                {formatDate(placement.hired_at)}
                                            </span>
                                        </div>
                                        {placement.start_date && (
                                            <div className="flex items-center gap-1">
                                                <i className="fa-duotone fa-regular fa-calendar-day"></i>
                                                <span>
                                                    Started:{" "}
                                                    {formatDate(
                                                        placement.start_date,
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Lifecycle Section */}
                                <div className="border-t border-base-300 pt-4">
                                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-timeline text-primary"></i>
                                        Placement Lifecycle
                                    </h3>
                                    <PlacementLifecycle
                                        status={
                                            placement.state as
                                                | "hired"
                                                | "active"
                                                | "completed"
                                                | "failed"
                                        }
                                        hiredAt={placement.hired_at}
                                        startDate={placement.start_date}
                                        endDate={placement.end_date}
                                        failureDate={placement.failure_date}
                                        failureReason={placement.failure_reason}
                                        guaranteeDays={placement.guarantee_days}
                                    />
                                </div>

                                {/* Financial Details Section */}
                                <div className="border-t border-base-300 pt-4">
                                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-sack-dollar text-success"></i>
                                        Financial Details
                                    </h3>
                                    <div className="card bg-base-200">
                                        <div className="card-body p-4 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-base-content/70 flex items-center gap-2">
                                                    <i className="fa-duotone fa-regular fa-dollar-sign w-4"></i>
                                                    Salary
                                                </span>
                                                <span className="font-medium">
                                                    {formatCurrency(
                                                        placement.salary,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-base-content/70 flex items-center gap-2">
                                                    <i className="fa-duotone fa-regular fa-percent w-4"></i>
                                                    Fee Rate
                                                </span>
                                                <span className="font-medium">
                                                    {placement.fee_percentage}%
                                                </span>
                                            </div>
                                            <div className="divider my-1"></div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-base-content/70 flex items-center gap-2">
                                                    <i className="fa-duotone fa-regular fa-receipt w-4"></i>
                                                    Total Fee
                                                </span>
                                                <span className="font-semibold">
                                                    {formatCurrency(
                                                        placement.fee_amount,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-base-content/70 flex items-center gap-2">
                                                    <i className="fa-duotone fa-regular fa-user-tie w-4"></i>
                                                    Your Share
                                                </span>
                                                <span className="font-bold text-success text-lg">
                                                    {formatCurrency(
                                                        placement.recruiter_share,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-base-content/70 flex items-center gap-2">
                                                    <i className="fa-duotone fa-regular fa-building w-4"></i>
                                                    Platform Share
                                                </span>
                                                <span className="font-medium text-base-content/70">
                                                    {formatCurrency(
                                                        placement.platform_share,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Collaborators Section (if available) */}
                                {(placement as any).collaborators &&
                                    (placement as any).collaborators.length >
                                        0 && (
                                        <div className="border-t border-base-300 pt-4">
                                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                                <i className="fa-duotone fa-regular fa-users text-primary"></i>
                                                Recruiter Collaboration
                                            </h3>
                                            <PlacementCollaborators
                                                collaborators={
                                                    (placement as any)
                                                        .collaborators
                                                }
                                                totalFee={placement.fee_amount}
                                            />
                                        </div>
                                    )}

                                {/* Related Links Section */}
                                <div className="border-t border-base-300 pt-4 space-y-2">
                                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-link text-primary"></i>
                                        Related
                                    </h3>

                                    {placement.job_id && (
                                        <Link
                                            href={`/portal/roles/${placement.job_id}`}
                                            className="btn btn-outline w-full gap-2 justify-start"
                                            onClick={onClose}
                                        >
                                            <i className="fa-duotone fa-regular fa-briefcase"></i>
                                            View Job: {jobTitle}
                                        </Link>
                                    )}

                                    {placement.candidate_id && (
                                        <Link
                                            href={`/portal/candidates/${placement.candidate_id}`}
                                            className="btn btn-outline w-full gap-2 justify-start"
                                            onClick={onClose}
                                        >
                                            <i className="fa-duotone fa-regular fa-user"></i>
                                            View Candidate: {candidateName}
                                        </Link>
                                    )}

                                    {placement.application_id && (
                                        <Link
                                            href={`/portal/applications/${placement.application_id}`}
                                            className="btn btn-outline w-full gap-2 justify-start"
                                            onClick={onClose}
                                        >
                                            <i className="fa-duotone fa-regular fa-file-lines"></i>
                                            View Application
                                        </Link>
                                    )}

                                    {placement.company_id && (
                                        <Link
                                            href={`/portal/companies/${placement.company_id}`}
                                            className="btn btn-outline w-full gap-2 justify-start"
                                            onClick={onClose}
                                        >
                                            <i className="fa-duotone fa-regular fa-building"></i>
                                            View Company: {companyName}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
