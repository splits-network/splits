"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useUserProfile } from "@/contexts";
import { LoadingState } from "@splits-network/shared-ui";
import { getApplicationStageBadge } from "@/lib/utils/badge-styles";
import ApplicationTimeline from "./application-timeline";
import AIReviewDisplay from "./ai-review-display";
import DocumentViewerModal from "../modals/document-viewer-modal";
import { categorizeDocuments } from "@/app/portal/applications/lib/permission-utils";
import type { Application } from "../../types";
import { formatApplicationDate } from "../../types";

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
        | "ai_review"
        | "timeline"
    >("overview");

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
    }, [itemId, getToken]);

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
                {activeTab === "timeline" && (
                    <TimelineTab auditLogs={auditLogs} />
                )}
            </div>
        </div>
    );
}

// ===== TAB COMPONENTS =====

function OverviewTab({ application }: { application: Application }) {
    const stageBadge = getApplicationStageBadge(application.stage);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card bg-base-200 p-4">
                <h4 className="font-semibold mb-2">Status</h4>
                <span className={`badge ${stageBadge.className} badge-lg`}>
                    {stageBadge.label}
                </span>
            </div>

            <div className="card bg-base-200 p-4">
                <h4 className="font-semibold mb-2">Submitted</h4>
                <p>{formatApplicationDate(application.created_at)}</p>
            </div>

            <div className="card bg-base-200 p-4">
                <h4 className="font-semibold mb-2">Recruiter</h4>
                {(() => {
                    const recruiterName =
                        application.recruiter?.name ||
                        application.recruiter?.user?.name;
                    const recruiterEmail =
                        application.recruiter?.email ||
                        application.recruiter?.user?.email;

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
                                application.ai_review.recommendation ===
                                "strong_fit"
                                    ? "badge-success"
                                    : application.ai_review.recommendation ===
                                        "good_fit"
                                      ? "badge-info"
                                      : application.ai_review.recommendation ===
                                          "fair_fit"
                                        ? "badge-warning"
                                        : "badge-error"
                            }`}
                        >
                            {application.ai_review.recommendation.replace(
                                "_",
                                " ",
                            )}
                        </span>
                    )}
                </div>
            )}

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
                            <h5 className="text-sm font-medium">
                                Recruiter Notes:
                            </h5>
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

    return (
        <div className="card bg-base-200 p-6">
            <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <i className="fa-duotone fa-regular fa-users fa-2xl text-primary mr-2 pt-6" />
                    <div>
                        <h2 className="text-2xl font-bold mb-2">
                            {candidate.full_name}
                        </h2>
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
                            <i className="fa-brands fa-linkedin mr-1" />
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
                            <i className="fa-duotone fa-regular fa-globe mr-1" />
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
                            <i className="fa-brands fa-github mr-1" />
                            View GitHub
                        </Link>
                    )}
                </div>
            </div>
        </div>
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

    const requirements = (job as any).job_requirements || [];

    return (
        <div className="space-y-6">
            <div className="card bg-base-200 p-6">
                <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <i className="fa-duotone fa-regular fa-buildings fa-2xl text-primary mr-2 pt-6" />
                        <div>
                            <h2 className="text-2xl font-bold mb-2">
                                {job.title}
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {job.location && (
                                    <div>
                                        <div className="text-sm text-base-content/60 mb-1">
                                            Location
                                        </div>
                                        <div className="text-sm font-medium">
                                            {job.location}
                                        </div>
                                    </div>
                                )}
                                {job.employment_type && (
                                    <div>
                                        <div className="text-sm text-base-content/60 mb-1">
                                            Type
                                        </div>
                                        <div className="text-sm font-medium capitalize">
                                            {job.employment_type.replace(
                                                "_",
                                                " ",
                                            )}
                                        </div>
                                    </div>
                                )}
                                {(job.salary_min || job.salary_max) && (
                                    <div>
                                        <div className="text-sm text-base-content/60 mb-1">
                                            Salary Range
                                        </div>
                                        <div className="text-sm font-medium">
                                            $
                                            {job.salary_min?.toLocaleString() ||
                                                "..."}{" "}
                                            - $
                                            {job.salary_max?.toLocaleString() ||
                                                "..."}
                                        </div>
                                    </div>
                                )}
                                {job.department && (
                                    <div>
                                        <div className="text-sm text-base-content/60 mb-1">
                                            Department
                                        </div>
                                        <div className="text-sm font-medium">
                                            {job.department}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col text-sm items-end">
                        <div className="text-base font-medium">
                            {job.company?.name}
                        </div>
                        {job.company?.website && (
                            <Link
                                href={job.company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-base-content/60 hover:text-primary"
                            >
                                <i className="fa-duotone fa-regular fa-globe mr-2" />
                                {job.company.website}
                            </Link>
                        )}
                        {job.company?.industry && (
                            <div className="text-sm text-base-content/60">
                                <i className="fa-duotone fa-regular fa-industry mr-2" />
                                {job.company.industry}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {(job.recruiter_description || job.description) && (
                <div className="card bg-base-200 p-4">
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-sm text-base-content/80 whitespace-pre-wrap">
                        {job.recruiter_description || job.description}
                    </p>
                </div>
            )}

            {requirements.length > 0 && (
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="card bg-base-200 p-4">
                        <h4 className="font-semibold text-error mb-2">
                            Required
                        </h4>
                        <ul className="space-y-2">
                            {requirements
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
                                        <i className="fa-duotone fa-regular fa-circle-check text-error mt-1 shrink-0" />
                                        <span>{req.description}</span>
                                    </li>
                                ))}
                        </ul>
                    </div>
                    <div className="card bg-base-200 p-4">
                        <h4 className="font-semibold text-info mb-2">
                            Preferred
                        </h4>
                        <ul className="space-y-2">
                            {requirements
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
                                        <i className="fa-duotone fa-regular fa-circle-plus text-info mt-1 shrink-0" />
                                        <span>{req.description}</span>
                                    </li>
                                ))}
                        </ul>
                    </div>
                </div>
            )}

            {application.pre_screen_answers &&
                application.pre_screen_answers.length > 0 && (
                    <div className="card bg-base-200 p-4">
                        <h4 className="font-semibold mb-4">
                            <i className="fa-duotone fa-regular fa-clipboard-question mr-2" />
                            Pre-Screen Questions
                        </h4>
                        <div className="space-y-4">
                            {application.pre_screen_answers.map(
                                (answer: any, index: number) => (
                                    <div
                                        key={index}
                                        className="border-l-4 border-primary pl-4"
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
        <AIReviewDisplay
            applicationId={application.id}
            isRecruiter={false}
            isCompanyUser={false}
            token={token}
        />
    );
}

function TimelineTab({ auditLogs }: { auditLogs: any[] }) {
    return <ApplicationTimeline auditLogs={auditLogs} />;
}
