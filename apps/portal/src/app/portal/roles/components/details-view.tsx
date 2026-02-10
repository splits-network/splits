"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { formatRelativeTime } from "@/lib/utils/date-formatting";
import { LoadingState } from "@splits-network/shared-ui";
import { useUserProfile, PlanTier } from "@/contexts/user-profile-context";
import { useCalculator } from "@/components/calculator/use-calculator";
import { FeeInput } from "@/components/calculator/fee-input";
import { RoleSelector } from "@/components/calculator/role-selector";
import { TierComparison } from "@/components/calculator/tier-comparison";
import { TIER_INFO } from "@/components/calculator/commission-rates";
import type { RecruiterRole, Tier } from "@/components/calculator/types";
import CompanyContacts from "@/components/company-contacts";

// ===== TYPES =====

interface DetailsViewProps {
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
    status: "active" | "paused" | "filled" | "closed" | string | null;
    // Role assignment fields (for payout calculator auto-detection)
    job_owner_recruiter_id?: string | null;
    company_recruiter_id?: string | null;
    candidate_recruiter_id?: string | null;
    candidate_sourcer_id?: string | null;
    company_sourcer_id?: string | null;
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
        yes_no: "fa-toggle-on",
        number: "fa-hashtag",
        date: "fa-calendar",
    };
    return iconMap[type] || "fa-question";
}

function formatQuestionType(type: string): string {
    if (!type) return "Text";
    const labelMap: Record<string, string> = {
        text: "Short Text",
        textarea: "Long Text",
        select: "Dropdown",
        radio: "Single Choice",
        checkbox: "Checkbox",
        file: "File Upload",
        multi_select: "Multi-Select",
        yes_no: "Yes / No",
        number: "Number",
        date: "Date",
    };
    return (
        labelMap[type] ||
        type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    );
}

// ===== MAIN COMPONENT =====

export default function DetailsView({
    job,
    loading = false,
    compact = false,
    tabbed = false,
    showSections = {},
    onRefresh,
}: DetailsViewProps) {
    const [descriptionTab, setDescriptionTab] = useState<
        "recruiter" | "candidate"
    >("recruiter");
    const [activeTab, setActiveTab] = useState<
        "overview" | "requirements" | "prescreen" | "financials" | "company"
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
            <div className="flex flex-col h-full min-h-0">
                <div className="flex-1 min-w-0 pb-4">
                    <div className="flex items-center gap-3 mb-2">
                        {job.company?.logo_url && (
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-base-200 flex-shrink-0">
                                <img
                                    src={job.company.logo_url}
                                    alt={`${job.company.name} logo`}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                    }}
                                />
                            </div>
                        )}

                        <h1 className="text-xl sm:text-2xl font-bold text-base-content line-clamp-1">
                            {job.title}
                        </h1>

                        <span
                            className={`badge badge-sm ${
                                job.status === "active"
                                    ? "badge-success"
                                    : job.status === "paused"
                                      ? "badge-warning"
                                      : job.status === "closed"
                                        ? "badge-error"
                                        : "badge-neutral"
                            }`}
                        >
                            {job.status
                                ? job.status.charAt(0).toUpperCase() +
                                  job.status.slice(1)
                                : "Active"}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-base-content/60 text-sm ml-12 md:ml-0">
                        <i className="fa-duotone fa-building" />
                        <span className="font-medium">
                            {job.company?.name || "Confidential Company"}
                        </span>
                        {job.location && (
                            <>
                                <span className="mx-1">•</span>
                                <i className="fa-duotone fa-location-dot" />
                                <span>{job.location}</span>
                            </>
                        )}
                        {job.department && (
                            <>
                                <span className="mx-1">•</span>
                                <i className="fa-duotone fa-sitemap" />
                                <span>{job.department}</span>
                            </>
                        )}
                    </div>
                </div>
                <div className="relative shrink-0 mb-4">
                    {/* Left scroll arrow */}
                    {canScrollLeft && (
                        <button
                            onClick={() => scrollTabs("left")}
                            className="absolute left-0 top-0 bottom-0 z-10 flex items-center px-1 bg-gradient-to-r from-base-100 via-base-100 to-transparent"
                            aria-label="Scroll tabs left"
                        >
                            <i className="fa-duotone fa-regular fa-chevron-left text-xs text-base-content" />
                        </button>
                    )}
                    {/* Scrollable tab container */}
                    <div
                        ref={tabScrollRef}
                        className="overflow-x-auto"
                        style={{ scrollbarWidth: "none" }}
                        data-tab-scroll
                    >
                        <style>{`[data-tab-scroll]::-webkit-scrollbar { display: none; }`}</style>
                        <div
                            role="tablist"
                            className="tabs tabs-lift min-w-max"
                        >
                            <a
                                role="tab"
                                className={`tab ${activeTab === "overview" ? "tab-active" : ""}`}
                                onClick={() => setActiveTab("overview")}
                            >
                                <i className="fa-duotone fa-clipboard mr-2" />
                                Overview
                            </a>
                            {sections.requirements && (
                                <a
                                    role="tab"
                                    className={`tab ${activeTab === "requirements" ? "tab-active" : ""}`}
                                    onClick={() => setActiveTab("requirements")}
                                >
                                    <i className="fa-duotone fa-list-check mr-2" />
                                    Requirements
                                    {job.requirements &&
                                        job.requirements.length > 0 && (
                                            <span className="badge badge-xs badge-primary ml-1">
                                                {job.requirements.length}
                                            </span>
                                        )}
                                </a>
                            )}
                            {sections.preScreen && (
                                <a
                                    role="tab"
                                    className={`tab ${activeTab === "prescreen" ? "tab-active" : ""}`}
                                    onClick={() => setActiveTab("prescreen")}
                                >
                                    <i className="fa-duotone fa-clipboard-question mr-2" />
                                    Pre-Screen
                                    {job.pre_screen_questions &&
                                        job.pre_screen_questions.length > 0 && (
                                            <span className="badge badge-xs badge-secondary ml-1">
                                                {
                                                    job.pre_screen_questions
                                                        .length
                                                }
                                            </span>
                                        )}
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
                            {sections.company && (
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
                    {/* Right scroll arrow */}
                    {canScrollRight && (
                        <button
                            onClick={() => scrollTabs("right")}
                            className="absolute right-0 top-0 bottom-0 z-10 flex items-center px-1 bg-gradient-to-l from-base-100 via-base-100 to-transparent"
                            aria-label="Scroll tabs right"
                        >
                            <i className="fa-duotone fa-regular fa-chevron-right text-xs text-base-content" />
                        </button>
                    )}
                </div>

                {/* Tab Content */}
                <div className={`${spacing} flex-1 min-h-0 overflow-y-auto`}>
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

                    {activeTab === "requirements" && sections.requirements && (
                        <RequirementsSection job={job} compact={compact} />
                    )}

                    {activeTab === "prescreen" && sections.preScreen && (
                        <PreScreenSection job={job} compact={compact} />
                    )}

                    {activeTab === "financials" && sections.financials && (
                        <FinancialsSection job={job} compact={compact} />
                    )}

                    {activeTab === "company" && sections.company && (
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
            {sections.requirements && (
                <RequirementsSection job={job} compact={compact} />
            )}

            {/* Pre-Screen Questions Section */}
            {sections.preScreen && (
                <PreScreenSection job={job} compact={compact} />
            )}

            {/* Financials Section */}
            {sections.financials && (
                <FinancialsSection job={job} compact={compact} />
            )}

            {/* Company Section */}
            {sections.company && <CompanySection job={job} compact={compact} />}
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
                        {job.created_at
                            ? formatRelativeTime(job.created_at)
                            : "N/A"}
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
    const hasBothDescriptions = !!job.candidate_description;

    return (
        <section
            className={`flex flex-col flex-1 min-h-0 ${compact ? "gap-2" : "gap-3"}`}
        >
            {/* Tabs */}
            <div className="overflow-x-auto shrink-0">
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
            <div className="flex-1 min-h-0 flex flex-col">
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
    return (
        <div className="flex flex-col flex-1 min-h-0 gap-2">
            {title && icon && iconColor && (
                <div className="flex items-center gap-2 shrink-0">
                    <i className={`fa-duotone ${icon} ${iconColor}`} />
                    <h4 className="font-semibold text-sm">{title}</h4>
                </div>
            )}
            <div className="flex-1 min-h-0 overflow-y-auto">
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
    const hasRequirements =
        mandatoryReqs.length > 0 || preferredReqs.length > 0;

    if (!hasRequirements) {
        return (
            <section className={compact ? "space-y-3" : "space-y-4"}>
                <h3 className="text-base font-bold flex items-center gap-2">
                    <i className="fa-duotone fa-list-check text-primary" />
                    Requirements
                </h3>
                <div className="p-8 text-center text-base-content/60">
                    <i className="fa-duotone fa-list-check text-3xl mb-3 block opacity-50" />
                    <p className="text-sm">
                        No requirements have been added for this role
                    </p>
                </div>
            </section>
        );
    }

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
    const hasQuestions =
        job.pre_screen_questions && job.pre_screen_questions.length > 0;

    if (!hasQuestions) {
        return (
            <section className={compact ? "space-y-3" : "space-y-4"}>
                <h3 className="text-base font-bold flex items-center gap-2">
                    <i className="fa-duotone fa-clipboard-question text-primary" />
                    Pre-Screen Questions
                </h3>
                <div className="p-8 text-center text-base-content/60">
                    <i className="fa-duotone fa-clipboard-question text-3xl mb-3 block opacity-50" />
                    <p className="text-sm">
                        No pre-screen questions have been added for this role
                    </p>
                </div>
            </section>
        );
    }

    const requiredCount =
        job.pre_screen_questions?.filter((q) => q.is_required).length || 0;
    const optionalCount =
        (job.pre_screen_questions?.length || 0) - requiredCount;

    return (
        <section className={compact ? "space-y-3" : "space-y-4"}>
            <h3 className="text-base font-bold flex items-center gap-2">
                <i className="fa-duotone fa-clipboard-question text-primary" />
                Pre-Screen Questions
            </h3>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-base-200/50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold">
                        {job.pre_screen_questions?.length}
                    </div>
                    <div className="text-xs text-base-content/60">Total</div>
                </div>
                <div className="bg-base-200/50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-error">
                        {requiredCount}
                    </div>
                    <div className="text-xs text-base-content/60">Required</div>
                </div>
                <div className="bg-base-200/50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-base-content/60">
                        {optionalCount}
                    </div>
                    <div className="text-xs text-base-content/60">Optional</div>
                </div>
            </div>

            {/* Questions List */}
            <div className="space-y-3">
                {job.pre_screen_questions
                    ?.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                    .map((question, index) => (
                        <div
                            key={question.id}
                            className="card bg-base-100 shadow-sm border border-base-300"
                        >
                            <div className="card-body p-4">
                                {/* Header Row: Number + Badges */}
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="w-7 h-7 rounded-full bg-primary text-primary-content flex items-center justify-center text-xs font-bold flex-shrink-0">
                                        {index + 1}
                                    </span>
                                    <span className="badge badge-ghost badge-sm gap-1">
                                        <i
                                            className={`fa-duotone ${getQuestionTypeIcon(question.question_type || "text")} text-xs`}
                                        />
                                        {formatQuestionType(
                                            question.question_type || "text",
                                        )}
                                    </span>
                                    {question.is_required ? (
                                        <span className="badge badge-error badge-sm">
                                            Required
                                        </span>
                                    ) : (
                                        <span className="badge badge-ghost badge-sm">
                                            Optional
                                        </span>
                                    )}
                                </div>

                                {/* Question Text */}
                                <p className="font-medium text-sm">
                                    {question.question}
                                </p>

                                {/* Options */}
                                {question.options &&
                                    Array.isArray(question.options) &&
                                    question.options.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-base-200">
                                            <div className="text-xs font-medium text-base-content/50 mb-2">
                                                <i className="fa-duotone fa-list-radio mr-1" />
                                                {question.options.length} option
                                                {question.options.length !== 1
                                                    ? "s"
                                                    : ""}
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {question.options.map(
                                                    (
                                                        option: any,
                                                        idx: number,
                                                    ) => (
                                                        <span
                                                            key={idx}
                                                            className="badge badge-sm bg-base-200 border-base-300"
                                                        >
                                                            {typeof option ===
                                                            "string"
                                                                ? option
                                                                : option?.label ||
                                                                  option?.value ||
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

// ===== HELPERS =====

/** Map PlanTier (user profile) to calculator Tier */
function planTierToCalculatorTier(planTier: PlanTier): Tier {
    const map: Record<PlanTier, Tier> = {
        starter: "free",
        pro: "paid",
        partner: "premium",
    };
    return map[planTier] || "free";
}

/** Auto-detect recruiter's roles on this job by matching recruiter_id */
function detectRolesForJob(
    job: Job,
    recruiterId: string | null,
): RecruiterRole[] {
    if (!recruiterId) return [];
    const roles: RecruiterRole[] = [];
    if (job.job_owner_recruiter_id === recruiterId) roles.push("job_owner");
    if (job.company_recruiter_id === recruiterId)
        roles.push("company_recruiter");
    if (job.candidate_recruiter_id === recruiterId)
        roles.push("candidate_recruiter");
    if (job.candidate_sourcer_id === recruiterId)
        roles.push("candidate_sourcer");
    if (job.company_sourcer_id === recruiterId) roles.push("company_sourcer");
    return roles;
}

// 5. Financials Section
function FinancialsSection({ job, compact }: { job: Job; compact: boolean }) {
    const { profile, planTier, isRecruiter } = useUserProfile();

    // Calculate initial values from job data
    const initialSalary = useMemo(() => {
        if (job.salary_min && job.salary_max)
            return Math.round((job.salary_min + job.salary_max) / 2);
        if (job.salary_max) return job.salary_max;
        if (job.salary_min) return job.salary_min;
        return 100000;
    }, [job.salary_min, job.salary_max]);

    const initialFee = job.fee_percentage || 20;

    // Auto-detect roles
    const detectedRoles = useMemo(
        () => detectRolesForJob(job, profile?.recruiter_id ?? null),
        [job, profile?.recruiter_id],
    );

    const initialRoles: RecruiterRole[] =
        detectedRoles.length > 0 ? detectedRoles : ["candidate_recruiter"];

    const calculatorTier = planTierToCalculatorTier(planTier);

    const {
        state,
        effectiveFee,
        payouts,
        upgradeValue,
        setSalary,
        setFeePercentage,
        toggleRole,
    } = useCalculator({
        salary: initialSalary,
        feePercentage: initialFee,
        selectedRoles: initialRoles,
    });

    // Determine next tier for upgrade CTA
    const nextTierInfo = useMemo(() => {
        if (calculatorTier === "premium") return null;
        const nextTier: Tier = calculatorTier === "free" ? "paid" : "premium";
        const currentPayout =
            payouts.find((p) => p.tier === calculatorTier)?.payout ?? 0;
        const nextPayout =
            payouts.find((p) => p.tier === nextTier)?.payout ?? 0;
        return {
            tier: nextTier,
            name: TIER_INFO[nextTier].name,
            extraPayout: nextPayout - currentPayout,
        };
    }, [calculatorTier, payouts]);

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
            <div className="alert alert-info">
                <i className="fa-duotone fa-shield-check fa-lg" />
                <div>
                    <h5 className="font-bold text-sm">Placement Guarantee</h5>
                    <p>
                        This role has a {job.guarantee_days || 90} day guarantee
                        period.
                    </p>
                </div>
            </div>

            {/* Payout Calculator */}
            {isRecruiter && (
                <>
                    <div className="divider">
                        <span className="text-sm text-base-content/60">
                            <i className="fa-duotone fa-calculator mr-2" />
                            Your Estimated Payout
                        </span>
                    </div>

                    <div className="space-y-4">
                        {/* Input Section */}
                        <div className="card bg-base-100 shadow-sm border border-base-300">
                            <div className="card-body p-4">
                                <h4 className="card-title text-sm mb-3">
                                    <i className="fa-duotone fa-sliders text-primary mr-1" />
                                    Placement Details
                                </h4>
                                <FeeInput
                                    salary={state.salary}
                                    feePercentage={state.feePercentage}
                                    effectiveFee={effectiveFee}
                                    onSalaryChange={setSalary}
                                    onFeePercentageChange={setFeePercentage}
                                    feeReadOnly
                                />
                                <div className="divider my-2"></div>
                                <RoleSelector
                                    selectedRoles={state.selectedRoles}
                                    onToggleRole={toggleRole}
                                />
                            </div>
                        </div>

                        {/* Results Section */}
                        <div className="card bg-base-100 shadow-sm border border-base-300">
                            <div className="card-body p-4">
                                <h4 className="card-title text-sm mb-3">
                                    <i className="fa-duotone fa-chart-column text-secondary mr-1" />
                                    Your Payout by Tier
                                </h4>
                                <TierComparison
                                    payouts={payouts}
                                    upgradeValue={upgradeValue}
                                    effectiveFee={effectiveFee}
                                    currentTier={calculatorTier}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Upgrade CTA */}
                    {nextTierInfo && nextTierInfo.extraPayout > 0 && (
                        <a
                            href="/portal/billing"
                            className="alert bg-primary/10 border-primary/30 cursor-pointer hover:bg-primary/20 transition-colors"
                        >
                            <i className="fa-duotone fa-rocket text-primary text-xl" />
                            <div className="flex-1">
                                <div className="font-semibold">
                                    Upgrade to {nextTierInfo.name} to earn{" "}
                                    <span className="text-success">
                                        +$
                                        {nextTierInfo.extraPayout.toLocaleString(
                                            "en-US",
                                            { maximumFractionDigits: 0 },
                                        )}
                                    </span>{" "}
                                    more on this placement
                                </div>
                                <div className="text-sm text-base-content/70">
                                    View plans and upgrade your subscription
                                </div>
                            </div>
                            <i className="fa-duotone fa-arrow-right text-primary" />
                        </a>
                    )}

                    {/* Disclaimer */}
                    <div className="text-center text-xs text-base-content/50">
                        <i className="fa-duotone fa-info-circle mr-1" />
                        Payouts are illustrative and based on current commission
                        rates. Actual payouts are finalized at hire time.
                    </div>
                </>
            )}
        </section>
    );
}

// 6. Company Section
function CompanySection({ job, compact }: { job: Job; compact: boolean }) {
    if (!job.company) {
        return (
            <section className={compact ? "space-y-3" : "space-y-4"}>
                <h3 className="text-base font-bold flex items-center gap-2">
                    <i className="fa-duotone fa-building text-primary" />
                    Company
                </h3>
                <div className="p-8 text-center text-base-content/60">
                    <i className="fa-duotone fa-building text-3xl mb-3 block opacity-50" />
                    <p className="text-sm">
                        Company information is not available for this role
                    </p>
                </div>
            </section>
        );
    }

    const websiteUrl = job.company.website
        ? job.company.website.startsWith("http")
            ? job.company.website
            : `https://${job.company.website}`
        : null;

    return (
        <section className={compact ? "space-y-3" : "space-y-4"}>
            <h3 className="text-base font-bold flex items-center gap-2">
                <i className="fa-duotone fa-building text-primary" />
                Company
            </h3>

            {/* Company Identity Card */}
            <div className="card bg-base-200 shadow-sm border border-base-300">
                <div className="card-body p-4">
                    <div className="flex items-center gap-4">
                        {/* Logo */}
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-base-100 flex-shrink-0 flex items-center justify-center border border-base-300">
                            {job.company.logo_url ? (
                                <img
                                    src={job.company.logo_url}
                                    alt={`${job.company.name} logo`}
                                    className="w-full h-full object-contain p-1"
                                    onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                        const parent =
                                            e.currentTarget.parentElement;
                                        if (parent) {
                                            parent.innerHTML =
                                                '<i class="fa-duotone fa-building text-2xl text-base-content/30"></i>';
                                        }
                                    }}
                                />
                            ) : (
                                <i className="fa-duotone fa-building text-2xl text-base-content/30" />
                            )}
                        </div>

                        {/* Name + Website */}
                        <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-bold truncate">
                                {job.company.name}
                            </h4>
                            {websiteUrl ? (
                                <a
                                    href={websiteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="link link-primary text-sm inline-flex items-center gap-1"
                                >
                                    <i className="fa-duotone fa-external-link text-xs" />
                                    {job.company.website?.replace(
                                        /^https?:\/\/(www\.)?/,
                                        "",
                                    )}
                                </a>
                            ) : (
                                <span className="text-sm text-base-content/40">
                                    No website listed
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Company Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Industry */}
                <div className="bg-base-200/50 p-3 rounded-lg">
                    <div className="text-base-content/60 mb-1">
                        <i className="fa-duotone fa-industry mr-1" />
                        Industry
                    </div>
                    <div className="font-medium text-sm">
                        {job.company.industry || (
                            <span className="text-base-content/40">
                                Not provided
                            </span>
                        )}
                    </div>
                </div>

                {/* Company Size */}
                <div className="bg-base-200/50 p-3 rounded-lg">
                    <div className="text-base-content/60 mb-1">
                        <i className="fa-duotone fa-users mr-1" />
                        Company Size
                    </div>
                    <div className="font-medium text-sm">
                        {job.company.company_size || (
                            <span className="text-base-content/40">
                                Not provided
                            </span>
                        )}
                    </div>
                </div>

                {/* Headquarters */}
                <div className="bg-base-200/50 p-3 rounded-lg">
                    <div className="text-base-content/60 mb-1">
                        <i className="fa-duotone fa-location-dot mr-1" />
                        Headquarters
                    </div>
                    <div className="font-medium text-sm">
                        {job.company.headquarters_location || (
                            <span className="text-base-content/40">
                                Not provided
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* About Section */}
            <div className="card bg-base-100 shadow-sm border border-base-300">
                <div className="card-body p-4">
                    <h4 className="card-title text-sm mb-2">
                        <i className="fa-duotone fa-memo text-primary mr-1" />
                        About
                    </h4>
                    {job.company.description ? (
                        <p className="text-sm text-base-content/80 whitespace-pre-wrap leading-relaxed">
                            {job.company.description}
                        </p>
                    ) : (
                        <div className="p-4 text-center text-base-content/40">
                            <i className="fa-duotone fa-memo-circle-info text-2xl mb-2 block opacity-50" />
                            <p className="text-sm">
                                No company description available
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Team Contacts */}
            {job.company?.id && (
                <div className="card bg-base-100 shadow-sm border border-base-300">
                    <div className="card-body p-4">
                        <h4 className="card-title text-sm mb-2">
                            <i className="fa-duotone fa-users text-primary mr-1" />
                            Team Contacts
                        </h4>
                        <CompanyContacts companyId={job.company.id} compact={compact} />
                    </div>
                </div>
            )}
        </section>
    );
}
