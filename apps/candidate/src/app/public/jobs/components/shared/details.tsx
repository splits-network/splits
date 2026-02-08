"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { apiClient } from "@/lib/api-client";
import { LoadingState } from "@/components/standard-lists/loading-state";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { DataList, DataRow } from "@/components/ui";
import { formatSalary, formatRelativeTime } from "@/lib/utils";
import { JobAnalyticsChart } from "@/components/ui/charts/job-analytics-chart";
import type { Job } from "../../types";
import {
    formatEmploymentType,
    getCompanyInitials,
    getCompanyName,
    getCompanyIndustry,
    getCompanyHQ,
    shouldShowSalary,
    getStatusBadgeColor,
    formatStatus,
} from "../../types";

interface DetailsProps {
    itemId: string;
    onRefresh?: () => void;
}

export default function Details({ itemId, onRefresh }: DetailsProps) {
    const { isSignedIn } = useAuth();
    const [item, setItem] = useState<Job | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"details" | "analytics">(
        "details",
    );

    const fetchDetail = useCallback(async () => {
        if (!itemId) return;
        setLoading(true);
        try {
            const response: any = await apiClient.get(`/jobs/${itemId}`, {
                params: { include: "company,requirements" },
            });
            setItem(response.data);
        } catch (err) {
            console.error("Failed to fetch job detail:", err);
        } finally {
            setLoading(false);
        }
    }, [itemId]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    if (loading) {
        return (
            <div className="p-8">
                <LoadingState message="Loading job details..." />
            </div>
        );
    }

    if (!item) return null;

    const companyName = getCompanyName(item);
    const companyIndustry = getCompanyIndustry(item);
    const companyHQ = getCompanyHQ(item);

    const mandatoryReqs = (item.requirements || [])
        .filter((r) => r.requirement_type === "mandatory")
        .sort((a, b) => a.sort_order - b.sort_order);

    const preferredReqs = (item.requirements || [])
        .filter((r) => r.requirement_type === "preferred")
        .sort((a, b) => a.sort_order - b.sort_order);

    return (
        <div className="flex flex-col h-full min-h-0">
            {/* Job Header */}
            <div className="p-6 pb-0 space-y-4">
                <div className="flex items-start gap-4">
                    <div className="avatar avatar-placeholder shrink-0">
                        <div className="bg-base-200 text-base-content rounded-lg w-14 h-14 flex items-center justify-center">
                            {item.company?.logo_url ? (
                                <img
                                    src={item.company.logo_url}
                                    alt={`${companyName} logo`}
                                    className="w-full h-full object-contain rounded-lg"
                                />
                            ) : (
                                <span className="text-lg font-bold">
                                    {getCompanyInitials(companyName)}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold truncate">
                            {item.title}
                        </h3>
                        <p className="text-sm text-base-content/60">
                            {companyName}
                        </p>
                        {item.status && (
                            <div className="mt-2">
                                <span
                                    className={`badge ${getStatusBadgeColor(item.status)} badge-sm font-semibold`}
                                >
                                    {formatStatus(item.status)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Info Chips */}
                <div className="flex flex-wrap gap-3 text-sm">
                    {item.location && (
                        <span className="flex items-center gap-1.5">
                            <i className="fa-duotone fa-regular fa-location-dot text-xs" />
                            {item.location}
                        </span>
                    )}
                    {item.open_to_relocation && (
                        <span className="flex items-center gap-1.5">
                            <i className="fa-duotone fa-regular fa-location-arrow text-xs" />
                            Relocation
                        </span>
                    )}
                    {item.employment_type && (
                        <span className="flex items-center gap-1.5">
                            <i className="fa-duotone fa-regular fa-briefcase text-xs" />
                            {formatEmploymentType(item.employment_type)}
                        </span>
                    )}
                    {shouldShowSalary(item) && (
                        <span className="flex items-center gap-1.5 text-accent">
                            <i className="fa-duotone fa-regular fa-dollar-sign text-xs" />
                            {formatSalary(
                                item.salary_min ?? 0,
                                item.salary_max ?? 0,
                            )}
                        </span>
                    )}
                    {(item.updated_at || item.created_at) && (
                        <span className="flex items-center gap-1.5 text-base-content/60">
                            <i className="fa-duotone fa-regular fa-calendar text-xs" />
                            Posted{" "}
                            {formatRelativeTime(
                                (item.updated_at ||
                                    item.created_at) as string,
                            )}
                        </span>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="overflow-x-auto shrink-0 px-6 pt-4">
                <div role="tablist" className="tabs tabs-lift min-w-max">
                    <a
                        role="tab"
                        className={`tab ${activeTab === "details" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("details")}
                    >
                        <i className="fa-duotone fa-regular fa-clipboard mr-2" />
                        Details
                    </a>
                    <a
                        role="tab"
                        className={`tab ${activeTab === "analytics" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("analytics")}
                    >
                        <i className="fa-duotone fa-regular fa-chart-line mr-2" />
                        Analytics
                    </a>
                </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
                {activeTab === "details" && (
                    <>
                        {/* Job Description — PRIMARY CONTENT for candidate decision-making */}
                        <div>
                            <h4 className="font-semibold text-sm mb-3">
                                <i className="fa-duotone fa-regular fa-file-lines mr-2" />
                                Job Description
                            </h4>
                            {item.candidate_description || item.description ? (
                                <MarkdownRenderer
                                    content={
                                        item.candidate_description ||
                                        item.description ||
                                        ""
                                    }
                                />
                            ) : (
                                <p className="text-sm text-base-content/50 italic">
                                    No description provided for this role.
                                </p>
                            )}
                        </div>

                        {/* Requirements */}
                        <div className="card bg-base-200">
                            <div className="card-body p-4">
                                <h4 className="font-semibold text-sm mb-2">
                                    <i className="fa-duotone fa-regular fa-list-check mr-2" />
                                    Requirements
                                </h4>

                                {mandatoryReqs.length === 0 &&
                                    preferredReqs.length === 0 ? (
                                    <p className="text-sm text-base-content/50 italic">
                                        No requirements listed for this role.
                                    </p>
                                ) : (
                                    <>
                                        {mandatoryReqs.length > 0 && (
                                            <div className="mb-3">
                                                <h5 className="font-semibold text-xs text-error mb-1">
                                                    <i className="fa-duotone fa-regular fa-asterisk text-xs mr-1" />
                                                    Required
                                                </h5>
                                                <ul className="space-y-1">
                                                    {mandatoryReqs.map(
                                                        (req) => (
                                                            <li
                                                                key={req.id}
                                                                className="flex gap-2 text-sm"
                                                            >
                                                                <i className="fa-duotone fa-regular fa-check-circle text-error mt-0.5 shrink-0" />
                                                                {
                                                                    req.description
                                                                }
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            </div>
                                        )}

                                        {preferredReqs.length > 0 && (
                                            <div>
                                                <h5 className="font-semibold text-xs text-info mb-1">
                                                    <i className="fa-duotone fa-regular fa-star text-xs mr-1" />
                                                    Preferred
                                                </h5>
                                                <ul className="space-y-1">
                                                    {preferredReqs.map(
                                                        (req) => (
                                                            <li
                                                                key={req.id}
                                                                className="flex gap-2 text-sm"
                                                            >
                                                                <i className="fa-duotone fa-regular fa-circle-plus text-info mt-0.5 shrink-0" />
                                                                {
                                                                    req.description
                                                                }
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Job Details (metadata) */}
                        <div className="card bg-base-200">
                            <div className="card-body p-4">
                                <h4 className="font-semibold text-sm mb-2">
                                    <i className="fa-duotone fa-regular fa-info-circle mr-2" />
                                    Job Details
                                </h4>
                                <DataList compact>
                                    <DataRow
                                        icon="fa-location-dot"
                                        label="Location"
                                        value={
                                            item.location || "Not specified"
                                        }
                                    />
                                    <DataRow
                                        icon="fa-location-arrow"
                                        label="Relocation"
                                        value={
                                            item.open_to_relocation
                                                ? "Open to relocation"
                                                : "Not specified"
                                        }
                                    />
                                    <DataRow
                                        icon="fa-briefcase"
                                        label="Employment"
                                        value={formatEmploymentType(
                                            item.employment_type,
                                        )}
                                    />
                                    <DataRow
                                        icon="fa-dollar-sign"
                                        label="Salary"
                                        value={
                                            item.show_salary_range === false
                                                ? "Not disclosed"
                                                : item.salary_min ||
                                                    item.salary_max
                                                  ? formatSalary(
                                                        item.salary_min ?? 0,
                                                        item.salary_max ?? 0,
                                                    )
                                                  : "Not specified"
                                        }
                                    />
                                    <DataRow
                                        icon="fa-sitemap"
                                        label="Department"
                                        value={
                                            item.department || "Not specified"
                                        }
                                    />
                                    <DataRow
                                        icon="fa-industry"
                                        label="Industry"
                                        value={
                                            companyIndustry || "Not specified"
                                        }
                                    />
                                    <DataRow
                                        icon="fa-building"
                                        label="Company HQ"
                                        value={companyHQ || "Not specified"}
                                    />
                                    <DataRow
                                        icon="fa-shield-check"
                                        label="Guarantee"
                                        value={
                                            item.guarantee_days != null &&
                                            item.guarantee_days > 0
                                                ? `${item.guarantee_days} days`
                                                : "Not specified"
                                        }
                                    />
                                    <DataRow
                                        icon="fa-calendar"
                                        label="Posted"
                                        value={
                                            item.updated_at || item.created_at
                                                ? formatRelativeTime(
                                                      (item.updated_at ||
                                                          item.created_at) as string,
                                                  )
                                                : "Not available"
                                        }
                                    />
                                    <DataRow
                                        icon="fa-hashtag"
                                        label="Job ID"
                                        value={item.id.slice(0, 8)}
                                    />
                                </DataList>
                            </div>
                        </div>

                        {/* Company Info */}
                        <div className="card bg-base-200">
                            <div className="card-body p-4">
                                <h4 className="font-semibold text-sm mb-2">
                                    <i className="fa-duotone fa-regular fa-building mr-2" />
                                    About {companyName}
                                </h4>
                                {item.company?.description ? (
                                    <div className="text-sm">
                                        <MarkdownRenderer
                                            content={
                                                item.company.description
                                            }
                                        />
                                    </div>
                                ) : (
                                    <p className="text-sm text-base-content/50 italic">
                                        No company information provided.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Unauthenticated CTA */}
                        {!isSignedIn && (
                            <div className="card bg-primary text-primary-content">
                                <div className="card-body text-center p-4">
                                    <h4 className="font-bold text-lg mb-2">
                                        Ready to Apply?
                                    </h4>
                                    <p className="text-sm mb-4">
                                        Create an account to apply with one
                                        click and track your application.
                                    </p>
                                    <div className="flex gap-2 justify-center">
                                        <Link
                                            href={`/sign-up?redirect=${encodeURIComponent(`/public/jobs-new/${item.id}`)}`}
                                            className="btn btn-sm bg-white text-primary hover:bg-gray-100"
                                        >
                                            <i className="fa-duotone fa-regular fa-user-plus" />
                                            Create Account
                                        </Link>
                                        <Link
                                            href={`/sign-in?redirect=${encodeURIComponent(`/public/jobs-new/${item.id}`)}`}
                                            className="btn btn-sm btn-outline text-primary-content border-primary-content hover:bg-primary-content hover:text-primary"
                                        >
                                            <i className="fa-duotone fa-regular fa-right-to-bracket" />
                                            Sign In
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* View Full Job Page Link */}
                        <div className="flex justify-center">
                            <Link
                                href={`/public/jobs-new/${item.id}`}
                                className="btn btn-primary btn-sm"
                            >
                                Open Full Job Page
                                <i className="fa-duotone fa-regular fa-arrow-up-right-from-square ml-1.5" />
                            </Link>
                        </div>
                    </>
                )}

                {activeTab === "analytics" && (
                    <div className="card bg-base-200">
                        <div className="card-body p-4">
                            <h4 className="font-semibold text-sm mb-2">
                                <i className="fa-duotone fa-regular fa-chart-line mr-2" />
                                Job Analytics
                            </h4>
                            <JobAnalyticsChart jobId={item.id} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
