"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useUserProfile } from "@/contexts";
import {
    LoadingState,
    ApplicationNotesPanel,
    type CreateNoteData,
} from "@splits-network/shared-ui";
import type {
    ApplicationNote,
    ApplicationNoteCreatorType,
} from "@splits-network/shared-types";
import { getApplicationStageBadge } from "@/lib/utils/badge-styles";
import ApplicationTimeline from "./application-timeline";
import DocumentViewerModal from "../modals/document-viewer-modal";
import CompanyContacts from "@/components/company-contacts";
import { categorizeDocuments } from "@/app/portal/applications-memphis/lib/permission-utils";
import type { Application } from "../../types";
import { formatApplicationDate } from "../../types";
import AIReviewPanel from "./ai-review-panel";
import { CandidateDetail } from "@/app/portal/candidates-memphis/components/shared/candidate-detail";
import { JobDetail } from "@/app/portal/roles/components/shared/job-detail";
import { accentAt } from "./accent";

interface DetailsProps {
    itemId: string;
    onRefresh?: () => void;
}

export default function Details({ itemId, onRefresh }: DetailsProps) {
    const { getToken } = useAuth();
    const { isRecruiter, isCompanyUser } = useUserProfile();
    const [application, setApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<
        | "overview"
        | "candidate"
        | "job"
        | "documents"
        | "notes"
        | "ai_review"
        | "timeline"
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
        // Re-run when application loads so ref is attached
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateScrollButtons, !!application]);

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
            const authToken = await getToken();
            if (!authToken) return;
            setToken(authToken);
            const client = createAuthenticatedClient(authToken);
            const response = await client.get(`/applications/${itemId}`, {
                params: {
                    include:
                        "candidate,job,company,recruiter,ai_review,documents,pre_screen_answers,audit_log",
                },
            });
            setApplication(response.data);
        } catch (err) {
            console.error("Failed to fetch application detail:", err);
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

    if (loading && !application) {
        return (
            <div className="p-6">
                <LoadingState message="Loading application details..." />
            </div>
        );
    }

    if (!application) {
        return (
            <div className="p-6 text-center text-base-content/40">
                <p>Application not found</p>
            </div>
        );
    }

    const stageBadge = getApplicationStageBadge(application.stage);
    const candidate = application.candidate;
    const job = application.job;
    const documents = application.documents || [];
    const auditLogs =
        application.timeline || (application as any).audit_log || [];

    return (
        <div className="flex flex-col h-full min-h-0 p-4 md:p-6 gap-6">
            {/* Header */}
            <div className="flex items-start justify-between shrink-0">
                <div>
                    <h3 className="text-2xl font-bold">
                        {candidate?.full_name || "Unknown Candidate"}
                    </h3>
                    <p className="text-base-content/60 mt-1">
                        {job?.title || "Unknown Job"}
                        {job?.company?.name && ` at ${job.company.name}`}
                    </p>
                </div>
                <span className={`badge ${stageBadge.className} badge-lg`}>
                    {stageBadge.label}
                </span>
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
                            className={`tab ${activeTab === "candidate" ? "tab-active" : ""}`}
                            onClick={() => setActiveTab("candidate")}
                        >
                            <i className="fa-duotone fa-user mr-2" />
                            Candidate
                        </a>
                        <a
                            role="tab"
                            className={`tab ${activeTab === "job" ? "tab-active" : ""}`}
                            onClick={() => setActiveTab("job")}
                        >
                            <i className="fa-duotone fa-briefcase mr-2" />
                            Job Details
                        </a>
                        <a
                            role="tab"
                            className={`tab ${activeTab === "documents" ? "tab-active" : ""}`}
                            onClick={() => setActiveTab("documents")}
                        >
                            <i className="fa-duotone fa-file mr-2" />
                            Documents
                            {documents.length > 0 && (
                                <span className="badge badge-xs badge-primary ml-1">
                                    {documents.length}
                                </span>
                            )}
                        </a>
                        <a
                            role="tab"
                            className={`tab ${activeTab === "ai_review" ? "tab-active" : ""}`}
                            onClick={() => setActiveTab("ai_review")}
                        >
                            <i className="fa-duotone fa-brain mr-2" />
                            AI Review
                            <AIReviewPanel
                                applicationId={application.id}
                                variant="badge"
                            />
                        </a>
                        <a
                            role="tab"
                            className={`tab ${activeTab === "notes" ? "tab-active" : ""}`}
                            onClick={() => setActiveTab("notes")}
                        >
                            <i className="fa-duotone fa-comments mr-2" />
                            Notes
                        </a>
                        <a
                            role="tab"
                            className={`tab ${activeTab === "timeline" ? "tab-active" : ""}`}
                            onClick={() => setActiveTab("timeline")}
                        >
                            <i className="fa-duotone fa-timeline mr-2" />
                            Timeline
                        </a>
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
                    <OverviewTab application={application} />
                )}
                {activeTab === "candidate" && (
                    <CandidateTab application={application} />
                )}
                {activeTab === "job" && <JobTab application={application} />}
                {activeTab === "documents" && (
                    <DocumentsTab application={application} />
                )}
                {activeTab === "ai_review" && (
                    <AIReviewTab application={application} token={token} />
                )}
                {activeTab === "notes" && (
                    <NotesTab
                        application={application}
                        getToken={getToken}
                        isRecruiter={isRecruiter}
                        isCompanyUser={isCompanyUser}
                    />
                )}
                {activeTab === "timeline" && (
                    <TimelineTab
                        auditLogs={auditLogs}
                        currentStage={application.stage || "draft"}
                    />
                )}
            </div>
        </div>
    );
}

// ===== TAB COMPONENTS =====

function OverviewTab({ application }: { application: Application }) {
    const job = application.job;
    const candidate = application.candidate;

    // Handle recruiter data - check multiple possible structures
    const recruiter = application.recruiter || (application as any).assigned_recruiter;
    const recruiterName =
        recruiter?.name ||
        recruiter?.user?.name ||
        recruiter?.full_name ||
        ((recruiter as any)?.first_name && (recruiter as any)?.last_name
            ? `${(recruiter as any).first_name} ${(recruiter as any).last_name}`
            : null);
    const recruiterEmail =
        recruiter?.email || recruiter?.user?.email || null;
    const recruiterInitials = recruiterName
        ? recruiterName
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
        : "?";

    // Truncate text to ~5 lines (approx 400 chars)
    const truncateText = (text: string | null | undefined, maxLength = 400) => {
        if (!text) return null;
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + "...";
    };

    const jobDescription = job?.recruiter_description || job?.description;
    const candidateBio =
        (candidate?.marketplace_profile as any)?.rich_bio ||
        candidate?.bio;

    return (
        <div className="space-y-6">
            {/* Job Key Facts */}
            {job && (
                <div className="bg-white border-4 border-teal p-6">
                    <h3 className="text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2 text-dark">
                        <span className="w-6 h-6 flex items-center justify-center bg-teal">
                            <i className="fa-duotone fa-regular fa-briefcase text-xs text-white" />
                        </span>
                        Job Key Facts
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <div className="text-lg font-black uppercase tracking-tight text-dark">
                                {job.title}
                            </div>
                            <div className="text-sm text-dark/70">
                                {job.company?.name || "Company not specified"}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-dark/60">
                            {job.location && (
                                <div className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-location-dot text-teal" />
                                    {job.location}
                                </div>
                            )}
                            {job.employment_type && (
                                <div className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-briefcase text-purple" />
                                    {job.employment_type.replace("_", " ")}
                                </div>
                            )}
                            {(job.salary_min || job.salary_max) && (
                                <div className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-money-bill-wave text-yellow" />
                                    ${job.salary_min?.toLocaleString() || "..."} - $
                                    {job.salary_max?.toLocaleString() || "..."}
                                </div>
                            )}
                        </div>
                        {jobDescription && (
                            <div className="text-sm text-dark/70 leading-relaxed pt-3 border-t-2 border-dark/10">
                                {truncateText(jobDescription)}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Candidate Key Facts */}
            {candidate && (
                <div className="bg-white border-4 border-coral p-6">
                    <h3 className="text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2 text-dark">
                        <span className="w-6 h-6 flex items-center justify-center bg-coral">
                            <i className="fa-duotone fa-regular fa-user text-xs text-white" />
                        </span>
                        Candidate Key Facts
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <div className="text-lg font-black uppercase tracking-tight text-dark">
                                {candidate.full_name}
                            </div>
                            {candidate.current_title && (
                                <div className="text-sm text-dark/70">
                                    {candidate.current_title}
                                    {candidate.current_company &&
                                        ` at ${candidate.current_company}`}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-dark/60">
                            {candidate.email && (
                                <div className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-envelope text-coral" />
                                    {candidate.email}
                                </div>
                            )}
                            {candidate.phone && (
                                <div className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-phone text-teal" />
                                    {candidate.phone}
                                </div>
                            )}
                            {candidate.location && (
                                <div className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-location-dot text-purple" />
                                    {candidate.location}
                                </div>
                            )}
                        </div>
                        {candidateBio && (
                            <div className="text-sm text-dark/70 leading-relaxed pt-3 border-t-2 border-dark/10">
                                {truncateText(candidateBio)}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Submitted By */}
            <div className="bg-white border-4 border-purple p-6">
                <h3 className="text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2 text-dark">
                    <span className="w-6 h-6 flex items-center justify-center bg-purple">
                        <i className="fa-duotone fa-regular fa-user-tie text-xs text-white" />
                    </span>
                    Submitted By
                </h3>
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-purple text-white font-black text-lg border-4 border-dark flex-shrink-0">
                        {recruiterInitials}
                    </div>
                    <div className="flex-1">
                        <div className="text-lg font-black uppercase tracking-tight text-dark">
                            {recruiterName || "Unassigned"}
                        </div>
                        {recruiterEmail && (
                            <a
                                href={`mailto:${recruiterEmail}`}
                                className="text-sm text-coral hover:text-coral/80 font-bold"
                            >
                                {recruiterEmail}
                            </a>
                        )}
                        <div className="text-sm text-dark/60 mt-1">
                            <i className="fa-duotone fa-regular fa-calendar mr-1" />
                            Submitted {formatApplicationDate(application.created_at)}
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Analysis */}
            <AIReviewPanel applicationId={application.id} variant="compact" />
        </div>
    );
}

function CandidateTab({ application }: { application: Application }) {
    const candidate = application.candidate;

    if (!candidate) {
        return (
            <div className="text-center p-8 text-base-content/50">
                <i className="fa-duotone fa-user text-4xl mb-2" />
                <p>Candidate information not available</p>
            </div>
        );
    }

    // Use accent from application index (cycling through colors)
    const accent = accentAt(0);

    return (
        <CandidateDetail
            candidate={candidate as any}
            accent={accent}
            onRefresh={undefined}
        />
    );
}

function JobTab({ application }: { application: Application }) {
    const job = application.job;

    if (!job) {
        return (
            <div className="text-center p-8 text-base-content/50">
                <i className="fa-duotone fa-briefcase text-4xl mb-2" />
                <p>Job information not available</p>
            </div>
        );
    }

    // Use accent from application index (cycling through colors)
    const accent = accentAt(1);

    return (
        <JobDetail
            job={job as any}
            accent={accent}
            onRefresh={undefined}
        />
    );
}

function JobTabOLD_BACKUP({ application }: { application: Application }) {
    const job = application.job;

    if (!job) {
        return (
            <div className="text-center p-8 text-base-content/50">
                <i className="fa-duotone fa-briefcase text-4xl mb-2" />
                <p>Job information not available</p>
            </div>
        );
    }

    const accent = accentAt(1);

    return (
        <div className="space-y-6 BACKUP_OLD_CODE">
            {/* Header with Job Title and Company */}
            <div className="bg-white border-4 border-dark p-6">
                <h2 className="text-3xl font-black uppercase tracking-tight text-dark flex items-center gap-3 mb-2">
                    <i className="fa-duotone fa-regular fa-briefcase text-coral" />
                    {job.title}
                </h2>
                <div className="text-lg font-bold text-dark/60">
                    {job.company?.name || "Company not specified"}
                </div>
            </div>

            {/* Job Details Grid */}
            <div className="retro-metrics grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                <div className="metric-block metric-block-sm bg-coral text-white">
                    <div className="retro-metric-label mb-2">
                        <i className="fa-duotone fa-regular fa-location-dot mr-2" />
                        Location
                    </div>
                    <div className="retro-metric-value text-base font-bold">
                        {job.location || (
                            <span className="italic opacity-60">
                                Not provided
                            </span>
                        )}
                    </div>
                </div>
                <div className="metric-block metric-block-sm bg-teal text-white">
                    <div className="retro-metric-label mb-2">
                        <i className="fa-duotone fa-regular fa-briefcase mr-2" />
                        Employment Type
                    </div>
                    <div className="retro-metric-value text-base font-bold capitalize">
                        {job.employment_type ? (
                            job.employment_type.replace("_", " ")
                        ) : (
                            <span className="italic opacity-60">
                                Not provided
                            </span>
                        )}
                    </div>
                </div>
                <div className="metric-block metric-block-sm bg-yellow text-dark">
                    <div className="retro-metric-label mb-2">
                        <i className="fa-duotone fa-regular fa-money-bill-wave mr-2" />
                        Salary Range
                    </div>
                    <div className="retro-metric-value text-base font-bold">
                        {job.salary_min || job.salary_max ? (
                            <>
                                ${job.salary_min?.toLocaleString() || "..."} -{" "}
                                ${job.salary_max?.toLocaleString() || "..."}
                            </>
                        ) : (
                            <span className="italic opacity-60">
                                Not provided
                            </span>
                        )}
                    </div>
                </div>
                <div className="metric-block metric-block-sm bg-purple text-white">
                    <div className="retro-metric-label mb-2">
                        <i className="fa-duotone fa-regular fa-sitemap mr-2" />
                        Department
                    </div>
                    <div className="retro-metric-value text-base font-bold">
                        {job.department || (
                            <span className="italic opacity-60">
                                Not provided
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Company Information */}
            <div className="bg-white border-4 border-dark p-6">
                <h3 className="text-xs font-black uppercase tracking-wider text-dark/60 mb-4">
                    Company Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-dark/60 mb-2">
                            <i className="fa-duotone fa-regular fa-globe mr-1" />
                            Website
                        </div>
                        {job.company?.website ? (
                            <Link
                                href={job.company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-coral hover:text-coral/80 font-bold flex items-center gap-2 group"
                            >
                                {job.company.website}
                                <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-xs group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </Link>
                        ) : (
                            <span className="text-dark/40 italic">
                                Not provided
                            </span>
                        )}
                    </div>
                    <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-dark/60 mb-2">
                            <i className="fa-duotone fa-regular fa-industry mr-1" />
                            Industry
                        </div>
                        <div className="text-dark font-bold">
                            {job.company?.industry || (
                                <span className="text-dark/40 italic">
                                    Not provided
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Company Contacts */}
            {(job.company?.id || job.company_id) && (
                <div className="bg-white border-4 border-dark p-4">
                    <h4 className="font-semibold mb-2">
                        <i className="fa-duotone fa-users mr-2" />
                        Company Contacts
                    </h4>
                    <CompanyContacts
                        companyId={
                            (job.company?.id || job.company_id) as string
                        }
                    />
                </div>
            )}

            {(job.recruiter_description || job.description) && (
                <div className="bg-white border-4 border-dark p-4">
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-sm text-base-content/80 whitespace-pre-wrap">
                        {job.recruiter_description || job.description}
                    </p>
                </div>
            )}

            {(job as any).requirements && (job as any).requirements.length > 0 && (
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white border-4 border-dark p-4">
                        <h4 className="font-semibold text-coral mb-2">
                            Required
                        </h4>
                        <ul className="space-y-2">
                            {(job as any).requirements
                                .filter(
                                    (r: any) =>
                                        r.requirement_type === "mandatory",
                                )
                                .sort(
                                    (a: any, b: any) =>
                                        (a.sort_order || 0) -
                                        (b.sort_order || 0),
                                )
                                .map((req: any) => (
                                    <li
                                        key={req.id}
                                        className="flex items-start gap-2 text-sm"
                                    >
                                        <i className="fa-duotone fa-regular fa-circle-check text-coral mt-1 shrink-0" />
                                        <span>{req.description}</span>
                                    </li>
                                ))}
                        </ul>
                    </div>
                    <div className="bg-white border-4 border-dark p-4">
                        <h4 className="font-semibold text-teal mb-2">
                            Preferred
                        </h4>
                        <ul className="space-y-2">
                            {(job as any).requirements
                                .filter(
                                    (r: any) =>
                                        r.requirement_type === "preferred",
                                )
                                .sort(
                                    (a: any, b: any) =>
                                        (a.sort_order || 0) -
                                        (b.sort_order || 0),
                                )
                                .map((req: any) => (
                                    <li
                                        key={req.id}
                                        className="flex items-start gap-2 text-sm"
                                    >
                                        <i className="fa-duotone fa-regular fa-circle-plus text-teal mt-1 shrink-0" />
                                        <span>{req.description}</span>
                                    </li>
                                ))}
                        </ul>
                    </div>
                </div>
            )}

            {application.pre_screen_answers &&
                application.pre_screen_answers.length > 0 && (
                    <div className="bg-white border-4 border-dark p-4">
                        <h4 className="font-semibold mb-4">
                            <i className="fa-duotone fa-regular fa-clipboard-question mr-2" />
                            Pre-Screen Questions
                        </h4>
                        <div className="space-y-4">
                            {application.pre_screen_answers.map(
                                (answer: any, index: number) => (
                                    <div
                                        key={index}
                                        className="border-l-4 border-coral pl-4"
                                    >
                                        <p className="font-semibold mb-1">
                                            {answer.question?.question ||
                                                `Question ${index + 1}`}
                                        </p>
                                        <p className="text-sm text-base-content/70">
                                            {typeof answer.answer === "string"
                                                ? answer.answer
                                                : JSON.stringify(answer.answer)}
                                        </p>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                )}
        </div>
    );
}

function DocumentsTab({ application }: { application: Application }) {
    const [selectedDocument, setSelectedDocument] = useState<any>(null);
    const [showDocumentModal, setShowDocumentModal] = useState(false);

    const documents = application.documents || [];
    const { candidateDocuments, companyDocuments } =
        categorizeDocuments(documents);

    if (documents.length === 0) {
        return (
            <div className="text-center p-8 text-base-content/50">
                <i className="fa-duotone fa-file text-4xl mb-2" />
                <p>No documents uploaded</p>
            </div>
        );
    }

    const renderDocumentList = (docs: any[], title: string) => (
        <div className="bg-white border-4 border-dark p-4">
            <h4 className="font-semibold mb-4">{title}</h4>
            <div className="space-y-2">
                {docs.map((doc: any) => (
                    <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-base-300 hover:bg-base-300/80 transition-colors"
                    >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <i
                                className={`fa-duotone fa-regular ${
                                    doc.document_type === "resume"
                                        ? "fa-file-text"
                                        : doc.document_type === "cover_letter"
                                          ? "fa-file-lines"
                                          : "fa-file"
                                } text-coral`}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">
                                    {doc.file_name}
                                </div>
                                <div className="text-sm text-base-content/60">
                                    {doc.document_type
                                        ?.replace("_", " ")
                                        .toUpperCase()}
                                    {doc.file_size &&
                                        ` \u2022 ${(doc.file_size / 1024).toFixed(1)} KB`}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {doc.metadata?.is_primary && (
                                <span className="badge badge-primary badge-sm">
                                    Primary
                                </span>
                            )}
                            <button
                                onClick={() => {
                                    setSelectedDocument(doc);
                                    setShowDocumentModal(true);
                                }}
                                className="btn btn-ghost btn-sm"
                            >
                                <i className="fa-duotone fa-regular fa-eye" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <>
            <div className="space-y-4">
                {candidateDocuments.length > 0 &&
                    renderDocumentList(
                        candidateDocuments,
                        "Candidate Documents",
                    )}
                {companyDocuments.length > 0 &&
                    renderDocumentList(companyDocuments, "Company Documents")}
            </div>

            <DocumentViewerModal
                document={selectedDocument}
                isOpen={showDocumentModal}
                onClose={() => {
                    setShowDocumentModal(false);
                    setSelectedDocument(null);
                }}
            />
        </>
    );
}

function NotesTab({
    application,
    getToken,
    isRecruiter,
    isCompanyUser,
}: {
    application: Application;
    getToken: () => Promise<string | null>;
    isRecruiter: boolean;
    isCompanyUser: boolean;
}) {
    const { profile } = useUserProfile();

    // Determine user's creator type based on their role
    const getCreatorType = (): ApplicationNoteCreatorType => {
        if (profile?.is_platform_admin) return "platform_admin";
        if (isRecruiter) return "candidate_recruiter";
        if (isCompanyUser) {
            // Could be hiring_manager or company_admin based on roles
            if (profile?.roles.includes("hiring_manager"))
                return "hiring_manager";
            return "company_admin";
        }
        return "candidate";
    };

    // API functions for notes - wrapped in useCallback to prevent infinite re-fetching
    // getToken is stable from Clerk, so these callbacks are stable too
    const fetchNotes = useCallback(
        async (applicationId: string): Promise<ApplicationNote[]> => {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");
            const client = createAuthenticatedClient(token);
            const response = await client.get(
                `/applications/${applicationId}/notes`,
            );
            return response.data || [];
        },
        [getToken],
    );

    const createNote = useCallback(
        async (data: CreateNoteData): Promise<ApplicationNote> => {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");
            const client = createAuthenticatedClient(token);
            const response = await client.post(
                `/applications/${data.application_id}/notes`,
                data,
            );
            return response.data;
        },
        [getToken],
    );

    const deleteNote = useCallback(
        async (noteId: string): Promise<void> => {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");
            const client = createAuthenticatedClient(token);
            await client.delete(`/application-notes/${noteId}`);
        },
        [getToken],
    );

    if (!profile) {
        return (
            <div className="text-center p-8 text-base-content/50">
                <i className="fa-duotone fa-comments text-4xl mb-2" />
                <p>Loading user profile...</p>
            </div>
        );
    }

    return (
        <ApplicationNotesPanel
            applicationId={application.id}
            currentUserId={profile.id}
            currentUserCreatorType={getCreatorType()}
            fetchNotes={fetchNotes}
            createNote={createNote}
            deleteNote={deleteNote}
            isOnCandidateSide={isRecruiter || !isCompanyUser}
            isOnCompanySide={isCompanyUser}
            allowAddNote={true}
            allowDeleteNote={true}
            emptyStateMessage="No notes yet. Add one to start the conversation about this application."
            maxHeight="500px"
        />
    );
}

function AIReviewTab({
    application,
    token,
}: {
    application: Application;
    token: string | null;
}) {
    if (!token) {
        return (
            <div className="text-center p-8 text-base-content/50">
                <i className="fa-duotone fa-brain text-4xl mb-2" />
                <p>AI analysis not available</p>
            </div>
        );
    }

    return (
        <>
            <AIReviewPanel applicationId={application.id} />
        </>
    );
}

function TimelineTab({
    auditLogs,
    currentStage,
}: {
    auditLogs: any[];
    currentStage: string;
}) {
    return (
        <ApplicationTimeline
            auditLogs={auditLogs}
            currentStage={currentStage}
        />
    );
}
