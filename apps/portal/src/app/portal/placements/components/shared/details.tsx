"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { LoadingState } from "@splits-network/shared-ui";
import PlacementLifecycle from "@/components/placement-lifecycle";
import PlacementCollaborators from "@/components/placement-collaborators";
import type { Placement } from "../../types";
import {
    formatPlacementDate,
    formatCurrency,
    getStatusDisplay,
} from "../../types";

interface DetailsProps {
    itemId: string;
    onRefresh?: () => void;
}

export default function Details({ itemId, onRefresh }: DetailsProps) {
    const { getToken } = useAuth();
    const [placement, setPlacement] = useState<Placement | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<
        "overview" | "financial" | "lifecycle" | "collaborators"
    >("overview");

    const fetchDetail = useCallback(async () => {
        if (!itemId) return;
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const response = await client.get(`/placements/${itemId}`, {
                params: {
                    include: "candidate,job,company,collaborators",
                },
            });
            setPlacement(response.data);
        } catch (err) {
            console.error("Failed to fetch placement detail:", err);
        } finally {
            setLoading(false);
        }
    }, [itemId, getToken]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    const handleUpdate = useCallback(() => {
        fetchDetail();
        onRefresh?.();
    }, [fetchDetail, onRefresh]);

    if (loading && !placement) {
        return (
            <div className="p-6">
                <LoadingState message="Loading placement details..." />
            </div>
        );
    }

    if (!placement) {
        return (
            <div className="p-6 text-center text-base-content/40">
                <p>Placement not found</p>
            </div>
        );
    }

    const status = getStatusDisplay(placement);
    const candidateName = placement.candidate?.full_name || "Unknown Candidate";
    const jobTitle = placement.job?.title || "Unknown Role";
    const companyName = placement.job?.company?.name || "Unknown Company";
    const hasCollaborators =
        placement.collaborators && placement.collaborators.length > 0;

    return (
        <div className="flex flex-col h-full min-h-0 p-4 md:p-6 gap-6">
            {/* Header */}
            <div className="flex items-start justify-between shrink-0">
                <div>
                    <h3 className="text-2xl font-bold">{candidateName}</h3>
                    <p className="text-base-content/60 mt-1">
                        {jobTitle} at {companyName}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span
                        className={`badge ${status.badgeClass} badge-lg gap-1`}
                    >
                        <i className={`fa-duotone fa-regular ${status.icon}`} />
                        {status.label}
                    </span>
                    <span className="badge badge-success badge-lg">
                        {formatCurrency(placement.recruiter_share || 0)}
                    </span>
                </div>
            </div>

            {/* Tabs */}
            <div className="overflow-x-auto shrink-0">
                <div role="tablist" className="tabs tabs-lift min-w-max">
                    <a
                        role="tab"
                        className={`tab ${activeTab === "overview" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("overview")}
                    >
                        <i className="fa-duotone fa-clipboard mr-2" />
                        Overview
                    </a>
                    <a
                        role="tab"
                        className={`tab ${activeTab === "financial" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("financial")}
                    >
                        <i className="fa-duotone fa-sack-dollar mr-2" />
                        Financial
                    </a>
                    <a
                        role="tab"
                        className={`tab ${activeTab === "lifecycle" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("lifecycle")}
                    >
                        <i className="fa-duotone fa-timeline mr-2" />
                        Lifecycle
                    </a>
                    {hasCollaborators && (
                        <a
                            role="tab"
                            className={`tab ${activeTab === "collaborators" ? "tab-active" : ""}`}
                            onClick={() => setActiveTab("collaborators")}
                        >
                            <i className="fa-duotone fa-users mr-2" />
                            Collaborators
                        </a>
                    )}
                </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-4 flex-1 min-h-0 overflow-y-auto">
                {activeTab === "overview" && (
                    <OverviewTab placement={placement} />
                )}
                {activeTab === "financial" && (
                    <FinancialTab placement={placement} />
                )}
                {activeTab === "lifecycle" && (
                    <LifecycleTab placement={placement} />
                )}
                {activeTab === "collaborators" && hasCollaborators && (
                    <CollaboratorsTab placement={placement} />
                )}
            </div>

            {/* Related Links */}
            <div className="border-t border-base-300 pt-4 space-y-2">
                <h4 className="text-sm font-semibold text-base-content/60 uppercase tracking-wider mb-3">
                    Related
                </h4>
                <div className="flex flex-wrap gap-2">
                    {placement.job_id && (
                        <Link
                            href={`/portal/roles/${placement.job_id}`}
                            className="btn btn-outline btn-sm gap-2"
                        >
                            <i className="fa-duotone fa-regular fa-briefcase" />
                            View Job
                        </Link>
                    )}
                    {placement.candidate_id && (
                        <Link
                            href={`/portal/candidates/${placement.candidate_id}`}
                            className="btn btn-outline btn-sm gap-2"
                        >
                            <i className="fa-duotone fa-regular fa-user" />
                            View Candidate
                        </Link>
                    )}
                    {placement.application_id && (
                        <Link
                            href={`/portal/applications/${placement.application_id}`}
                            className="btn btn-outline btn-sm gap-2"
                        >
                            <i className="fa-duotone fa-regular fa-file-lines" />
                            View Application
                        </Link>
                    )}
                    {placement.company_id && (
                        <Link
                            href={`/portal/companies/${placement.company_id}`}
                            className="btn btn-outline btn-sm gap-2"
                        >
                            <i className="fa-duotone fa-regular fa-building" />
                            View Company
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

// ===== TAB COMPONENTS =====

function OverviewTab({ placement }: { placement: Placement }) {
    const status = getStatusDisplay(placement);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card bg-base-200 p-4">
                <h4 className="font-semibold mb-2">Status</h4>
                <span className={`badge ${status.badgeClass} badge-lg gap-1`}>
                    <i className={`fa-duotone fa-regular ${status.icon}`} />
                    {status.label}
                </span>
            </div>

            <div className="card bg-base-200 p-4">
                <h4 className="font-semibold mb-2">Hired Date</h4>
                <p>{formatPlacementDate(placement.hired_at)}</p>
            </div>

            {placement.start_date && (
                <div className="card bg-base-200 p-4">
                    <h4 className="font-semibold mb-2">Start Date</h4>
                    <p>{formatPlacementDate(placement.start_date)}</p>
                </div>
            )}

            {placement.guarantee_days && (
                <div className="card bg-base-200 p-4">
                    <h4 className="font-semibold mb-2">Guarantee Period</h4>
                    <p>{placement.guarantee_days} days</p>
                    {placement.guarantee_expires_at && (
                        <p className="text-sm text-base-content/60 mt-1">
                            Expires:{" "}
                            {formatPlacementDate(
                                placement.guarantee_expires_at,
                            )}
                        </p>
                    )}
                </div>
            )}

            <div className="card bg-base-200 p-4">
                <h4 className="font-semibold mb-2">Your Share</h4>
                <p className="text-xl font-bold text-success">
                    {formatCurrency(placement.recruiter_share || 0)}
                </p>
            </div>

            {placement.failure_reason && (
                <div className="card bg-base-200 p-4 md:col-span-2">
                    <h4 className="font-semibold mb-2 text-error">
                        Failure Reason
                    </h4>
                    <p className="text-sm text-base-content/70">
                        {placement.failure_reason}
                    </p>
                </div>
            )}
        </div>
    );
}

function FinancialTab({ placement }: { placement: Placement }) {
    return (
        <div className="card bg-base-200">
            <div className="card-body p-4 space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-base-content/70 flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-dollar-sign w-4" />
                        Salary
                    </span>
                    <span className="font-medium">
                        {formatCurrency(placement.salary || 0)}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-base-content/70 flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-percent w-4" />
                        Fee Rate
                    </span>
                    <span className="font-medium">
                        {placement.fee_percentage || 0}%
                    </span>
                </div>
                <div className="divider my-1" />
                <div className="flex justify-between items-center">
                    <span className="text-base-content/70 flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-receipt w-4" />
                        Total Fee
                    </span>
                    <span className="font-semibold">
                        {formatCurrency(placement.fee_amount || 0)}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-base-content/70 flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-user-tie w-4" />
                        Your Share
                    </span>
                    <span className="font-bold text-success text-lg">
                        {formatCurrency(placement.recruiter_share || 0)}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-base-content/70 flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-building w-4" />
                        Platform Share
                    </span>
                    <span className="font-medium text-base-content/70">
                        {formatCurrency(placement.platform_share || 0)}
                    </span>
                </div>
            </div>
        </div>
    );
}

function LifecycleTab({ placement }: { placement: Placement }) {
    return (
        <PlacementLifecycle
            status={
                placement.state as "hired" | "active" | "completed" | "failed"
            }
            hiredAt={placement.hired_at}
            startDate={placement.start_date}
            endDate={placement.end_date}
            failureDate={placement.failed_at || placement.failure_date}
            failureReason={placement.failure_reason ?? undefined}
            guaranteeDays={placement.guarantee_days ?? undefined}
        />
    );
}

function CollaboratorsTab({ placement }: { placement: Placement }) {
    if (!placement.collaborators || placement.collaborators.length === 0) {
        return (
            <div className="text-center p-8 text-base-content/50">
                <i className="fa-duotone fa-users text-4xl mb-2" />
                <p>No collaborators</p>
            </div>
        );
    }

    return (
        <PlacementCollaborators
            collaborators={placement.collaborators}
            totalFee={placement.fee_amount || 0}
        />
    );
}
