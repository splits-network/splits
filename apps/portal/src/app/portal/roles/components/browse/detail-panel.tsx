"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { Job } from "./types";
import DetailHeader from "./detail-header";
import AddRoleWizardModal from "./role-wizard-modal";

interface DetailPanelProps {
    id: string | null;
    onClose: () => void;
}

export default function DetailPanel({ id, onClose }: DetailPanelProps) {
    const { getToken } = useAuth();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<
        "overview" | "requirements" | "prescreen" | "financials" | "company"
    >("overview");
    const [descriptionTab, setDescriptionTab] = useState<
        "recruiter" | "candidate"
    >("recruiter");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchDetail = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        setError(null);
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            // V2 API standard: /jobs/:id?include=company,requirements,pre_screen_questions
            const res = await client.get(`/jobs/${id}`, {
                params: {
                    include: "company,requirements,pre_screen_questions",
                },
            });
            setJob(res.data);
        } catch (err) {
            console.error(err);
            setError("Failed to load role details");
        } finally {
            setLoading(false);
        }
    }, [id, getToken]);

    useEffect(() => {
        if (!id) {
            setJob(null);
            setDescriptionTab("recruiter");
            return;
        }

        fetchDetail();
    }, [fetchDetail]);

    const handleEdit = () => {
        setIsEditModalOpen(true);
    };

    const handleEditSuccess = () => {
        setIsEditModalOpen(false);
        fetchDetail(); // Refresh job data after edit
    };

    if (!id) {
        return (
            <div className="hidden md:flex flex-1 items-center justify-center text-base-content/30 bg-base-100">
                <div className="text-center">
                    <i className="fa-duotone fa-briefcase text-6xl mb-4 opacity-50" />
                    <p className="text-lg">Select a role to view details</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex-1 flex flex-col bg-base-100">
                <div className="h-20 border-b border-base-300 animate-pulse bg-base-200/50" />
                <div className="p-8 space-y-4">
                    <div className="h-8 w-1/3 bg-base-200 rounded animate-pulse" />
                    <div className="h-4 w-full bg-base-200 rounded animate-pulse" />
                    <div className="h-4 w-2/3 bg-base-200 rounded animate-pulse" />
                </div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="flex-1 flex items-center justify-center bg-base-100">
                <div className="text-center max-w-md p-6">
                    <div className="alert alert-error">
                        <i className="fa-duotone fa-regular fa-circle-exclamation" />
                        <span>{error || "Role not found"}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost mt-4 md:hidden"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-base-100 w-full overflow-hidden">
            <DetailHeader job={job} onClose={onClose} onEdit={handleEdit} />

            <div className="flex-1 overflow-y-auto">
                {/* Tabs */}
                <div
                    role="tablist"
                    className="tabs tabs-bordered w-full px-4 pt-2 overflow-x-auto"
                >
                    <a
                        role="tab"
                        className={`tab whitespace-nowrap ${activeTab === "overview" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("overview")}
                    >
                        <i className="fa-duotone fa-clipboard mr-2" />
                        Overview
                    </a>
                    <a
                        role="tab"
                        className={`tab whitespace-nowrap ${activeTab === "requirements" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("requirements")}
                    >
                        <i className="fa-duotone fa-list-check mr-2" />
                        Requirements
                        {job.requirements && job.requirements.length > 0 && (
                            <span className="badge badge-xs badge-primary ml-1">
                                {job.requirements.length}
                            </span>
                        )}
                    </a>
                    <a
                        role="tab"
                        className={`tab whitespace-nowrap ${activeTab === "prescreen" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("prescreen")}
                    >
                        <i className="fa-duotone fa-clipboard-question mr-2" />
                        Pre-Screen
                        {job.pre_screen_questions &&
                            job.pre_screen_questions.length > 0 && (
                                <span className="badge badge-xs badge-secondary ml-1">
                                    {job.pre_screen_questions.length}
                                </span>
                            )}
                    </a>
                    <a
                        role="tab"
                        className={`tab whitespace-nowrap ${activeTab === "financials" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("financials")}
                    >
                        <i className="fa-duotone fa-dollar-sign mr-2" />
                        Financials
                    </a>
                    <a
                        role="tab"
                        className={`tab whitespace-nowrap ${activeTab === "company" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("company")}
                    >
                        <i className="fa-duotone fa-building mr-2" />
                        Company
                    </a>
                </div>

                {/* Content */}
                <div className="p-6 max-w-4xl">
                    {activeTab === "overview" && (
                        <div className="space-y-8">
                            {/* Job Metadata */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold">
                                        Job Details
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`badge ${
                                                job.status === "active"
                                                    ? "badge-success"
                                                    : job.status === "paused"
                                                      ? "badge-warning"
                                                      : job.status === "closed"
                                                        ? "badge-error"
                                                        : "badge-neutral"
                                            }`}
                                        >
                                            <i className="fa-duotone fa-circle-dot mr-1" />
                                            {job.status
                                                ? job.status
                                                      .charAt(0)
                                                      .toUpperCase() +
                                                  job.status.slice(1)
                                                : "Active"}
                                        </span>
                                        {job.created_at && (
                                            <span className="text-xs text-base-content/60">
                                                Posted{" "}
                                                {new Date(
                                                    job.created_at,
                                                ).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {job.department && (
                                        <div className="bg-base-200/50 p-3 rounded-lg">
                                            <div className="text-xs text-base-content/60 mb-1">
                                                <i className="fa-duotone fa-sitemap mr-1" />
                                                Department
                                            </div>
                                            <div className="font-medium">
                                                {job.department}
                                            </div>
                                        </div>
                                    )}
                                    <div className="bg-base-200/50 p-3 rounded-lg">
                                        <div className="text-xs text-base-content/60 mb-1">
                                            <i className="fa-duotone fa-briefcase mr-1" />
                                            Employment Type
                                        </div>
                                        <div className="font-medium capitalize">
                                            {job.employment_type?.replace(
                                                "_",
                                                " ",
                                            ) || "Full Time"}
                                        </div>
                                    </div>
                                    <div className="bg-base-200/50 p-3 rounded-lg">
                                        <div className="text-xs text-base-content/60 mb-1">
                                            <i className="fa-duotone fa-location-arrow mr-1" />
                                            Workplace
                                        </div>
                                        <div className="font-medium">
                                            {job.open_to_relocation
                                                ? "Remote Available"
                                                : "Local Only"}
                                        </div>
                                    </div>
                                    {job.updated_at && (
                                        <div className="bg-base-200/50 p-3 rounded-lg">
                                            <div className="text-xs text-base-content/60 mb-1">
                                                <i className="fa-duotone fa-clock mr-1" />
                                                Last Updated
                                            </div>
                                            <div className="font-medium text-sm">
                                                {new Date(
                                                    job.updated_at,
                                                ).toLocaleDateString()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Job Descriptions */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold">
                                        <i className="fa-duotone fa-file-text mr-2" />
                                        Role Descriptions
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        {/* Desktop View Toggle */}
                                        <div className="hidden lg:flex items-center gap-2">
                                            <span className="text-xs text-base-content/60">
                                                View:
                                            </span>
                                            <div className="bg-base-200/50 p-1 rounded">
                                                <button
                                                    onClick={() =>
                                                        setDescriptionTab(
                                                            "recruiter",
                                                        )
                                                    }
                                                    className={`px-2 py-1 rounded text-xs ${
                                                        descriptionTab ===
                                                        "recruiter"
                                                            ? "bg-base-100 shadow-sm"
                                                            : "hover:bg-base-100/50"
                                                    }`}
                                                >
                                                    Recruiter
                                                </button>
                                                {job.candidate_description &&
                                                    job.candidate_description !==
                                                        job.recruiter_description && (
                                                        <button
                                                            onClick={() =>
                                                                setDescriptionTab(
                                                                    "candidate",
                                                                )
                                                            }
                                                            className={`px-2 py-1 rounded text-xs ${
                                                                descriptionTab ===
                                                                "candidate"
                                                                    ? "bg-base-100 shadow-sm"
                                                                    : "hover:bg-base-100/50"
                                                            }`}
                                                        >
                                                            Candidate
                                                        </button>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile Tabs */}
                                <div className="lg:hidden">
                                    <div className="bg-base-200/50 p-1 rounded-lg mb-4 inline-flex">
                                        <button
                                            onClick={() =>
                                                setDescriptionTab("recruiter")
                                            }
                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                                descriptionTab === "recruiter"
                                                    ? "bg-base-100 text-base-content shadow-sm"
                                                    : "text-base-content/60 hover:text-base-content"
                                            }`}
                                        >
                                            <i className="fa-duotone fa-user-tie mr-2" />
                                            Recruiter View
                                        </button>
                                        {job.candidate_description &&
                                            job.candidate_description !==
                                                job.recruiter_description && (
                                                <button
                                                    onClick={() =>
                                                        setDescriptionTab(
                                                            "candidate",
                                                        )
                                                    }
                                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                                        descriptionTab ===
                                                        "candidate"
                                                            ? "bg-base-100 text-base-content shadow-sm"
                                                            : "text-base-content/60 hover:text-base-content"
                                                    }`}
                                                >
                                                    <i className="fa-duotone fa-user mr-2" />
                                                    Candidate View
                                                </button>
                                            )}
                                    </div>
                                </div>

                                {/* Desktop Side-by-Side / Mobile Tabbed */}
                                <div
                                    className={`${
                                        job.candidate_description &&
                                        job.candidate_description !==
                                            job.recruiter_description
                                            ? "hidden lg:grid lg:grid-cols-2 lg:gap-6"
                                            : ""
                                    }`}
                                >
                                    {/* Recruiter Description - Always show on desktop if both exist */}
                                    {job.candidate_description &&
                                    job.candidate_description !==
                                        job.recruiter_description ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 mb-3">
                                                <i className="fa-duotone fa-user-tie text-primary" />
                                                <h4 className="font-semibold text-sm text-base-content/80">
                                                    Recruiter View
                                                </h4>
                                                <span className="text-xs text-base-content/50">
                                                    (
                                                    {Math.ceil(
                                                        (
                                                            job.recruiter_description ||
                                                            job.description ||
                                                            ""
                                                        ).length / 5,
                                                    )}{" "}
                                                    words)
                                                </span>
                                            </div>
                                            <div className="bg-base-100 rounded-lg border border-base-300 max-h-80 overflow-y-auto">
                                                <div className="p-4 whitespace-pre-wrap text-sm leading-relaxed">
                                                    {job.recruiter_description ||
                                                        job.description}
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}

                                    {/* Candidate Description - Always show on desktop if both exist */}
                                    {job.candidate_description &&
                                    job.candidate_description !==
                                        job.recruiter_description ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 mb-3">
                                                <i className="fa-duotone fa-user text-secondary" />
                                                <h4 className="font-semibold text-sm text-base-content/80">
                                                    Candidate View
                                                </h4>
                                                <span className="text-xs text-base-content/50">
                                                    (
                                                    {Math.ceil(
                                                        job
                                                            .candidate_description
                                                            .length / 5,
                                                    )}{" "}
                                                    words)
                                                </span>
                                            </div>
                                            <div className="bg-base-100 rounded-lg border border-base-300 max-h-80 overflow-y-auto">
                                                <div className="p-4 whitespace-pre-wrap text-sm leading-relaxed">
                                                    {job.candidate_description}
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>

                                {/* Mobile Single View / Single Description View */}
                                <div
                                    className={`${
                                        job.candidate_description &&
                                        job.candidate_description !==
                                            job.recruiter_description
                                            ? "lg:hidden"
                                            : ""
                                    }`}
                                >
                                    {descriptionTab === "recruiter" && (
                                        <div className="space-y-3">
                                            <div className="bg-base-100 rounded-lg border border-base-300 max-h-96 overflow-y-auto">
                                                {job.recruiter_description ||
                                                job.description ? (
                                                    <div className="p-4 whitespace-pre-wrap text-sm leading-relaxed">
                                                        {job.recruiter_description ||
                                                            job.description}
                                                    </div>
                                                ) : (
                                                    <div className="p-8 text-center text-base-content/60">
                                                        <i className="fa-duotone fa-file-slash text-3xl mb-3 block opacity-50" />
                                                        <p className="text-sm">
                                                            No recruiter
                                                            description provided
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {descriptionTab === "candidate" &&
                                        job.candidate_description && (
                                            <div className="space-y-3">
                                                <div className="bg-base-100 rounded-lg border border-base-300 max-h-96 overflow-y-auto">
                                                    <div className="p-4 whitespace-pre-wrap text-sm leading-relaxed">
                                                        {
                                                            job.candidate_description
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                    {/* Single description (no candidate description) */}
                                    {(!job.candidate_description ||
                                        job.candidate_description ===
                                            job.recruiter_description) && (
                                        <div className="bg-base-100 rounded-lg border border-base-300 max-h-96 overflow-y-auto">
                                            {job.recruiter_description ||
                                            job.description ? (
                                                <div className="p-4 whitespace-pre-wrap text-sm leading-relaxed">
                                                    {job.recruiter_description ||
                                                        job.description}
                                                </div>
                                            ) : (
                                                <div className="p-8 text-center text-base-content/60">
                                                    <i className="fa-duotone fa-file-slash text-3xl mb-3 block opacity-50" />
                                                    <p className="text-sm">
                                                        No description provided
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Footer Stats */}
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-base-300/50 text-xs text-base-content/50">
                                    <div className="flex gap-4">
                                        <span>
                                            <i className="fa-duotone fa-scroll mr-1" />
                                            Content is scrollable
                                        </span>
                                        {job.candidate_description &&
                                            job.candidate_description !==
                                                job.recruiter_description && (
                                                <span className="hidden lg:inline">
                                                    <i className="fa-duotone fa-columns mr-1" />
                                                    Side-by-side on desktop
                                                </span>
                                            )}
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === "requirements" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold">
                                    <i className="fa-duotone fa-list-check mr-2" />
                                    Job Requirements
                                </h3>
                                {job.requirements && (
                                    <div className="flex gap-2">
                                        <span className="badge badge-primary">
                                            {
                                                job.requirements.filter(
                                                    (req) =>
                                                        req.requirement_type ===
                                                        "mandatory",
                                                ).length
                                            }{" "}
                                            required
                                        </span>
                                        <span className="badge badge-secondary">
                                            {
                                                job.requirements.filter(
                                                    (req) =>
                                                        req.requirement_type ===
                                                        "preferred",
                                                ).length
                                            }{" "}
                                            preferred
                                        </span>
                                    </div>
                                )}
                            </div>

                            {job.requirements && job.requirements.length > 0 ? (
                                <div className="space-y-6">
                                    {/* Required Requirements */}
                                    {job.requirements.filter(
                                        (req) =>
                                            req.requirement_type ===
                                            "mandatory",
                                    ).length > 0 && (
                                        <section>
                                            <h4 className="font-semibold text-base mb-3 flex items-center">
                                                <i className="fa-duotone fa-exclamation-circle text-error mr-2" />
                                                Required Qualifications
                                            </h4>
                                            <div className="space-y-2">
                                                {job.requirements
                                                    .filter(
                                                        (req) =>
                                                            req.requirement_type ===
                                                            "mandatory",
                                                    )
                                                    .sort(
                                                        (a, b) =>
                                                            (a.sort_order ||
                                                                0) -
                                                            (b.sort_order || 0),
                                                    )
                                                    .map((req) => (
                                                        <div
                                                            key={req.id}
                                                            className="flex items-start gap-3 p-3 bg-error/5 border border-error/20 rounded-lg"
                                                        >
                                                            <i className="fa-duotone fa-circle-check text-error mt-1 text-sm" />
                                                            <div className="flex-1">
                                                                <p className="font-medium text-base-content">
                                                                    {
                                                                        req.description
                                                                    }
                                                                </p>
                                                            </div>
                                                            <span className="badge badge-error badge-xs">
                                                                Required
                                                            </span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* Preferred Requirements */}
                                    {job.requirements.filter(
                                        (req) =>
                                            req.requirement_type ===
                                            "preferred",
                                    ).length > 0 && (
                                        <section>
                                            <h4 className="font-semibold text-base mb-3 flex items-center">
                                                <i className="fa-duotone fa-star text-warning mr-2" />
                                                Preferred Qualifications
                                            </h4>
                                            <div className="space-y-2">
                                                {job.requirements
                                                    .filter(
                                                        (req) =>
                                                            req.requirement_type ===
                                                            "preferred",
                                                    )
                                                    .sort(
                                                        (a, b) =>
                                                            (a.sort_order ||
                                                                0) -
                                                            (b.sort_order || 0),
                                                    )
                                                    .map((req) => (
                                                        <div
                                                            key={req.id}
                                                            className="flex items-start gap-3 p-3 bg-warning/5 border border-warning/20 rounded-lg"
                                                        >
                                                            <i className="fa-duotone fa-star text-warning mt-1 text-sm" />
                                                            <div className="flex-1">
                                                                <p className="text-base-content/80">
                                                                    {
                                                                        req.description
                                                                    }
                                                                </p>
                                                            </div>
                                                            <span className="badge badge-warning badge-xs">
                                                                Preferred
                                                            </span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* Other Requirements */}
                                    {job.requirements.filter(
                                        (req) =>
                                            !req.requirement_type ||
                                            (req.requirement_type !==
                                                "mandatory" &&
                                                req.requirement_type !==
                                                    "preferred"),
                                    ).length > 0 && (
                                        <section>
                                            <h4 className="font-semibold text-base mb-3 flex items-center">
                                                <i className="fa-duotone fa-list text-neutral mr-2" />
                                                Additional Requirements
                                            </h4>
                                            <div className="space-y-2">
                                                {job.requirements
                                                    .filter(
                                                        (req) =>
                                                            !req.requirement_type ||
                                                            (req.requirement_type !==
                                                                "mandatory" &&
                                                                req.requirement_type !==
                                                                    "preferred"),
                                                    )
                                                    .sort(
                                                        (a, b) =>
                                                            (a.sort_order ||
                                                                0) -
                                                            (b.sort_order || 0),
                                                    )
                                                    .map((req) => (
                                                        <div
                                                            key={req.id}
                                                            className="flex items-start gap-3 p-3 bg-base-200/30 border border-base-300/50 rounded-lg"
                                                        >
                                                            <i className="fa-duotone fa-circle-dot text-neutral mt-1 text-sm" />
                                                            <div className="flex-1">
                                                                <p className="text-base-content/80">
                                                                    {
                                                                        req.description
                                                                    }
                                                                </p>
                                                            </div>
                                                            <span className="badge badge-neutral badge-xs">
                                                                General
                                                            </span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </section>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-base-content/30 mb-4">
                                        <i className="fa-duotone fa-list-check text-6xl" />
                                    </div>
                                    <p className="text-base-content/60 mb-2">
                                        No specific requirements listed
                                    </p>
                                    <p className="text-base-content/50 text-sm">
                                        This role may have general
                                        qualifications that will be discussed
                                        during the interview process.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "financials" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="card bg-base-200 shadow-sm border border-base-300">
                                    <div className="card-body p-4">
                                        <h3 className="card-title text-base">
                                            Compensation
                                        </h3>
                                        <div className="text-2xl font-bold font-mono text-success">
                                            {job.salary_min && job.salary_max
                                                ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
                                                : "DOE"}
                                        </div>
                                        <p className="text-xs text-base-content/60">
                                            Annual Salary
                                        </p>
                                    </div>
                                </div>

                                <div className="card bg-base-200 shadow-sm border border-base-300">
                                    <div className="card-body p-4">
                                        <h3 className="card-title text-base">
                                            Placement Fee
                                        </h3>
                                        <div className="text-2xl font-bold font-mono text-primary">
                                            {job.fee_percentage}%
                                        </div>
                                        <p className="text-xs text-base-content/60">
                                            of first year salary
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="alert alert-info bg-info/10 text-base-content border-info/20">
                                <i className="fa-duotone fa-shield-check text-info" />
                                <div>
                                    <h4 className="font-bold">
                                        Placement Guarantee
                                    </h4>
                                    <p className="text-sm">
                                        This role has a{" "}
                                        {job.guarantee_days || 90} day guarantee
                                        period.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "prescreen" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold">
                                    <i className="fa-duotone fa-clipboard-question mr-2" />
                                    Pre-Screen Questions
                                </h3>
                                {job.pre_screen_questions && (
                                    <span className="badge badge-secondary">
                                        {job.pre_screen_questions.length}{" "}
                                        question
                                        {job.pre_screen_questions.length !== 1
                                            ? "s"
                                            : ""}
                                    </span>
                                )}
                            </div>

                            {job.pre_screen_questions &&
                            job.pre_screen_questions.length > 0 ? (
                                <div className="space-y-4">
                                    {job.pre_screen_questions
                                        .sort(
                                            (a, b) =>
                                                (a.sort_order || 0) -
                                                (b.sort_order || 0),
                                        )
                                        .map((question, index) => (
                                            <div
                                                key={question.id}
                                                className="card bg-base-100 shadow-sm border border-base-300"
                                            >
                                                <div className="card-body p-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="badge badge-neutral">
                                                                {index + 1}
                                                            </span>
                                                            {question.is_required && (
                                                                <span className="badge badge-error badge-sm">
                                                                    Required
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="font-medium text-base-content mb-2">
                                                                {
                                                                    question.question
                                                                }
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <span className="badge badge-ghost badge-xs">
                                                                    <i
                                                                        className={`fa-duotone ${
                                                                            question.question_type ===
                                                                            "text"
                                                                                ? "fa-font"
                                                                                : question.question_type ===
                                                                                    "textarea"
                                                                                  ? "fa-align-left"
                                                                                  : question.question_type ===
                                                                                      "select"
                                                                                    ? "fa-list"
                                                                                    : question.question_type ===
                                                                                        "radio"
                                                                                      ? "fa-circle-dot"
                                                                                      : question.question_type ===
                                                                                          "checkbox"
                                                                                        ? "fa-square-check"
                                                                                        : question.question_type ===
                                                                                            "file"
                                                                                          ? "fa-file"
                                                                                          : "fa-question"
                                                                        } mr-1`}
                                                                    />
                                                                    {question.question_type
                                                                        ? question.question_type
                                                                              .charAt(
                                                                                  0,
                                                                              )
                                                                              .toUpperCase() +
                                                                          question.question_type.slice(
                                                                              1,
                                                                          )
                                                                        : "Text"}
                                                                </span>
                                                                {!question.is_required && (
                                                                    <span className="text-base-content/60">
                                                                        Optional
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Show options for select/radio/checkbox */}
                                                            {question.options &&
                                                                Array.isArray(
                                                                    question.options,
                                                                ) &&
                                                                question.options
                                                                    .length >
                                                                    0 && (
                                                                    <div className="mt-3">
                                                                        <div className="text-xs text-base-content/60 mb-2">
                                                                            Options:
                                                                        </div>
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {question.options.map(
                                                                                (
                                                                                    option,
                                                                                    optIndex,
                                                                                ) => (
                                                                                    <span
                                                                                        key={
                                                                                            optIndex
                                                                                        }
                                                                                        className="badge badge-outline badge-xs"
                                                                                    >
                                                                                        {typeof option ===
                                                                                        "string"
                                                                                            ? option
                                                                                            : typeof option ===
                                                                                                    "object" &&
                                                                                                option !==
                                                                                                    null
                                                                                              ? (
                                                                                                    option as any
                                                                                                )
                                                                                                    ?.label ||
                                                                                                (
                                                                                                    option as any
                                                                                                )
                                                                                                    ?.value ||
                                                                                                JSON.stringify(
                                                                                                    option,
                                                                                                )
                                                                                              : String(
                                                                                                    option,
                                                                                                )}
                                                                                    </span>
                                                                                ),
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-base-content/30 mb-4">
                                        <i className="fa-duotone fa-clipboard-question text-6xl" />
                                    </div>
                                    <p className="text-base-content/60 mb-2">
                                        No pre-screen questions configured
                                    </p>
                                    <p className="text-base-content/50 text-sm">
                                        Candidates can apply directly without
                                        additional screening.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "company" && (
                        <div className="space-y-8">
                            {job.company ? (
                                <>
                                    {/* Company Header */}
                                    <section>
                                        <div className="flex items-start gap-4">
                                            {job.company.logo_url && (
                                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-base-200 flex-shrink-0">
                                                    <img
                                                        src={
                                                            job.company.logo_url
                                                        }
                                                        alt={`${job.company.name} logo`}
                                                        className="w-full h-full object-contain"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display =
                                                                "none";
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <h3 className="text-2xl font-bold mb-2">
                                                    {job.company.name}
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {job.company.industry && (
                                                        <span className="badge badge-primary">
                                                            <i className="fa-duotone fa-industry mr-1" />
                                                            {
                                                                job.company
                                                                    .industry
                                                            }
                                                        </span>
                                                    )}
                                                    {job.company
                                                        .company_size && (
                                                        <span className="badge badge-secondary">
                                                            <i className="fa-duotone fa-users mr-1" />
                                                            {
                                                                job.company
                                                                    .company_size
                                                            }
                                                        </span>
                                                    )}
                                                    {job.company
                                                        .headquarters_location && (
                                                        <span className="badge badge-accent">
                                                            <i className="fa-duotone fa-location-dot mr-1" />
                                                            {
                                                                job.company
                                                                    .headquarters_location
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                                {job.company.website && (
                                                    <div className="mt-3">
                                                        <a
                                                            href={
                                                                job.company.website.startsWith(
                                                                    "http",
                                                                )
                                                                    ? job
                                                                          .company
                                                                          .website
                                                                    : `https://${job.company.website}`
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="link link-primary"
                                                        >
                                                            <i className="fa-duotone fa-external-link mr-1" />
                                                            Visit Website
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </section>

                                    {/* Company Details Grid */}
                                    <section>
                                        <h4 className="text-lg font-bold mb-4">
                                            <i className="fa-duotone fa-info-circle mr-2" />
                                            Company Details
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="card bg-base-100 shadow-sm border border-base-300">
                                                <div className="card-body p-4">
                                                    <h5 className="font-semibold mb-2">
                                                        <i className="fa-duotone fa-industry mr-2 text-primary" />
                                                        Industry
                                                    </h5>
                                                    <p className="text-base-content/80">
                                                        {job.company.industry ||
                                                            "Not specified"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="card bg-base-100 shadow-sm border border-base-300">
                                                <div className="card-body p-4">
                                                    <h5 className="font-semibold mb-2">
                                                        <i className="fa-duotone fa-users mr-2 text-secondary" />
                                                        Company Size
                                                    </h5>
                                                    <p className="text-base-content/80">
                                                        {job.company
                                                            .company_size ||
                                                            "Not specified"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="card bg-base-100 shadow-sm border border-base-300">
                                                <div className="card-body p-4">
                                                    <h5 className="font-semibold mb-2">
                                                        <i className="fa-duotone fa-location-dot mr-2 text-accent" />
                                                        Headquarters
                                                    </h5>
                                                    <p className="text-base-content/80">
                                                        {job.company
                                                            .headquarters_location ||
                                                            "Not specified"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="card bg-base-100 shadow-sm border border-base-300">
                                                <div className="card-body p-4">
                                                    <h5 className="font-semibold mb-2">
                                                        <i className="fa-duotone fa-globe mr-2 text-info" />
                                                        Website
                                                    </h5>
                                                    {job.company.website ? (
                                                        <a
                                                            href={
                                                                job.company.website.startsWith(
                                                                    "http",
                                                                )
                                                                    ? job
                                                                          .company
                                                                          .website
                                                                    : `https://${job.company.website}`
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="link link-info break-all"
                                                        >
                                                            {
                                                                job.company
                                                                    .website
                                                            }
                                                        </a>
                                                    ) : (
                                                        <p className="text-base-content/60">
                                                            Not provided
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Company Description */}
                                    {job.company.description && (
                                        <section>
                                            <h4 className="text-lg font-bold mb-3">
                                                <i className="fa-duotone fa-building mr-2" />
                                                About {job.company.name}
                                            </h4>
                                            <div className="prose prose-sm max-w-none text-base-content/80">
                                                <div className="bg-base-100 p-6 rounded-lg border border-base-300">
                                                    {job.company.description}
                                                </div>
                                            </div>
                                        </section>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-base-content/30 mb-4">
                                        <i className="fa-duotone fa-building text-6xl" />
                                    </div>
                                    <p className="text-base-content/60 mb-2">
                                        Company information not available
                                    </p>
                                    <p className="text-base-content/50 text-sm">
                                        This role may be from a confidential
                                        company or the company details haven't
                                        been provided yet.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Role Modal */}
            {job && (
                <AddRoleWizardModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={handleEditSuccess}
                    jobId={job.id}
                    mode="edit"
                />
            )}
        </div>
    );
}
