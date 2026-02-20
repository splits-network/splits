"use client";

import { useState } from "react";
import Link from "next/link";
import { formatSalary, formatDate, formatRelativeTime } from "@/lib/utils";
import ApplicationWizardModal from "@/components/application-wizard-modal";
import { JobAnalyticsChart } from "@/components/ui/charts/job-analytics-chart";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import {
    COMMUTE_TYPE_LABELS,
    JOB_LEVEL_LABELS,
    formatCommuteTypes,
    formatJobLevel,
} from "../../types";

interface JobRequirement {
    id: string;
    requirement_type: "mandatory" | "preferred";
    description: string;
    sort_order: number;
}

interface Job {
    id: string;
    title: string;
    company?: {
        name: string;
        description?: string;
        industry?: string;
        headquarters_location?: string;
        logo_url?: string;
    };
    department?: string;
    location?: string;
    salary_min?: number;
    salary_max?: number;
    employment_type?: string;
    open_to_relocation?: boolean;
    commute_types?: string[] | null;
    job_level?: string | null;
    updated_at?: string;
    created_at?: string;
    status?: string;
    description?: string;
    candidate_description?: string;
    requirements?: JobRequirement[];
}

interface JobDetailClientProps {
    job: Job;
    isAuthenticated: boolean;
    hasActiveRecruiter: boolean;
    existingApplication: any;
}

export default function JobDetailClient({
    job,
    isAuthenticated,
    hasActiveRecruiter,
    existingApplication,
}: JobDetailClientProps) {
    const [showWizard, setShowWizard] = useState(false);

    // Determine button text and icon based on state
    const getButtonConfig = () => {
        if (!isAuthenticated) {
            return {
                text: "Get Started",
                icon: "fa-rocket",
                action: () => {
                    window.location.href = `/sign-in?redirect=${encodeURIComponent(`/jobs/${job.id}`)}`;
                },
            };
        }

        if (existingApplication) {
            return {
                text: "Already Applied",
                icon: "fa-check-circle",
                action: () => {},
                disabled: true,
            };
        }

        return {
            text: hasActiveRecruiter ? "Send to Recruiter" : "Apply Now",
            icon: hasActiveRecruiter ? "fa-user-tie" : "fa-paper-plane",
            action: () => setShowWizard(true),
        };
    };

    const buttonConfig = getButtonConfig();

    return (
        <>
            <div className="container mx-auto px-4 py-4">
                {/* Back Button */}
                <Link href="/jobs" className="btn btn-ghost mb-4">
                    <i className="fa-duotone fa-regular fa-arrow-left"></i>
                    Back to Jobs
                </Link>
                <div className="grid grid-cols-8 gap-4">
                    <div className="col-span-6">
                        {/* Job Header */}
                        <div className="card bg-base-200 shadow mb-6">
                            <div className="card bg-base-100 m-2 shadow-lg">
                                <div className="card-body">
                                    <div className="flex flex-col md:flex-row gap-4 items-center md:items-start md:justify-between">
                                        <div className="flex flex-col md:flex-row gap-4 items-center">
                                            <div className="card-avatar">
                                                {job.company?.logo_url ? (
                                                    <img
                                                        src={
                                                            job.company.logo_url
                                                        }
                                                        alt={`${job.company.name} Logo`}
                                                        className="w-16 h-16 object-contain rounded"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 bg-base-300 flex items-center justify-center rounded">
                                                        <i className="fa-duotone fa-regular fa-building text-3xl text-base-content/50"></i>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-center md:items-start ">
                                                <h1 className="text-3xl font-bold">
                                                    {job.title}
                                                </h1>
                                                <div className="text-lg text-base-content/60">
                                                    {job.company?.name ||
                                                        "Company"}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col md:flex-row justify-center gap-3">
                                            <button
                                                className={`btn ${buttonConfig.disabled ? "btn-disabled" : "btn-primary"} flex items-center gap-2`}
                                                onClick={buttonConfig.action}
                                                disabled={buttonConfig.disabled}
                                            >
                                                <i
                                                    className={`fa-duotone fa-regular ${buttonConfig.icon}`}
                                                ></i>
                                                {buttonConfig.text}
                                            </button>

                                            <button className="btn btn-outline">
                                                <i className="fa-duotone fa-regular fa-bookmark"></i>
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                    {/* Job details */}
                                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                        {job.location && (
                                            <span className="flex items-center gap-2">
                                                <i className="fa-duotone fa-regular fa-location-dot"></i>
                                                {job.location}
                                            </span>
                                        )}
                                        {job.open_to_relocation && (
                                            <span className="flex items-center gap-2">
                                                <i className="fa-duotone fa-regular fa-butterfly"></i>
                                                Relocation
                                            </span>
                                        )}
                                        {job.employment_type && (
                                            <span className="flex items-center gap-2">
                                                <i className="fa-duotone fa-regular fa-briefcase"></i>
                                                {job.employment_type.replace(
                                                    "_",
                                                    "-",
                                                )}
                                            </span>
                                        )}
                                        {formatCommuteTypes(
                                            job.commute_types,
                                        ) && (
                                            <span className="flex items-center gap-2">
                                                <i className="fa-duotone fa-regular fa-building-user"></i>
                                                {formatCommuteTypes(
                                                    job.commute_types,
                                                )}
                                            </span>
                                        )}
                                        {formatJobLevel(job.job_level) && (
                                            <span className="flex items-center gap-2">
                                                <i className="fa-duotone fa-regular fa-signal"></i>
                                                {formatJobLevel(job.job_level)}
                                            </span>
                                        )}
                                        {job.updated_at && (
                                            <span className="flex items-center gap-2">
                                                <i className="fa-duotone fa-regular fa-calendar"></i>
                                                Posted{" "}
                                                {formatRelativeTime(
                                                    job.updated_at ||
                                                        job.created_at!,
                                                )}
                                            </span>
                                        )}
                                        {job.salary_min && job.salary_max && (
                                            <span className="flex items-center gap-1 text-accent">
                                                <i className="fa-duotone fa-regular fa-dollar-sign"></i>
                                                {formatSalary(
                                                    job.salary_min,
                                                    job.salary_max,
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 pt-0">
                                <MarkdownRenderer
                                    content={
                                        job.candidate_description ||
                                        job.description ||
                                        ""
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - 1/3 width */}
                    <div className="col-span-2 space-y-4">
                        {/* Job Details Card */}
                        <div className="card bg-base-200 shadow p-2">
                            <div className="card bg-base-100 shaodow-lg mb-4">
                                <div className="card-body">
                                    <h3 className="card-title text-xl mb-4">
                                        <i className="fa-duotone fa-regular fa-circle-info"></i>
                                        Job Details
                                    </h3>

                                    <div className="space-y-3">
                                        {/* Posted Date (relative) */}
                                        <div className="flex items-start gap-3">
                                            <i className="fa-duotone fa-regular fa-calendar text-base-content/70 mt-1 shrink-0"></i>
                                            <div className="min-w-0">
                                                <div className="text-xs text-base-content/70">
                                                    Posted
                                                </div>
                                                <div className="font-semibold break-words">
                                                    {formatRelativeTime(
                                                        job.updated_at ||
                                                            job.created_at!,
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Job Status */}
                                        {job.status && (
                                            <div className="flex items-start gap-3">
                                                <i className="fa-duotone fa-regular fa-circle-check text-base-content/70 mt-1 shrink-0"></i>
                                                <div className="min-w-0">
                                                    <div className="text-xs text-base-content/70">
                                                        Status
                                                    </div>
                                                    <div className="font-semibold">
                                                        <span
                                                            className={`badge badge-sm ${
                                                                job.status ===
                                                                "active"
                                                                    ? "badge-success"
                                                                    : job.status ===
                                                                        "paused"
                                                                      ? "badge-warning"
                                                                      : job.status ===
                                                                          "filled"
                                                                        ? "badge-info"
                                                                        : "badge-neutral"
                                                            }`}
                                                        >
                                                            {job.status
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                                job.status.slice(
                                                                    1,
                                                                )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Work Type */}
                                        {formatCommuteTypes(
                                            job.commute_types,
                                        ) && (
                                            <div className="flex items-start gap-3">
                                                <i className="fa-duotone fa-regular fa-building-user text-base-content/70 mt-1 shrink-0"></i>
                                                <div className="min-w-0">
                                                    <div className="text-xs text-base-content/70">
                                                        Work Type
                                                    </div>
                                                    <div className="font-semibold break-words">
                                                        {formatCommuteTypes(
                                                            job.commute_types,
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Job Level */}
                                        {formatJobLevel(job.job_level) && (
                                            <div className="flex items-start gap-3">
                                                <i className="fa-duotone fa-regular fa-signal text-base-content/70 mt-1 shrink-0"></i>
                                                <div className="min-w-0">
                                                    <div className="text-xs text-base-content/70">
                                                        Level
                                                    </div>
                                                    <div className="font-semibold break-words">
                                                        {formatJobLevel(
                                                            job.job_level,
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Department */}
                                        <div className="flex items-start gap-3">
                                            <i className="fa-duotone fa-regular fa-sitemap text-base-content/70 mt-1 shrink-0"></i>
                                            <div className="min-w-0">
                                                <div className="text-xs text-base-content/70">
                                                    Department
                                                </div>
                                                <div className="font-semibold truncate">
                                                    {job.department ||
                                                        "General"}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Job ID */}
                                        <div className="flex items-start gap-3">
                                            <i className="fa-duotone fa-regular fa-hashtag text-base-content/70 mt-1 shrink-0"></i>
                                            <div className="min-w-0">
                                                <div className="text-xs text-base-content/70">
                                                    Job ID
                                                </div>
                                                <div className="font-mono text-sm truncate">
                                                    {job.id.slice(0, 8)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 pt-0">
                                <JobAnalyticsChart jobId={job.id} />
                            </div>
                        </div>
                        {/* About Company */}
                        <div className="card bg-base-200 shadow mb-6">
                            <div className="card bg-base-100 shadow-lg">
                                <div className="card-body">
                                    <h3 className="card-title text-xl mb-4">
                                        <i className="fa-duotone fa-regular fa-building"></i>
                                        About {job.company?.name || "Company"}
                                    </h3>
                                </div>
                            </div>
                            <MarkdownRenderer
                                content={job.company?.description || ""}
                            />
                        </div>

                        {/* Requirements Card */}
                        {job.requirements && job.requirements.length > 0 ? (
                            <div className="card bg-base-200 shadow sticky top-20">
                                <div className="card-body bg-base-100 m-2 shadow-lg rounded-2xl">
                                    <h3 className="card-title text-xl mb-4">
                                        <i className="fa-duotone fa-regular fa-list-check"></i>
                                        Requirements
                                    </h3>

                                    {/* Mandatory Requirements */}
                                    {job.requirements.filter(
                                        (r) =>
                                            r.requirement_type === "mandatory",
                                    ).length > 0 && (
                                        <div className="mb-4">
                                            <h4 className="font-semibold text-sm text-error mb-2">
                                                <i className="fa-duotone fa-regular fa-asterisk text-xs"></i>{" "}
                                                Required
                                            </h4>
                                            <ul className="space-y-2">
                                                {job.requirements
                                                    .filter(
                                                        (r) =>
                                                            r.requirement_type ===
                                                            "mandatory",
                                                    )
                                                    .sort(
                                                        (a, b) =>
                                                            a.sort_order -
                                                            b.sort_order,
                                                    )
                                                    .map((req) => (
                                                        <li
                                                            key={req.id}
                                                            className="flex gap-2"
                                                        >
                                                            <i className="fa-duotone fa-regular fa-check-circle text-error mt-1 shrink-0"></i>
                                                            <span className="text-sm">
                                                                {
                                                                    req.description
                                                                }
                                                            </span>
                                                        </li>
                                                    ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                <div className="card-body">
                                    {/* Preferred Requirements */}
                                    {job.requirements.filter(
                                        (r) =>
                                            r.requirement_type === "preferred",
                                    ).length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-sm text-info mb-2">
                                                <i className="fa-duotone fa-regular fa-star text-xs"></i>{" "}
                                                Preferred
                                            </h4>
                                            <ul className="space-y-2">
                                                {job.requirements
                                                    .filter(
                                                        (r) =>
                                                            r.requirement_type ===
                                                            "preferred",
                                                    )
                                                    .sort(
                                                        (a, b) =>
                                                            a.sort_order -
                                                            b.sort_order,
                                                    )
                                                    .map((req) => (
                                                        <li
                                                            key={req.id}
                                                            className="flex gap-2"
                                                        >
                                                            <i className="fa-duotone fa-regular fa-circle-plus text-info mt-1 shrink-0"></i>
                                                            <span className="text-sm">
                                                                {
                                                                    req.description
                                                                }
                                                            </span>
                                                        </li>
                                                    ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="card bg-base-200 shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-xl mb-2">
                                        <i className="fa-duotone fa-regular fa-list-check"></i>
                                        Requirements
                                    </h3>
                                    <p className="text-sm text-base-content/70">
                                        No specific requirements listed for this
                                        job.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Apply CTA for non-authenticated users */}
                        {!isAuthenticated && (
                            <div className="card bg-primary text-white shadow">
                                <div className="card-body text-center">
                                    <h3 className="text-2xl font-bold mb-4">
                                        Ready to Apply?
                                    </h3>
                                    <p className="mb-6">
                                        Create an account to apply with one
                                        click and track your application.
                                    </p>
                                    <div className="flex gap-4 justify-center">
                                        <Link
                                            href={`/sign-up?redirect=${encodeURIComponent(`/jobs/${job.id}`)}`}
                                            className="btn btn-lg bg-white text-primary hover:bg-gray-100"
                                        >
                                            <i className="fa-duotone fa-regular fa-user-plus"></i>
                                            Create Account
                                        </Link>
                                        <Link
                                            href={`/sign-in?redirect=${encodeURIComponent(`/jobs/${job.id}`)}`}
                                            className="btn btn-lg btn-outline text-white border-white hover:bg-white hover:text-primary"
                                        >
                                            <i className="fa-duotone fa-regular fa-right-to-bracket"></i>
                                            Sign In
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Application Wizard Modal */}
            {showWizard && (
                <ApplicationWizardModal
                    jobId={job.id}
                    jobTitle={job.title}
                    companyName={job.company?.name || "Company"}
                    onClose={() => setShowWizard(false)}
                    onSuccess={(applicationId) => {
                        setShowWizard(false);
                    }}
                />
            )}
        </>
    );
}
