"use client";

import { useState } from "react";
import Link from "next/link";
import { LoadingState } from "@splits-network/shared-ui";
import { getApplicationStageBadge } from "@/lib/utils/badge-styles";
import ApplicationTimeline from "./application-timeline";
import AIReviewDisplay from "./ai-review-display";
import DocumentViewerModal from "./document-viewer-modal";
import { categorizeDocuments } from "../lib/permission-utils";
import type { Application } from "./browse/types";

// ===== TYPES =====

interface ApplicationDetailsViewProps {
    application: Application;
    loading?: boolean;
    compact?: boolean;
    tabbed?: boolean;
    showSections?: {
        summary?: boolean;
        candidate?: boolean;
        job?: boolean;
        documents?: boolean;
        aiReview?: boolean;
        timeline?: boolean;
    };
    token?: string | null;
    isRecruiter?: boolean;
    isCompanyUser?: boolean;
    onRefresh?: () => void;
}

// ===== HELPER UTILITIES =====

function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function formatDateTime(dateString: string | null | undefined): string {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// ===== SECTION COMPONENTS =====

interface SectionProps {
    application: Application;
    compact?: boolean;
    token?: string | null;
    isRecruiter?: boolean;
    isCompanyUser?: boolean;
}

function SummarySection({ application, compact }: SectionProps) {
    const stageBadge = getApplicationStageBadge(application.stage);
    const spacing = compact ? "gap-4" : "gap-6";

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 ${spacing}`}>
            {/* Status Card */}
            <div className="card bg-base-200 p-4">
                <h4 className="font-semibold mb-2">Status</h4>
                <span className={`badge ${stageBadge.className} badge-lg`}>
                    {stageBadge.label}
                </span>
            </div>

            {/* Submitted Date */}
            <div className="card bg-base-200 p-4">
                <h4 className="font-semibold mb-2">Submitted</h4>
                <p>{formatDate(application.created_at)}</p>
            </div>

            {/* Recruiter Info */}
            <div className="card bg-base-200 p-4">
                <h4 className="font-semibold mb-2">Recruiter</h4>
                {(() => {
                    // Handle nested user data structure from API
                    const recruiterName = application.recruiter?.name || application.recruiter?.user?.name;
                    const recruiterEmail = application.recruiter?.email || application.recruiter?.user?.email;

                    if (recruiterName || recruiterEmail) {
                        return (
                            <>
                                {recruiterName && <p>{recruiterName}</p>}
                                {recruiterEmail && (
                                    <p className="text-sm text-base-content/60">
                                        {recruiterEmail}
                                    </p>
                                )}
                            </>
                        );
                    }
                    return (
                        <p className="text-sm text-base-content/50 italic">
                            No candidate recruiter assigned
                        </p>
                    );
                })()}
            </div>

            {/* AI Fit Score Preview */}
            {application.ai_review?.fit_score != null && (
                <div className="card bg-base-200 p-4">
                    <h4 className="font-semibold mb-2">AI Fit Score</h4>
                    <div className="flex items-center gap-2">
                        <progress
                            className="progress progress-accent w-20"
                            value={application.ai_review.fit_score}
                            max="100"
                        />
                        <span className="font-bold">
                            {Math.round(application.ai_review.fit_score)}%
                        </span>
                    </div>
                    {application.ai_review.recommendation && (
                        <span
                            className={`badge badge-xs mt-1 ${
                                application.ai_review.recommendation === "strong_fit"
                                    ? "badge-success"
                                    : application.ai_review.recommendation === "good_fit"
                                      ? "badge-info"
                                      : application.ai_review.recommendation === "fair_fit"
                                        ? "badge-warning"
                                        : "badge-error"
                            }`}
                        >
                            {application.ai_review.recommendation.replace("_", " ")}
                        </span>
                    )}
                </div>
            )}

            {/* Notes Section */}
            {(application.notes || application.recruiter_notes) && (
                <div className="card bg-base-200 p-4 md:col-span-2">
                    <h4 className="font-semibold mb-2">Notes</h4>
                    {application.notes && (
                        <p className="text-sm text-base-content/70 whitespace-pre-wrap">
                            {application.notes}
                        </p>
                    )}
                    {application.recruiter_notes && (
                        <div className="mt-2">
                            <h5 className="text-sm font-medium">Recruiter Notes:</h5>
                            <p className="text-sm text-base-content/70 whitespace-pre-wrap">
                                {application.recruiter_notes}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function CandidateSection({ application, compact }: SectionProps) {
    const candidate = application.candidate;

    if (!candidate) {
        return (
            <div className="text-center p-8 text-base-content/50">
                <i className="fa-duotone fa-user text-4xl mb-2" />
                <p>Candidate information not available</p>
            </div>
        );
    }

    return (
        <div className="card bg-base-200 p-6">
            <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <i className="fa-duotone fa-regular fa-users fa-2xl text-primary mr-2 pt-6"></i>
                    <div>
                        <h2 className="text-2xl font-bold mb-2">{candidate.full_name}</h2>
                        <div className="flex flex-wrap gap-3 text-sm">
                            {candidate.email && (
                                <div className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-envelope text-primary" />
                                    <span>{candidate.email}</span>
                                </div>
                            )}
                            {candidate.phone && (
                                <div className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-phone text-primary" />
                                    <span>{candidate.phone}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-4 mt-4">
                            {candidate.current_title && (
                                <div>
                                    <div className="text-sm text-base-content/60 mb-1">
                                        Current Role
                                    </div>
                                    <div className="text-base font-medium">
                                        {candidate.current_title}
                                    </div>
                                </div>
                            )}
                            {candidate.current_company && (
                                <div>
                                    <div className="text-sm text-base-content/60 mb-1">
                                        Current Company
                                    </div>
                                    <div className="text-base font-medium">
                                        {candidate.current_company}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-2 text-sm items-end">
                    {candidate.linkedin_url && (
                        <Link
                            href={candidate.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link link-primary"
                        >
                            <i className="fa-brands fa-linkedin mr-1"></i>
                            View LinkedIn Profile
                        </Link>
                    )}
                    {candidate.portfolio_url && (
                        <Link
                            href={candidate.portfolio_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link link-primary"
                        >
                            <i className="fa-duotone fa-regular fa-globe mr-1"></i>
                            View Portfolio
                        </Link>
                    )}
                    {candidate.github_url && (
                        <Link
                            href={candidate.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link link-primary"
                        >
                            <i className="fa-brands fa-github mr-1"></i>
                            View GitHub
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

function JobSection({ application, compact }: SectionProps) {
    const job = application.job;

    if (!job) {
        return (
            <div className="text-center p-8 text-base-content/50">
                <i className="fa-duotone fa-briefcase text-4xl mb-2" />
                <p>Job information not available</p>
            </div>
        );
    }

    const requirements = (job as any).job_requirements || [];

    return (
        <div className="space-y-6">
            {/* Job Header Card */}
            <div className="card bg-base-200 p-6">
                <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <i className="fa-duotone fa-regular fa-buildings fa-2xl text-primary mr-2 pt-6"></i>
                        <div>
                            <h2 className="text-2xl font-bold mb-2">{job.title}</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {job.location && (
                                    <div>
                                        <div className="text-sm text-base-content/60 mb-1">
                                            Location
                                        </div>
                                        <div className="text-sm font-medium">{job.location}</div>
                                    </div>
                                )}
                                {job.employment_type && (
                                    <div>
                                        <div className="text-sm text-base-content/60 mb-1">Type</div>
                                        <div className="text-sm font-medium capitalize">
                                            {job.employment_type.replace("_", " ")}
                                        </div>
                                    </div>
                                )}
                                {(job.salary_min || job.salary_max) && (
                                    <div>
                                        <div className="text-sm text-base-content/60 mb-1">
                                            Salary Range
                                        </div>
                                        <div className="text-sm font-medium">
                                            ${job.salary_min?.toLocaleString() || "..."} - $
                                            {job.salary_max?.toLocaleString() || "..."}
                                        </div>
                                    </div>
                                )}
                                {job.department && (
                                    <div>
                                        <div className="text-sm text-base-content/60 mb-1">
                                            Department
                                        </div>
                                        <div className="text-sm font-medium">{job.department}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col text-sm items-end">
                        <div className="text-base font-medium">{job.company?.name}</div>
                        {job.company?.website && (
                            <Link
                                href={job.company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-base-content/60 hover:text-primary"
                            >
                                <i className="fa-duotone fa-regular fa-globe mr-2"></i>
                                {job.company.website}
                            </Link>
                        )}
                        {job.company?.industry && (
                            <div className="text-sm text-base-content/60">
                                <i className="fa-duotone fa-regular fa-industry mr-2"></i>
                                {job.company.industry}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Description */}
            {(job.recruiter_description || job.description) && (
                <div className="card bg-base-200 p-4">
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-sm text-base-content/80 whitespace-pre-wrap">
                        {job.recruiter_description || job.description}
                    </p>
                </div>
            )}

            {/* Requirements */}
            {requirements.length > 0 && (
                <div className="grid md:grid-cols-2 gap-4">
                    {/* Mandatory Requirements */}
                    <div className="card bg-base-200 p-4">
                        <h4 className="font-semibold text-error mb-2">Required</h4>
                        <ul className="space-y-2">
                            {requirements
                                .filter((r: any) => r.requirement_type === "mandatory")
                                .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
                                .map((req: any) => (
                                    <li key={req.id} className="flex items-start gap-2 text-sm">
                                        <i className="fa-duotone fa-regular fa-circle-check text-error mt-1 shrink-0"></i>
                                        <span>{req.description}</span>
                                    </li>
                                ))}
                        </ul>
                    </div>

                    {/* Preferred Requirements */}
                    <div className="card bg-base-200 p-4">
                        <h4 className="font-semibold text-info mb-2">Preferred</h4>
                        <ul className="space-y-2">
                            {requirements
                                .filter((r: any) => r.requirement_type === "preferred")
                                .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
                                .map((req: any) => (
                                    <li key={req.id} className="flex items-start gap-2 text-sm">
                                        <i className="fa-duotone fa-regular fa-circle-plus text-info mt-1 shrink-0"></i>
                                        <span>{req.description}</span>
                                    </li>
                                ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Pre-Screen Answers */}
            {application.pre_screen_answers && application.pre_screen_answers.length > 0 && (
                <div className="card bg-base-200 p-4">
                    <h4 className="font-semibold mb-4">
                        <i className="fa-duotone fa-regular fa-clipboard-question mr-2"></i>
                        Pre-Screen Questions
                    </h4>
                    <div className="space-y-4">
                        {application.pre_screen_answers.map((answer: any, index: number) => (
                            <div key={index} className="border-l-4 border-primary pl-4">
                                <p className="font-semibold mb-1">
                                    {answer.question?.question || `Question ${index + 1}`}
                                </p>
                                <p className="text-sm text-base-content/70">
                                    {typeof answer.answer === "string"
                                        ? answer.answer
                                        : JSON.stringify(answer.answer)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function DocumentsSection({ application }: SectionProps) {
    const [selectedDocument, setSelectedDocument] = useState<any>(null);
    const [showDocumentModal, setShowDocumentModal] = useState(false);

    const documents = application.documents || [];
    const { candidateDocuments, companyDocuments } = categorizeDocuments(documents);

    if (documents.length === 0) {
        return (
            <div className="text-center p-8 text-base-content/50">
                <i className="fa-duotone fa-file text-4xl mb-2" />
                <p>No documents uploaded</p>
            </div>
        );
    }

    const renderDocumentList = (docs: any[], title: string) => (
        <div className="card bg-base-200 p-4">
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
                                } text-primary`}
                            ></i>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{doc.file_name}</div>
                                <div className="text-sm text-base-content/60">
                                    {doc.document_type?.replace("_", " ").toUpperCase()}
                                    {doc.file_size && ` • ${(doc.file_size / 1024).toFixed(1)} KB`}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {doc.metadata?.is_primary && (
                                <span className="badge badge-primary badge-sm">Primary</span>
                            )}
                            <button
                                onClick={() => {
                                    setSelectedDocument(doc);
                                    setShowDocumentModal(true);
                                }}
                                className="btn btn-ghost btn-sm"
                            >
                                <i className="fa-duotone fa-regular fa-eye"></i>
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
                    renderDocumentList(candidateDocuments, "Candidate Documents")}
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

function AIReviewSection({ application, token, isRecruiter, isCompanyUser }: SectionProps) {
    if (!token) {
        return (
            <div className="text-center p-8 text-base-content/50">
                <i className="fa-duotone fa-brain text-4xl mb-2" />
                <p>AI analysis not available</p>
            </div>
        );
    }

    return (
        <AIReviewDisplay
            applicationId={application.id}
            isRecruiter={isRecruiter || false}
            isCompanyUser={isCompanyUser || false}
            token={token}
        />
    );
}

function TimelineSection({ application }: SectionProps) {
    const auditLogs = application.timeline || (application as any).audit_log || [];

    return <ApplicationTimeline auditLogs={auditLogs} />;
}

// ===== MAIN COMPONENT =====

export default function ApplicationDetailsView({
    application,
    loading = false,
    compact = false,
    tabbed = false,
    showSections = {},
    token,
    isRecruiter,
    isCompanyUser,
    onRefresh,
}: ApplicationDetailsViewProps) {
    const [activeTab, setActiveTab] = useState<
        "overview" | "candidate" | "job" | "documents" | "ai_review" | "timeline"
    >("overview");

    // Section visibility - default all to true
    const sections = {
        summary: showSections.summary !== false,
        candidate: showSections.candidate !== false,
        job: showSections.job !== false,
        documents: showSections.documents !== false,
        aiReview: showSections.aiReview !== false,
        timeline: showSections.timeline !== false,
    };

    const spacing = compact ? "space-y-4" : "space-y-6";
    const sectionProps: SectionProps = {
        application,
        compact,
        token,
        isRecruiter,
        isCompanyUser,
    };

    if (loading) {
        return <LoadingState message="Loading application details..." />;
    }

    // Tabbed layout (for sidebar/browse panel)
    if (tabbed) {
        return (
            <div>
                <div className="overflow-x-auto">
                    <div role="tablist" className="tabs tabs-lift min-w-max mb-4">
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
                            {application.documents && application.documents.length > 0 && (
                                <span className="badge badge-xs badge-primary ml-1">
                                    {application.documents.length}
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
                            {application.ai_review?.fit_score != null && (
                                <span className="badge badge-xs badge-accent ml-1">
                                    {Math.round(application.ai_review.fit_score)}%
                                </span>
                            )}
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

                {/* Tab Content */}
                <div className={spacing}>
                    {activeTab === "overview" && sections.summary && (
                        <SummarySection {...sectionProps} />
                    )}
                    {activeTab === "candidate" && sections.candidate && (
                        <CandidateSection {...sectionProps} />
                    )}
                    {activeTab === "job" && sections.job && <JobSection {...sectionProps} />}
                    {activeTab === "documents" && sections.documents && (
                        <DocumentsSection {...sectionProps} />
                    )}
                    {activeTab === "ai_review" && sections.aiReview && (
                        <AIReviewSection {...sectionProps} />
                    )}
                    {activeTab === "timeline" && sections.timeline && (
                        <TimelineSection {...sectionProps} />
                    )}
                </div>
            </div>
        );
    }

    // Non-tabbed layout (scroll view)
    return (
        <div className={spacing}>
            {sections.summary && (
                <section>
                    <h3 className="text-lg font-bold mb-4">Application Summary</h3>
                    <SummarySection {...sectionProps} />
                </section>
            )}

            {sections.candidate && (
                <section>
                    <h3 className="text-lg font-bold mb-4">Candidate Profile</h3>
                    <CandidateSection {...sectionProps} />
                </section>
            )}

            {sections.job && (
                <section>
                    <h3 className="text-lg font-bold mb-4">Job Details</h3>
                    <JobSection {...sectionProps} />
                </section>
            )}

            {sections.documents && (
                <section>
                    <h3 className="text-lg font-bold mb-4">Documents</h3>
                    <DocumentsSection {...sectionProps} />
                </section>
            )}

            {sections.aiReview && (
                <section>
                    <h3 className="text-lg font-bold mb-4">AI Analysis</h3>
                    <AIReviewSection {...sectionProps} />
                </section>
            )}

            {sections.timeline && (
                <section>
                    <h3 className="text-lg font-bold mb-4">Timeline</h3>
                    <TimelineSection {...sectionProps} />
                </section>
            )}
        </div>
    );
}
