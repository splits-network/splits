"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import {
    useStandardList,
    PaginationControls,
    SearchInput,
    EmptyState,
    LoadingState,
    ErrorState,
} from "@/hooks/use-standard-list";
import { useToast } from "@/lib/toast-context";
import { AdminPageHeader } from "../components";

type ApplicationStage =
    | "draft"
    | "ai_review"
    | "gpt_review"
    | "ai_failed"
    | "ai_reviewed"
    | "recruiter_request"
    | "recruiter_proposed"
    | "recruiter_review"
    | "screen"
    | "submitted"
    | "company_review"
    | "company_feedback"
    | "interview"
    | "offer"
    | "hired"
    | "rejected"
    | "withdrawn"
    | "expired";

interface Application {
    id: string;
    job_id: string;
    candidate_id: string;
    recruiter_id?: string;
    stage: ApplicationStage;
    status: "active" | "archived";
    submitted_at: string;
    created_at: string;
    updated_at: string;
    job?: {
        id: string;
        title: string;
    };
    candidate?: {
        id: string;
        full_name?: string;
        email: string;
    };
    company?: {
        id: string;
        name: string;
    };
    recruiter_name?: string;
}

interface ApplicationFilters {
    stage?: ApplicationStage;
    status?: "active" | "archived";
}

const STAGE_CONFIG: Record<
    string,
    { color: string; icon: string; label: string }
> = {
    draft: { color: "badge-ghost", icon: "fa-pencil", label: "Draft" },
    ai_review: {
        color: "badge-info",
        icon: "fa-robot",
        label: "AI Review",
    },
    gpt_review: {
        color: "badge-info",
        icon: "fa-robot",
        label: "GPT Review",
    },
    ai_failed: {
        color: "badge-error",
        icon: "fa-triangle-exclamation",
        label: "Review Failed",
    },
    ai_reviewed: {
        color: "badge-info",
        icon: "fa-robot",
        label: "AI Reviewed",
    },
    recruiter_request: {
        color: "badge-warning",
        icon: "fa-user-tie",
        label: "Recruiter Request",
    },
    recruiter_proposed: {
        color: "badge-warning",
        icon: "fa-user-tie",
        label: "Recruiter Proposed",
    },
    recruiter_review: {
        color: "badge-warning",
        icon: "fa-user-tie",
        label: "Recruiter Review",
    },
    screen: { color: "badge-info", icon: "fa-filter", label: "Screen" },
    submitted: {
        color: "badge-primary",
        icon: "fa-inbox",
        label: "Submitted",
    },
    company_review: {
        color: "badge-primary",
        icon: "fa-building",
        label: "Company Review",
    },
    company_feedback: {
        color: "badge-primary",
        icon: "fa-building",
        label: "Company Feedback",
    },
    interview: {
        color: "badge-warning",
        icon: "fa-comments",
        label: "Interview",
    },
    offer: {
        color: "badge-accent",
        icon: "fa-file-signature",
        label: "Offer",
    },
    hired: { color: "badge-success", icon: "fa-check", label: "Hired" },
    rejected: {
        color: "badge-error",
        icon: "fa-xmark",
        label: "Rejected",
    },
    withdrawn: {
        color: "badge-ghost",
        icon: "fa-arrow-left",
        label: "Withdrawn",
    },
    expired: { color: "badge-ghost", icon: "fa-clock", label: "Expired" },
};

export default function ApplicationsAdminPage() {
    const { getToken } = useAuth();
    const toast = useToast();
    const [retriggeringId, setRetriggeringId] = useState<string | null>(null);

    const defaultFilters = useMemo<ApplicationFilters>(() => ({}), []);

    const {
        items: applications,
        loading,
        error,
        pagination,
        filters,
        search,
        setSearch,
        setFilters,
        setPage,
        refresh,
    } = useStandardList<Application, ApplicationFilters>({
        fetchFn: async (params) => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            const apiClient = createAuthenticatedClient(token);

            const queryParams = new URLSearchParams();
            queryParams.set("page", String(params.page));
            queryParams.set("limit", String(params.limit));
            if (params.search) queryParams.set("search", params.search);
            if (params.filters?.stage)
                queryParams.set("stage", params.filters.stage);
            if (params.filters?.status)
                queryParams.set("status", params.filters.status);
            if (params.sort_by) queryParams.set("sort_by", params.sort_by);
            if (params.sort_order)
                queryParams.set("sort_order", params.sort_order);

            // TODO: V3 CRUD returns flat data — app.job, app.candidate, app.company
            // will be undefined. Need an admin applications view endpoint with joins.
            const response = await apiClient.get(
                `/applications?${queryParams.toString()}`,
            );
            return response;
        },
        defaultFilters,
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        syncToUrl: true,
    });

    async function handleRetriggerAIReview(applicationId: string) {
        setRetriggeringId(applicationId);
        try {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            const apiClient = createAuthenticatedClient(token);
            await apiClient.post(
                `/applications/${applicationId}/trigger-ai-review`,
                {},
            );
            toast.success("AI review retriggered.");
            refresh();
        } catch (err: any) {
            toast.error(err?.message || "Failed to retrigger AI review");
        } finally {
            setRetriggeringId(null);
        }
    }

    function StageBadge({ stage }: { stage: ApplicationStage }) {
        const config = STAGE_CONFIG[stage];
        return (
            <span className={`badge ${config?.color || "badge-ghost"} gap-1`}>
                <i
                    className={`fa-duotone fa-regular ${config?.icon || "fa-circle-question"} text-xs`}
                ></i>
                {config?.label || stage}
            </span>
        );
    }

    // Calculate stage counts for key stages
    const stageCounts = useMemo(() => {
        const counts: Record<string, number> = {
            ai_review: 0,
            gpt_review: 0,
            submitted: 0,
            interview: 0,
            offer: 0,
            hired: 0,
            rejected: 0,
        };
        applications.forEach((app) => {
            if (counts[app.stage] !== undefined) {
                counts[app.stage]++;
            }
        });
        return counts;
    }, [applications]);

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Application Oversight"
                subtitle="Monitor all applications across the platform"
                breadcrumbs={[{ label: "Applications" }]}
            />

            {/* Stats */}
            <div className="grid grid-cols-3 md:grid-cols-7 gap-4">
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">AI Review</div>
                    <div className="stat-value text-xl text-info">
                        {loading ? "..." : stageCounts.ai_review}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">GPT Review</div>
                    <div className="stat-value text-xl text-info">
                        {loading ? "..." : stageCounts.gpt_review}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Submitted</div>
                    <div className="stat-value text-xl text-neutral">
                        {loading ? "..." : stageCounts.submitted}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Interview</div>
                    <div className="stat-value text-xl text-warning">
                        {loading ? "..." : stageCounts.interview}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Offer</div>
                    <div className="stat-value text-xl text-accent">
                        {loading ? "..." : stageCounts.offer}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Hired</div>
                    <div className="stat-value text-xl text-success">
                        {loading ? "..." : stageCounts.hired}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Rejected</div>
                    <div className="stat-value text-xl text-error">
                        {loading ? "..." : stageCounts.rejected}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search applications..."
                />
                <select
                    className="select select-sm"
                    value={filters.stage || ""}
                    onChange={(e) =>
                        setFilters({
                            ...filters,
                            stage:
                                (e.target
                                    .value as ApplicationFilters["stage"]) ||
                                undefined,
                        })
                    }
                >
                    <option value="">All Stages</option>
                    <option value="draft">Draft</option>
                    <option value="ai_review">AI Review</option>
                    <option value="gpt_review">GPT Review</option>
                    <option value="ai_failed">Review Failed</option>
                    <option value="ai_reviewed">AI Reviewed</option>
                    <option value="recruiter_request">Recruiter Request</option>
                    <option value="recruiter_proposed">
                        Recruiter Proposed
                    </option>
                    <option value="recruiter_review">Recruiter Review</option>
                    <option value="screen">Screen</option>
                    <option value="submitted">Submitted</option>
                    <option value="company_review">Company Review</option>
                    <option value="company_feedback">Company Feedback</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="hired">Hired</option>
                    <option value="rejected">Rejected</option>
                    <option value="withdrawn">Withdrawn</option>
                    <option value="expired">Expired</option>
                </select>
                <select
                    className="select select-sm"
                    value={filters.status || ""}
                    onChange={(e) =>
                        setFilters({
                            ...filters,
                            status:
                                (e.target
                                    .value as ApplicationFilters["status"]) ||
                                undefined,
                        })
                    }
                >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                </select>
            </div>

            {/* Table */}
            {loading ? (
                <LoadingState message="Loading applications..." />
            ) : error ? (
                <ErrorState message={error} onRetry={refresh} />
            ) : applications.length === 0 ? (
                <EmptyState
                    icon="fa-file-lines"
                    title="No applications found"
                    description={
                        search || filters.stage || filters.status
                            ? "Try adjusting your search or filters"
                            : "Applications will appear here once submitted"
                    }
                />
            ) : (
                <div className="card bg-base-100 shadow">
                    <div className="card-body p-0">
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Candidate</th>
                                        <th>Job</th>
                                        <th>Company</th>
                                        <th>Recruiter</th>
                                        <th>Stage</th>
                                        <th>Status</th>
                                        <th>Submitted</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applications.map((app) => (
                                        <tr key={app.id}>
                                            <td>
                                                {app.candidate ? (
                                                    <div>
                                                        <div className="font-semibold">
                                                            {app.candidate
                                                                .full_name ||
                                                                "Unknown"}
                                                        </div>
                                                        <div className="text-sm text-base-content/50">
                                                            {
                                                                app.candidate
                                                                    .email
                                                            }
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="font-mono text-sm text-base-content/50">
                                                        {app.candidate_id.substring(
                                                            0,
                                                            8,
                                                        )}
                                                        ...
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                {app.job ? (
                                                    <Link
                                                        href={`/portal/admin/jobs/${app.job.id}`}
                                                        className="link link-hover text-sm"
                                                    >
                                                        {app.job.title}
                                                    </Link>
                                                ) : (
                                                    <span className="font-mono text-sm text-base-content/50">
                                                        {app.job_id.substring(
                                                            0,
                                                            8,
                                                        )}
                                                        ...
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                {app.company ? (
                                                    <span className="text-sm">
                                                        {app.company.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-base-content/50">
                                                        -
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <span className="text-sm">
                                                    {app.recruiter_name || "-"}
                                                </span>
                                            </td>
                                            <td>
                                                <StageBadge stage={app.stage} />
                                            </td>
                                            <td>
                                                <span
                                                    className={`badge badge-sm ${app.status === "active" ? "badge-success" : "badge-ghost"}`}
                                                >
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-sm">
                                                    {new Date(
                                                        app.submitted_at ||
                                                            app.created_at,
                                                    ).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-1">
                                                    <Link
                                                        href={`/portal/admin/applications?applicationId=${app.id}`}
                                                        className="btn btn-xs btn-ghost"
                                                        title="View details"
                                                    >
                                                        <i className="fa-duotone fa-regular fa-eye"></i>
                                                    </Link>
                                                    {(app.stage ===
                                                        "ai_review" ||
                                                        app.stage ===
                                                            "gpt_review" ||
                                                        app.stage ===
                                                            "ai_failed") && (
                                                        <button
                                                            className="btn btn-xs btn-warning"
                                                            title="Retrigger AI Review"
                                                            disabled={
                                                                retriggeringId ===
                                                                app.id
                                                            }
                                                            onClick={() =>
                                                                handleRetriggerAIReview(
                                                                    app.id,
                                                                )
                                                            }
                                                        >
                                                            {retriggeringId ===
                                                            app.id ? (
                                                                <span className="loading loading-spinner loading-xs"></span>
                                                            ) : (
                                                                <i className="fa-duotone fa-regular fa-rotate-right"></i>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {!loading && !error && applications.length > 0 && (
                <PaginationControls pagination={pagination} setPage={setPage} />
            )}
        </div>
    );
}
