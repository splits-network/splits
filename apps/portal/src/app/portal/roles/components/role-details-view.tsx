"use client";

import { useState } from "react";
import { formatRelativeTime } from "@/lib/utils/date-formatting";
import { LoadingState } from "@splits-network/shared-ui";

// ===== TYPES =====

interface RoleDetailsViewProps {
    job: Job;
    loading?: boolean;
    compact?: boolean;
    tabbed?: boolean; // Use tabs to organize sections
    showSections?: {
        quickStats?: boolean;
        descriptions?: boolean;
        requirements?: boolean;
        preScreen?: boolean;
        financials?: boolean;
        company?: boolean;
    };
    onRefresh?: () => void;
}

interface Job {
    id: string;
    title: string | null;
    company_id: string | null;
    company?: Company;
    location?: string | null;
    department?: string | null;
    employment_type?: "full_time" | "contract" | "temporary" | string | null;
    salary_min?: number | null;
    salary_max?: number | null;
    salary_currency?: string | null;
    show_salary_range?: boolean | null;
    open_to_relocation?: boolean | null;
    fee_percentage: number | null;
    splits_fee_percentage?: number | null;
    status: "active" | "paused" | "filled" | "closed" | string | null;
    guarantee_days?: number | null;
    recruiter_description?: string | null;
    candidate_description?: string | null;
    description?: string | null;
    requirements?: JobRequirement[];
    pre_screen_questions?: JobPreScreenQuestion[];
    created_at: string | Date | null;
    updated_at?: string | Date | null;
    application_count?: number | null;
    [key: string]: any;
}

interface Company {
    id?: string;
    name: string | null;
    industry?: string | null;
    company_size?: string | null;
    headquarters_location?: string | null;
    logo_url?: string | null;
    description?: string | null;
    website?: string | null;
    [key: string]: any;
}

interface JobRequirement {
    id: string;
    requirement_type: "mandatory" | "preferred" | string | null;
    description: string | null;
    sort_order?: number | null;
    [key: string]: any;
}

interface JobPreScreenQuestion {
    id: string;
    question: string | null;
    question_type?: string | null;
    options?: any;
    is_required?: boolean | null;
    sort_order?: number | null;
    [key: string]: any;
}

// ===== HELPER UTILITIES =====

function getQuestionTypeIcon(type: string): string {
    const iconMap: Record<string, string> = {
        text: "fa-font",
        textarea: "fa-align-left",
        select: "fa-list",
        radio: "fa-circle-dot",
        checkbox: "fa-square-check",
        file: "fa-file",
        multi_select: "fa-list-check",
    };
    return iconMap[type] || "fa-question";
}

function formatQuestionType(type: string): string {
    if (!type) return "Text";
    return type.charAt(0).toUpperCase() + type.slice(1);
}

// ===== MAIN COMPONENT =====

export default function RoleDetailsView({
    job,
    loading = false,
    compact = false,
    tabbed = false,
    showSections = {},
    onRefresh,
}: RoleDetailsViewProps) {
    const [descriptionTab, setDescriptionTab] = useState<
        "recruiter" | "candidate"
    >("recruiter");
    const [activeTab, setActiveTab] = useState<
        "overview" | "requirements" | "prescreen" | "financials" | "company"
    >("overview");

    // Section visibility logic
    const sections = {
        quickStats: showSections.quickStats !== false,
        descriptions: showSections.descriptions !== false,
        requirements: showSections.requirements !== false,
        preScreen: showSections.preScreen !== false,
        financials: showSections.financials !== false,
        company: showSections.company !== false,
    };

    // Spacing based on compact mode
    const spacing = compact ? "space-y-4" : "space-y-6";

    if (loading) {
        return <LoadingState message="Loading role details..." />;
    }

    // Tabbed layout (for sidebar)
    if (tabbed) {
        return (
            <div>
                <div className="overflow-x-auto">
                    {/* Tabs */}
                    <div
                        role="tablist"
                        className="tabs tabs-lift min-w-max mb-4"
                    >
                        <a
                            role="tab"
                            className={`tab ${activeTab === "overview" ? "tab-active" : ""}`}
                            onClick={() => setActiveTab("overview")}
                        >
                            <i className="fa-duotone fa-clipboard mr-2" />
                            Overview
                        </a>
                        {sections.requirements &&
                            job.requirements &&
                            job.requirements.length > 0 && (
                                <a
                                    role="tab"
                                    className={`tab ${activeTab === "requirements" ? "tab-active" : ""}`}
                                    onClick={() => setActiveTab("requirements")}
                                >
                                    <i className="fa-duotone fa-list-check mr-2" />
                                    Requirements
                                    <span className="badge badge-xs badge-primary ml-1">
                                        {job.requirements.length}
                                    </span>
                                </a>
                            )}
                        {sections.preScreen &&
                            job.pre_screen_questions &&
                            job.pre_screen_questions.length > 0 && (
                                <a
                                    role="tab"
                                    className={`tab ${activeTab === "prescreen" ? "tab-active" : ""}`}
                                    onClick={() => setActiveTab("prescreen")}
                                >
                                    <i className="fa-duotone fa-clipboard-question mr-2" />
                                    Pre-Screen
                                    <span className="badge badge-xs badge-secondary ml-1">
                                        {job.pre_screen_questions.length}
                                    </span>
                                </a>
                            )}
                        {sections.financials && (
                            <a
                                role="tab"
                                className={`tab ${activeTab === "financials" ? "tab-active" : ""}`}
                                onClick={() => setActiveTab("financials")}
                            >
                                <i className="fa-duotone fa-dollar-sign mr-2" />
                                Financials
                            </a>
                        )}
                        {sections.company && job.company && (
                            <a
                                role="tab"
                                className={`tab ${activeTab === "company" ? "tab-active" : ""}`}
                                onClick={() => setActiveTab("company")}
                            >
                                <i className="fa-duotone fa-building mr-2" />
                                Company
                            </a>
                        )}
                    </div>
                </div>

                {/* Tab Content */}
                <div className={spacing}>
                    {activeTab === "overview" && (
                        <>
                            {sections.quickStats && (
                                <QuickStatsSection
                                    job={job}
                                    compact={compact}
                                />
                            )}
                            {sections.descriptions && (
                                <DescriptionsSection
                                    job={job}
                                    compact={compact}
                                    activeTab={descriptionTab}
                                    onTabChange={setDescriptionTab}
                                />
                            )}
                        </>
                    )}

                    {activeTab === "requirements" &&
                        sections.requirements &&
                        job.requirements &&
                        job.requirements.length > 0 && (
                            <RequirementsSection job={job} compact={compact} />
                        )}

                    {activeTab === "prescreen" &&
                        sections.preScreen &&
                        job.pre_screen_questions &&
                        job.pre_screen_questions.length > 0 && (
                            <PreScreenSection job={job} compact={compact} />
                        )}

                    {activeTab === "financials" && sections.financials && (
                        <FinancialsSection job={job} compact={compact} />
                    )}

                    {activeTab === "company" &&
                        sections.company &&
                        job.company && (
                            <CompanySection job={job} compact={compact} />
                        )}
                </div>
            </div>
        );
    }

    // Non-tabbed layout (for browse panel)
    return (
        <div className={spacing}>
            {/* Quick Stats Section */}
            {sections.quickStats && (
                <QuickStatsSection job={job} compact={compact} />
            )}

            {/* Descriptions Section */}
            {sections.descriptions && (
                <DescriptionsSection
                    job={job}
                    compact={compact}
                    activeTab={descriptionTab}
                    onTabChange={setDescriptionTab}
                />
            )}

            {/* Requirements Section */}
            {sections.requirements &&
                job.requirements &&
                job.requirements.length > 0 && (
                    <RequirementsSection job={job} compact={compact} />
                )}

            {/* Pre-Screen Questions Section */}
            {sections.preScreen &&
                job.pre_screen_questions &&
                job.pre_screen_questions.length > 0 && (
                    <PreScreenSection job={job} compact={compact} />
                )}

            {/* Financials Section */}
            {sections.financials && (
                <FinancialsSection job={job} compact={compact} />
            )}

            {/* Company Section */}
            {sections.company && job.company && (
                <CompanySection job={job} compact={compact} />
            )}
        </div>
    );
}

// ===== SECTION COMPONENTS =====

// 1. Quick Stats Section
function QuickStatsSection({ job, compact }: { job: Job; compact: boolean }) {
    return (
        <section className={compact ? "space-y-2" : "space-y-3"}>
            <h3 className="text-base font-bold flex items-center gap-2">
                <i className="fa-duotone fa-chart-simple text-primary" />
                Quick Stats
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Location Card */}
                {job.location && (
                    <div className="bg-base-200/50 p-3 rounded-lg">
                        <div className=" text-base-content/60 mb-1">
                            <i className="fa-duotone fa-location-dot mr-1" />
                            Location
                        </div>
                        <div className="font-medium text-sm">
                            {job.location}
                        </div>
                    </div>
                )}

                {/* Employment Type Card */}
                <div className="bg-base-200/50 p-3 rounded-lg">
                    <div className=" text-base-content/60 mb-1">
                        <i className="fa-duotone fa-briefcase mr-1" />
                        Employment Type
                    </div>
                    <div className="font-medium text-sm capitalize">
                        {job.employment_type?.replace("_", " ") || "Full Time"}
                    </div>
                </div>

                {/* Department Card */}
                {job.department && (
                    <div className="bg-base-200/50 p-3 rounded-lg">
                        <div className=" text-base-content/60 mb-1">
                            <i className="fa-duotone fa-sitemap mr-1" />
                            Department
                        </div>
                        <div className="font-medium text-sm">
                            {job.department}
                        </div>
                    </div>
                )}

                {/* Salary Range Card */}
                {job.show_salary_range && job.salary_min && job.salary_max && (
                    <div className="bg-base-200/50 p-3 rounded-lg">
                        <div className=" text-base-content/60 mb-1">
                            <i className="fa-duotone fa-dollar-sign mr-1" />
                            Salary Range
                        </div>
                        <div className="font-medium text-sm font-mono">
                            ${(job.salary_min / 1000).toFixed(0)}k - $
                            {(job.salary_max / 1000).toFixed(0)}k
                        </div>
                    </div>
                )}

                {/* Fee Card */}
                <div className="bg-base-200/50 p-3 rounded-lg">
                    <div className=" text-base-content/60 mb-1">
                        <i className="fa-duotone fa-percent mr-1" />
                        Placement Fee
                    </div>
                    <div className="font-medium text-sm">
                        {job.fee_percentage}%
                    </div>
                </div>

                {/* Posted Date Card */}
                <div className="bg-base-200/50 p-3 rounded-lg">
                    <div className=" text-base-content/60 mb-1">
                        <i className="fa-duotone fa-calendar mr-1" />
                        Posted
                    </div>
                    <div className="font-medium text-sm">
                        {job.created_at ? formatRelativeTime(job.created_at) : "N/A"}
                    </div>
                </div>

                {/* Relocation Card */}
                <div className="bg-base-200/50 p-3 rounded-lg">
                    <div className=" text-base-content/60 mb-1">
                        <i className="fa-duotone fa-plane mr-1" />
                        Relocation
                    </div>
                    <div className="font-medium text-sm">
                        {job.open_to_relocation ? "Available" : "Not Available"}
                    </div>
                </div>
            </div>
        </section>
    );
}

// 2. Descriptions Section
function DescriptionsSection({
    job,
    compact,
    activeTab,
    onTabChange,
}: {
    job: Job;
    compact: boolean;
    activeTab: "recruiter" | "candidate";
    onTabChange: (tab: "recruiter" | "candidate") => void;
}) {
    const hasBothDescriptions =
        job.candidate_description &&
        job.candidate_description !== job.recruiter_description &&
        job.candidate_description !== job.description;

    return (
        <section className={compact ? "space-y-2" : "space-y-3"}>
            {/* Tabs */}
            <div className="overflow-x-auto">
                <div role="tablist" className="tabs tabs-lift min-w-max">
                    <a
                        role="tab"
                        className={`tab ${activeTab === "recruiter" ? "tab-active" : ""}`}
                        onClick={() => onTabChange("recruiter")}
                    >
                        <i className="fa-duotone fa-user-tie mr-2" />
                        Recruiter View
                    </a>
                    {hasBothDescriptions && (
                        <a
                            role="tab"
                            className={`tab ${activeTab === "candidate" ? "tab-active" : ""}`}
                            onClick={() => onTabChange("candidate")}
                        >
                            <i className="fa-duotone fa-user mr-2" />
                            Candidate View
                        </a>
                    )}
                </div>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === "recruiter" && (
                    <DescriptionBox
                        content={job.recruiter_description || job.description}
                        compact={compact}
                    />
                )}
                {activeTab === "candidate" && hasBothDescriptions && (
                    <DescriptionBox
                        content={job.candidate_description}
                        compact={compact}
                    />
                )}
                {/* Show recruiter description if no candidate description or same content */}
                {!hasBothDescriptions && activeTab === "candidate" && (
                    <DescriptionBox
                        content={job.recruiter_description || job.description}
                        compact={compact}
                    />
                )}
            </div>
        </section>
    );
}

// Helper component for description boxes
function DescriptionBox({
    title,
    icon,
    iconColor,
    content,
    compact,
}: {
    title?: string;
    icon?: string;
    iconColor?: string;
    content?: string | null;
    compact: boolean;
}) {
    const maxHeight = compact ? "max-h-60" : "max-h-80";

    return (
        <div className="space-y-2">
            {title && icon && iconColor && (
                <div className="flex items-center gap-2">
                    <i className={`fa-duotone ${icon} ${iconColor}`} />
                    <h4 className="font-semibold text-sm">{title}</h4>
                </div>
            )}
            <div className={`${maxHeight} overflow-y-auto`}>
                {content ? (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {content}
                    </div>
                ) : (
                    <div className="p-8 text-center text-base-content/60">
                        <i className="fa-duotone fa-file-slash text-3xl mb-3 block opacity-50" />
                        <p className="text-sm">No description provided</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// 3. Requirements Section
function RequirementsSection({ job, compact }: { job: Job; compact: boolean }) {
    const mandatoryReqs =
        job.requirements?.filter((r) => r.requirement_type === "mandatory") ||
        [];
    const preferredReqs =
        job.requirements?.filter((r) => r.requirement_type === "preferred") ||
        [];

    return (
        <section className={compact ? "space-y-3" : "space-y-4"}>
            <div className="flex items-center justify-between">
                <h3 className="text-base font-bold flex items-center gap-2">
                    <i className="fa-duotone fa-list-check text-primary" />
                    Requirements
                </h3>
                <div className="flex gap-2">
                    <span className="badge badge-error badge-soft">
                        {mandatoryReqs.length} required
                    </span>
                    <span className="badge badge-warning badge-soft">
                        {preferredReqs.length} preferred
                    </span>
                </div>
            </div>

            {/* Mandatory Requirements */}
            {mandatoryReqs.length > 0 && (
                <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                        <i className="fa-duotone fa-exclamation-circle text-error" />
                        Mandatory
                    </h4>
                    {mandatoryReqs
                        .sort(
                            (a, b) => (a.sort_order || 0) - (b.sort_order || 0),
                        )
                        .map((req) => (
                            <div
                                key={req.id}
                                className="flex items-start gap-3 p-3"
                            >
                                <i className="fa-duotone fa-circle-check text-error mt-0.5 text-sm" />
                                <p className="flex-1 text-sm">
                                    {req.description}
                                </p>
                            </div>
                        ))}
                </div>
            )}

            {/* Preferred Requirements */}
            {preferredReqs.length > 0 && (
                <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                        <i className="fa-duotone fa-star text-warning" />
                        Preferred
                    </h4>
                    {preferredReqs
                        .sort(
                            (a, b) => (a.sort_order || 0) - (b.sort_order || 0),
                        )
                        .map((req) => (
                            <div
                                key={req.id}
                                className="flex items-start gap-3 p-3"
                            >
                                <i className="fa-duotone fa-star text-warning mt-0.5 text-sm" />
                                <p className="flex-1 text-sm text-base-content/80">
                                    {req.description}
                                </p>
                            </div>
                        ))}
                </div>
            )}
        </section>
    );
}

// 4. Pre-Screen Questions Section
function PreScreenSection({ job, compact }: { job: Job; compact: boolean }) {
    return (
        <section className={compact ? "space-y-3" : "space-y-4"}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold flex items-center gap-2">
                    <i className="fa-duotone fa-clipboard-question text-primary" />
                    Pre-Screen Questions
                </h3>
                <span className="badge badge-secondary">
                    {job.pre_screen_questions?.length} question
                    {job.pre_screen_questions?.length !== 1 ? "s" : ""}
                </span>
            </div>

            <div className="space-y-3">
                {job.pre_screen_questions
                    ?.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                    .map((question, index) => (
                        <div
                            key={question.id}
                            className="flex items-start gap-3 p-4 bg-base-100 border border-base-300 rounded-lg"
                        >
                            {/* Question Number */}
                            <span className="badge badge-secondary badge-lg font-bold flex-shrink-0">
                                {index + 1}
                            </span>

                            {/* Question Content */}
                            <div className="flex-1 min-w-0">
                                {/* Badges Row */}
                                <div className="flex items-center gap-2 flex-wrap mb-2">
                                    {question.is_required && (
                                        <span className="badge badge-error badge-sm">
                                            <i className="fa-duotone fa-asterisk mr-1" />
                                            Required
                                        </span>
                                    )}
                                    <span className="badge badge-soft badge-info badge-sm">
                                        <i
                                            className={`fa-duotone ${getQuestionTypeIcon(question.question_type || "text")} mr-1`}
                                        />
                                        {formatQuestionType(
                                            question.question_type || "text",
                                        )}
                                    </span>
                                </div>

                                {/* Question Text */}
                                <p className="font-medium text-base mb-3">
                                    {question.question}
                                </p>

                                {/* Options */}
                                {question.options &&
                                    Array.isArray(question.options) &&
                                    question.options.length > 0 && (
                                        <div>
                                            <div className="text-sm font-semibold text-base-content/70 mb-2">
                                                Available Options:
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {question.options.map(
                                                    (option, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="badge badge-outline badge-info"
                                                        >
                                                            {typeof option ===
                                                            "string"
                                                                ? option
                                                                : (
                                                                      option as any
                                                                  )?.label ||
                                                                  (
                                                                      option as any
                                                                  )?.value ||
                                                                  String(
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
                    ))}
            </div>
        </section>
    );
}

// 5. Financials Section
function FinancialsSection({ job, compact }: { job: Job; compact: boolean }) {
    return (
        <section className={compact ? "space-y-3" : "space-y-4"}>
            <h3 className="text-base font-bold flex items-center gap-2">
                <i className="fa-duotone fa-dollar-sign text-primary" />
                Financials
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Compensation Card */}
                <div className="card bg-base-200 shadow-sm border border-base-300">
                    <div className="card-body p-4">
                        <h4 className="card-title text-sm mb-2">
                            Compensation
                        </h4>
                        <div className="text-xl font-bold font-mono text-success">
                            {job.salary_min && job.salary_max
                                ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
                                : "DOE"}
                        </div>
                        <p className=" text-base-content/60">Annual Salary</p>
                    </div>
                </div>

                {/* Placement Fee Card */}
                <div className="card bg-base-200 shadow-sm border border-base-300">
                    <div className="card-body p-4">
                        <h4 className="card-title text-sm mb-2">
                            Placement Fee
                        </h4>
                        <div className="text-xl font-bold font-mono text-primary">
                            {job.fee_percentage}%
                        </div>
                        <p className=" text-base-content/60">
                            of first year salary
                        </p>
                    </div>
                </div>
            </div>

            {/* Guarantee Info */}
            <div className="alert alert-info ">
                <i className="fa-duotone fa-shield-check fa-lg" />
                <div>
                    <h5 className="font-bold text-sm">Placement Guarantee</h5>
                    <p className="">
                        This role has a {job.guarantee_days || 90} day guarantee
                        period.
                    </p>
                </div>
            </div>
        </section>
    );
}

// 6. Company Section
function CompanySection({ job, compact }: { job: Job; compact: boolean }) {
    if (!job.company) return null;

    return (
        <section className={compact ? "space-y-3" : "space-y-4"}>
            <h3 className="text-base font-bold flex items-center gap-2">
                <i className="fa-duotone fa-building text-primary" />
                Company
            </h3>

            {/* Company Header */}
            <div className="flex items-start gap-3">
                {/* Logo - always show */}
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-base-200 flex-shrink-0 flex items-center justify-center">
                    {job.company.logo_url ? (
                        <img
                            src={job.company.logo_url}
                            alt={`${job.company.name} logo`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                e.currentTarget.style.display = "none";
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                    parent.innerHTML = '<i class="fa-duotone fa-building text-base-content/30"></i>';
                                }
                            }}
                        />
                    ) : (
                        <i className="fa-duotone fa-building text-base-content/30" />
                    )}
                </div>

                <div className="flex-1">
                    <h4 className="text-lg font-bold mb-2">
                        {job.company.name}
                    </h4>

                    {/* Company Info Badges - always show all */}
                    <div className="flex flex-wrap gap-2 mb-2">
                        {/* Industry */}
                        <span className={job.company.industry ? "badge badge-primary" : "badge badge-ghost"}>
                            <i className="fa-duotone fa-industry mr-1" />
                            {job.company.industry || "Not provided"}
                        </span>

                        {/* Company Size */}
                        <span className={job.company.company_size ? "badge badge-secondary" : "badge badge-ghost"}>
                            <i className="fa-duotone fa-users mr-1" />
                            {job.company.company_size || "Not provided"}
                        </span>

                        {/* Location */}
                        <span className={job.company.headquarters_location ? "badge badge-accent" : "badge badge-ghost"}>
                            <i className="fa-duotone fa-location-dot mr-1" />
                            {job.company.headquarters_location || "Not provided"}
                        </span>
                    </div>

                    {/* Website - always show */}
                    <div className="mt-2">
                        {job.company.website ? (
                            <a
                                href={
                                    job.company.website.startsWith("http")
                                        ? job.company.website
                                        : `https://${job.company.website}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link link-primary text-sm"
                            >
                                <i className="fa-duotone fa-external-link mr-1" />
                                Visit Website
                            </a>
                        ) : (
                            <span className="text-sm text-base-content/50">
                                <i className="fa-duotone fa-external-link mr-1" />
                                Website not provided
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Company Description - always show */}
            <div className="bg-base-100 p-4 rounded-lg border border-base-300">
                {job.company.description ? (
                    <p className="text-sm text-base-content/80 whitespace-pre-wrap">
                        {job.company.description}
                    </p>
                ) : (
                    <p className="text-sm text-base-content/50 text-center italic">
                        Company description not provided
                    </p>
                )}
            </div>
        </section>
    );
}
