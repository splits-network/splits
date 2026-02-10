"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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

    // Tab scroll arrow buttons
    const tabScrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateScrollButtons = useCallback(() => {
        const el = tabScrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    }, []);

    useEffect(() => {
        const el = tabScrollRef.current;
        if (!el) return;
        updateScrollButtons();
        el.addEventListener("scroll", updateScrollButtons);
        const observer = new ResizeObserver(updateScrollButtons);
        observer.observe(el);
        return () => {
            el.removeEventListener("scroll", updateScrollButtons);
            observer.disconnect();
        };
    }, [updateScrollButtons]);

    const scrollTabs = useCallback((direction: "left" | "right") => {
        const el = tabScrollRef.current;
        if (!el) return;
        el.scrollBy({
            left: direction === "left" ? -120 : 120,
            behavior: "smooth",
        });
    }, []);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [itemId]);

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
            <div className="relative shrink-0">
                {canScrollLeft && (
                    <button
                        onClick={() => scrollTabs("left")}
                        className="absolute left-0 top-0 bottom-0 z-10 flex items-center px-1 bg-gradient-to-r from-base-100 via-base-100 to-transparent"
                        aria-label="Scroll tabs left"
                    >
                        <i className="fa-duotone fa-regular fa-chevron-left text-xs text-base-content/60" />
                    </button>
                )}
                <div
                    ref={tabScrollRef}
                    className="overflow-x-auto"
                    style={{ scrollbarWidth: "none" }}
                    data-tab-scroll
                >
                    <style>{`[data-tab-scroll]::-webkit-scrollbar { display: none; }`}</style>
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
                {canScrollRight && (
                    <button
                        onClick={() => scrollTabs("right")}
                        className="absolute right-0 top-0 bottom-0 z-10 flex items-center px-1 bg-gradient-to-l from-base-100 via-base-100 to-transparent"
                        aria-label="Scroll tabs right"
                    >
                        <i className="fa-duotone fa-regular fa-chevron-right text-xs text-base-content/60" />
                    </button>
                )}
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
    const guarantee = getGuaranteeProgress(placement);
    const state = placement.state || "hired";

    return (
        <div className="space-y-5">
            {/* Earnings Hero */}
            <div className="bg-success/10 border border-success/20 rounded-xl p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm text-base-content/60 mb-1">
                            Your Earnings
                        </div>
                        <div className="text-3xl font-bold tabular-nums text-success">
                            {formatCurrency(placement.recruiter_share || 0)}
                        </div>
                        {placement.your_splits &&
                            placement.your_splits.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {placement.your_splits.map((split) => (
                                        <span
                                            key={split.role}
                                            className="badge badge-sm badge-primary gap-1"
                                        >
                                            <i
                                                className={`fa-duotone fa-regular ${getRoleIcon(split.role)} text-[10px]`}
                                            />
                                            {getRoleFriendlyName(split.role)}
                                        </span>
                                    ))}
                                </div>
                            )}
                    </div>
                    {guarantee && (
                        <div
                            className="radial-progress text-success"
                            style={
                                {
                                    "--value": guarantee.percent,
                                    "--size": "3.5rem",
                                    "--thickness": "4px",
                                } as React.CSSProperties
                            }
                            role="progressbar"
                        >
                            <span className="text-xs font-semibold">
                                {guarantee.percent}%
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Payout Journey Stepper */}
            <div>
                <h4 className="text-sm font-semibold text-base-content/60 uppercase tracking-wider mb-3">
                    Payout Journey
                </h4>
                <PayoutStepper placement={placement} guarantee={guarantee} />
            </div>

            {/* Contextual Alert */}
            <ContextualAlert placement={placement} guarantee={guarantee} />

            {/* Key Details */}
            <div>
                <h4 className="text-sm font-semibold text-base-content/60 uppercase tracking-wider mb-3">
                    Details
                </h4>
                <div className="card bg-base-200 p-4">
                    <div className="divide-y divide-base-300">
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-base-content/70 flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-user text-xs" />
                                Candidate
                            </span>
                            <span className="font-medium text-sm">
                                {placement.candidate?.full_name || "Unknown"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-base-content/70 flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-briefcase text-xs" />
                                Position
                            </span>
                            <span className="font-medium text-sm">
                                {placement.job?.title || "Unknown"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-base-content/70 flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-building text-xs" />
                                Company
                            </span>
                            <span className="font-medium text-sm">
                                {placement.job?.company?.name || "Unknown"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-base-content/70 flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-dollar-sign text-xs" />
                                Salary
                            </span>
                            <span className="font-medium tabular-nums text-sm">
                                {formatCurrency(placement.salary || 0)}
                            </span>
                        </div>
                        {placement.start_date && (
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-base-content/70 flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-calendar-check text-xs" />
                                    Start Date
                                </span>
                                <span className="font-medium text-sm">
                                    {formatPlacementDate(placement.start_date)}
                                </span>
                            </div>
                        )}
                        {placement.guarantee_days && (
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-base-content/70 flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-shield-check text-xs" />
                                    Guarantee
                                </span>
                                <span className="font-medium text-sm">
                                    {placement.guarantee_days} days
                                    {placement.guarantee_expires_at && (
                                        <span className="text-base-content/50">
                                            {" "}
                                            (expires{" "}
                                            {formatPlacementDate(
                                                placement.guarantee_expires_at,
                                            )}
                                            )
                                        </span>
                                    )}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function FinancialTab({ placement }: { placement: Placement }) {
    const totalFee = placement.fee_amount || placement.placement_fee || 0;
    const yourShare = placement.recruiter_share || 0;
    const yourPercent =
        totalFee > 0 ? Math.round((yourShare / totalFee) * 100) : 0;
    const remainderAmount = totalFee - yourShare;
    const remainderPercent = 100 - yourPercent;

    return (
        <div className="space-y-5">
            {/* Fee Calculation */}
            <div>
                <h4 className="text-sm font-semibold text-base-content/60 uppercase tracking-wider mb-3">
                    Fee Calculation
                </h4>
                <div className="card bg-base-200 p-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between py-1">
                            <span className="text-sm text-base-content/70 flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-dollar-sign text-xs w-4" />
                                Base Salary
                            </span>
                            <span className="font-medium tabular-nums">
                                {formatCurrency(placement.salary || 0)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-1">
                            <span className="text-sm text-base-content/70 flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-percent text-xs w-4" />
                                Fee Rate
                            </span>
                            <span className="font-medium tabular-nums">
                                {placement.fee_percentage || 0}%
                            </span>
                        </div>
                        <div className="border-t-2 border-base-300 my-1" />
                        <div className="flex items-center justify-between py-1">
                            <span className="text-sm font-semibold flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-receipt text-xs w-4" />
                                Total Placement Fee
                            </span>
                            <span className="font-bold text-lg tabular-nums">
                                {formatCurrency(totalFee)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Your Commission */}
            <div>
                <h4 className="text-sm font-semibold text-base-content/60 uppercase tracking-wider mb-3">
                    Your Commission
                </h4>
                <div className="bg-success/10 border border-success/20 rounded-xl p-4">
                    {placement.your_splits &&
                    placement.your_splits.length > 1 ? (
                        /* Multiple roles */
                        <div className="space-y-3">
                            {placement.your_splits.map((split) => (
                                <div
                                    key={split.role}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        <i
                                            className={`fa-duotone fa-regular ${getRoleIcon(split.role)} text-success text-sm`}
                                        />
                                        <span className="text-sm">
                                            {getRoleFriendlyName(split.role)}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-success tabular-nums">
                                            {formatCurrency(split.split_amount)}
                                        </span>
                                        <span className="text-xs text-base-content/50 ml-1.5">
                                            ({split.split_percentage}%)
                                        </span>
                                    </div>
                                </div>
                            ))}
                            <div className="border-t border-success/20 pt-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold">
                                        Total
                                    </span>
                                    <span className="text-2xl font-bold text-success tabular-nums">
                                        {formatCurrency(yourShare)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Single role or no split detail */
                        <div>
                            <div className="text-3xl font-bold text-success tabular-nums">
                                {formatCurrency(yourShare)}
                            </div>
                            {placement.your_splits &&
                                placement.your_splits.length === 1 && (
                                    <div className="text-sm text-base-content/60 mt-1 flex items-center gap-1.5">
                                        <i
                                            className={`fa-duotone fa-regular ${getRoleIcon(placement.your_splits[0].role)} text-xs`}
                                        />
                                        {getRoleFriendlyName(
                                            placement.your_splits[0].role,
                                        )}{" "}
                                        &middot;{" "}
                                        {
                                            placement.your_splits[0]
                                                .split_percentage
                                        }
                                        % of placement fee
                                    </div>
                                )}
                        </div>
                    )}
                </div>
            </div>

            {/* Fee Distribution Bar */}
            {totalFee > 0 && (
                <div>
                    <h4 className="text-sm font-semibold text-base-content/60 uppercase tracking-wider mb-3">
                        Fee Distribution
                    </h4>
                    <div className="card bg-base-200 p-4">
                        <div className="w-full h-4 rounded-full overflow-hidden flex bg-base-300">
                            {yourPercent > 0 && (
                                <div
                                    className="bg-success h-full rounded-l-full transition-all duration-500"
                                    style={{ width: `${yourPercent}%` }}
                                />
                            )}
                            {remainderPercent > 0 && (
                                <div
                                    className="bg-base-content/15 h-full transition-all duration-500"
                                    style={{ width: `${remainderPercent}%` }}
                                />
                            )}
                        </div>
                        <div className="flex justify-between mt-2 text-xs">
                            <span className="text-success font-medium">
                                You: {formatCurrency(yourShare)} ({yourPercent}
                                %)
                            </span>
                            <span className="text-base-content/50">
                                Other: {formatCurrency(remainderAmount)} (
                                {remainderPercent}%)
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Info Footer */}
            <div className="flex items-center gap-2 text-sm text-base-content/50">
                <div
                    className="tooltip tooltip-info tooltip-right"
                    data-tip="Commission rates are locked at the time of hire based on each recruiter's subscription tier."
                >
                    <i className="fa-duotone fa-regular fa-circle-info fa-lg text-info" />
                </div>
                <span>
                    Rates locked at time of hire based on subscription tier.
                </span>
            </div>
        </div>
    );
}

// ===== HELPERS =====

function getRoleFriendlyName(role: string): string {
    const names: Record<string, string> = {
        candidate_recruiter: "Candidate Recruiter",
        company_recruiter: "Company Recruiter",
        job_owner: "Job Owner",
        candidate_sourcer: "Candidate Sourcer",
        company_sourcer: "Company Sourcer",
    };
    return names[role] || role;
}

function getRoleIcon(role: string): string {
    const icons: Record<string, string> = {
        candidate_recruiter: "fa-handshake",
        company_recruiter: "fa-building",
        job_owner: "fa-file-lines",
        candidate_sourcer: "fa-magnifying-glass",
        company_sourcer: "fa-magnifying-glass-dollar",
    };
    return icons[role] || "fa-user";
}

interface GuaranteeProgress {
    daysElapsed: number;
    totalDays: number;
    percent: number;
}

function getGuaranteeProgress(placement: Placement): GuaranteeProgress | null {
    if (!placement.start_date || !placement.guarantee_days) return null;
    const start = new Date(placement.start_date);
    const now = new Date();
    const daysElapsed = Math.max(
        0,
        Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
    );
    const totalDays = placement.guarantee_days;
    const percent = Math.min(100, Math.round((daysElapsed / totalDays) * 100));
    return { daysElapsed, totalDays, percent };
}

// ===== OVERVIEW SUB-COMPONENTS =====

function PayoutStepper({
    placement,
    guarantee,
}: {
    placement: Placement;
    guarantee: GuaranteeProgress | null;
}) {
    const state = placement.state || "hired";
    const hasStarted = !!placement.start_date;
    const guaranteeComplete = guarantee ? guarantee.percent >= 100 : false;
    const isFailed = state === "failed";
    const isCompleted = state === "completed";

    const steps: {
        label: string;
        detail?: string;
        status: "done" | "current" | "upcoming" | "error";
    }[] = [];

    // Step 1: Hired
    steps.push({
        label: "Hired",
        detail: formatPlacementDate(placement.hired_at),
        status: "done",
    });

    // Step 2: Candidate Started
    if (isFailed && !hasStarted) {
        steps.push({ label: "Candidate Started", status: "error" });
    } else if (hasStarted) {
        steps.push({
            label: "Candidate Started",
            detail: formatPlacementDate(placement.start_date!),
            status: "done",
        });
    } else {
        steps.push({
            label: "Candidate Started",
            detail: "Awaiting start date",
            status: "current",
        });
    }

    // Step 3: Guarantee Period
    if (isFailed) {
        steps.push({
            label: "Guarantee Period",
            detail: placement.failure_reason || "Placement failed",
            status: "error",
        });
    } else if (!hasStarted) {
        steps.push({ label: "Guarantee Period", status: "upcoming" });
    } else if (guaranteeComplete || isCompleted) {
        steps.push({
            label: "Guarantee Period",
            detail: `${placement.guarantee_days} days completed`,
            status: "done",
        });
    } else if (guarantee) {
        steps.push({
            label: "Guarantee Period",
            detail: `Day ${guarantee.daysElapsed} of ${guarantee.totalDays}`,
            status: "current",
        });
    } else {
        steps.push({ label: "Guarantee Period", status: "upcoming" });
    }

    // Step 4: Payout Eligible
    if (isCompleted) {
        steps.push({ label: "Payout Eligible", status: "done" });
    } else if (guaranteeComplete && !isFailed) {
        steps.push({
            label: "Payout Eligible",
            detail: "Ready for processing",
            status: "current",
        });
    } else {
        steps.push({ label: "Payout Eligible", status: "upcoming" });
    }

    // Step 5: Paid
    if (isCompleted) {
        steps.push({
            label: "Completed",
            detail: formatPlacementDate(placement.end_date),
            status: "done",
        });
    } else {
        steps.push({ label: "Paid", status: "upcoming" });
    }

    const iconMap = {
        done: "fa-check",
        current: "fa-spinner fa-spin",
        upcoming: "fa-circle",
        error: "fa-xmark",
    };
    const colorMap = {
        done: "text-success bg-success/15",
        current: "text-primary bg-primary/15",
        upcoming: "text-base-content/30 bg-base-300/50",
        error: "text-error bg-error/15",
    };
    const lineColorMap = {
        done: "bg-success",
        current: "bg-primary/40",
        upcoming: "bg-base-300",
        error: "bg-error/40",
    };

    return (
        <div className="space-y-0">
            {steps.map((step, i) => (
                <div key={i} className="flex gap-3">
                    {/* Icon column */}
                    <div className="flex flex-col items-center">
                        <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${colorMap[step.status]}`}
                        >
                            <i
                                className={`fa-duotone fa-regular ${iconMap[step.status]} text-xs`}
                            />
                        </div>
                        {i < steps.length - 1 && (
                            <div
                                className={`w-0.5 flex-1 min-h-5 ${lineColorMap[step.status]}`}
                            />
                        )}
                    </div>
                    {/* Content */}
                    <div
                        className={`pb-4 ${step.status === "upcoming" ? "opacity-40" : ""}`}
                    >
                        <div
                            className={`text-sm font-medium ${step.status === "error" ? "text-error" : ""}`}
                        >
                            {step.label}
                        </div>
                        {step.detail && (
                            <div className="text-xs text-base-content/60 mt-0.5">
                                {step.detail}
                            </div>
                        )}
                        {/* Inline progress bar for current guarantee step */}
                        {step.status === "current" &&
                            guarantee &&
                            step.label === "Guarantee Period" && (
                                <div className="mt-2 w-full max-w-48">
                                    <div className="w-full h-1.5 rounded-full bg-base-300 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-primary transition-all duration-500"
                                            style={{
                                                width: `${guarantee.percent}%`,
                                            }}
                                        />
                                    </div>
                                    <div className="text-[10px] text-base-content/50 mt-0.5 tabular-nums">
                                        {guarantee.percent}% &middot; Expires{" "}
                                        {formatPlacementDate(
                                            placement.guarantee_expires_at,
                                        )}
                                    </div>
                                </div>
                            )}
                    </div>
                </div>
            ))}
        </div>
    );
}

function ContextualAlert({
    placement,
    guarantee,
}: {
    placement: Placement;
    guarantee: GuaranteeProgress | null;
}) {
    const state = placement.state || "hired";
    const hasStarted = !!placement.start_date;
    const guaranteeComplete = guarantee ? guarantee.percent >= 100 : false;

    if (state === "failed") {
        return (
            <div className="alert alert-error text-sm">
                <i className="fa-duotone fa-regular fa-triangle-exclamation" />
                <span>
                    Placement failed
                    {placement.failure_reason
                        ? `: ${placement.failure_reason}`
                        : ""}
                    . Contact support if you have questions.
                </span>
            </div>
        );
    }

    if (state === "completed") {
        return (
            <div className="alert alert-success text-sm">
                <i className="fa-duotone fa-regular fa-circle-check" />
                <span>
                    Placement completed successfully. Payout has been processed.
                </span>
            </div>
        );
    }

    if (!hasStarted) {
        return (
            <div className="alert alert-info text-sm">
                <i className="fa-duotone fa-regular fa-clock" />
                <span>
                    Waiting for candidate start date confirmation. The guarantee
                    period begins on the start date.
                </span>
            </div>
        );
    }

    if (guaranteeComplete) {
        return (
            <div className="alert alert-success text-sm">
                <i className="fa-duotone fa-regular fa-circle-check" />
                <span>
                    Guarantee period complete! Your payout is being processed.
                </span>
            </div>
        );
    }

    // Active, within guarantee
    return (
        <div className="alert alert-warning text-sm">
            <i className="fa-duotone fa-regular fa-shield-check" />
            <div>
                <span>
                    Guarantee period in progress. Payouts are processed after
                    the guarantee completes
                </span>
                {placement.guarantee_expires_at && (
                    <span>
                        {" "}
                        on{" "}
                        <strong>
                            {formatPlacementDate(
                                placement.guarantee_expires_at,
                            )}
                        </strong>
                    </span>
                )}
                <span>.</span>
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
