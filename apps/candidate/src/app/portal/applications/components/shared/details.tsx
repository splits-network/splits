"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { createAuthenticatedClient } from "@/lib/api-client";
import { LoadingState } from "@/components/standard-lists/loading-state";
import {
    ApplicationNotesPanel,
    type CreateNoteData,
} from "@splits-network/shared-ui";
import type { ApplicationNote } from "@splits-network/shared-types";
import { formatDate } from "@/lib/utils";
import ApplicationTimeline from "./application-timeline";
import DocumentViewerModal from "../modals/document-viewer-modal";
import {
    type Application,
    type ApplicationDocument,
    getStatusColor,
    formatStage,
} from "../../types";
import AIReviewPanel from "../../[id]/components/ai-review-panel";

interface DetailsProps {
    itemId: string;
    onRefresh?: () => void;
}

export default function Details({ itemId, onRefresh }: DetailsProps) {
    const { getToken } = useAuth();
    const { user } = useUser();
    const [application, setApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<
        "overview" | "job" | "documents" | "ai_review" | "notes" | "timeline"
    >("overview");

    const fetchDetail = useCallback(async () => {
        if (!itemId) return;
        setLoading(true);
        try {
            const authToken = await getToken();
            if (!authToken) throw new Error("Not authenticated");
            setToken(authToken);
            const client = createAuthenticatedClient(authToken);
            const response: any = await client.get(`/applications/${itemId}`, {
                params: {
                    include:
                        "job,company,recruiter,ai_review,documents,pre_screen_answers,audit_log,job_requirements",
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

    const documents = application.documents || [];
    const auditLogs = application.timeline || application.audit_log || [];

    return (
        <div className="flex flex-col h-full min-h-0 p-4 md:p-6 gap-6">
            {/* Header */}
            <div className="flex items-start justify-between shrink-0">
                <div className="flex items-start gap-3 min-w-0">
                    <div className="avatar avatar-placeholder shrink-0">
                        <div className="bg-primary/10 text-primary rounded-full w-12 flex items-center justify-center font-bold text-lg">
                            {application.job?.company?.logo_url ? (
                                <img
                                    src={application.job.company.logo_url}
                                    alt={`${application.job?.company.name} logo`}
                                    className="w-full h-full object-contain rounded"
                                />
                            ) : (
                                <span>
                                    {(application.job?.company?.name ||
                                        "C")[0].toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-lg font-bold truncate">
                            {application.job?.title || "Unknown Position"}
                        </h3>
                        <p className="text-sm text-base-content/60">
                            {application.job?.company?.name ||
                                "Unknown Company"}
                        </p>
                    </div>
                </div>
                <span
                    className={`badge ${getStatusColor(application.stage)} badge-lg shrink-0`}
                >
                    {formatStage(application.stage)}
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
                        {application.ai_review?.id && (
                            <AIReviewPanel aiReviewId={application.ai_review.id} variant="badge" />
                        )}
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

            {/* Tab Content */}
            <div className="space-y-4 flex-1 min-h-0 overflow-y-auto">
                {activeTab === "overview" && (
                    <OverviewTab application={application} />
                )}
                {activeTab === "job" && <JobTab application={application} />}
                {activeTab === "documents" && (
                    <DocumentsTab application={application} />
                )}
                {activeTab === "ai_review" && (
                    <AIReviewTab application={application} />
                )}
                {activeTab === "notes" && user && (
                    <NotesTab
                        application={application}
                        getToken={getToken}
                        userId={user.id}
                    />
                )}
                {activeTab === "timeline" && (
                    <TimelineTab
                        auditLogs={auditLogs}
                        currentStage={application.stage}
                    />
                )}
            </div>
        </div>
    );
}

// ===== TAB COMPONENTS =====

function OverviewTab({ application }: { application: Application }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card bg-base-200 p-4">
                <h4 className="font-semibold mb-2">Status</h4>
                <span
                    className={`badge ${getStatusColor(application.stage)} badge-lg`}
                >
                    {formatStage(application.stage)}
                </span>
            </div>

            <div className="card bg-base-200 p-4">
                <h4 className="font-semibold mb-2">Submitted</h4>
                <p>{formatDate(application.created_at)}</p>
                {application.updated_at !== application.created_at && (
                    <p className="text-sm text-base-content/60 mt-1">
                        Updated {formatDate(application.updated_at)}
                    </p>
                )}
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
                                {application.recruiter?.tagline && (
                                    <p className="text-sm text-base-content/60 mt-1">
                                        {application.recruiter.tagline}
                                    </p>
                                )}
                            </>
                        );
                    }
                    return (
                        <p className="text-sm text-base-content/50 italic">
                            No recruiter assigned
                        </p>
                    );
                })()}
            </div>

            {application.ai_review?.id && (
                <AIReviewPanel aiReviewId={application.ai_review.id} variant="mini-card" />
            )}
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

    const requirements = job.job_requirements || [];

    return (
        <div className="space-y-6">
            {/* Job Header Card */}
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

            {/* Description */}
            {(job.candidate_description ||
                job.recruiter_description ||
                job.description) && (
                <div className="card bg-base-200 p-4">
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-sm text-base-content/80 whitespace-pre-wrap">
                        {job.candidate_description ||
                            job.recruiter_description ||
                            job.description}
                    </p>
                </div>
            )}

            {/* Requirements */}
            {requirements.length > 0 && (
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="card bg-base-200 p-4">
                        <h4 className="font-semibold text-error mb-2">
                            Required
                        </h4>
                        <ul className="space-y-2">
                            {requirements
                                .filter(
                                    (r) => r.requirement_type === "mandatory",
                                )
                                .sort(
                                    (a, b) =>
                                        (a.sort_order || 0) -
                                        (b.sort_order || 0),
                                )
                                .map((req, i) => (
                                    <li
                                        key={req.id || i}
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
                                    (r) => r.requirement_type === "preferred",
                                )
                                .sort(
                                    (a, b) =>
                                        (a.sort_order || 0) -
                                        (b.sort_order || 0),
                                )
                                .map((req, i) => (
                                    <li
                                        key={req.id || i}
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

            {/* Pre-Screen Answers */}
            {application.pre_screen_answers &&
                application.pre_screen_answers.length > 0 && (
                    <div className="card bg-base-200 p-4">
                        <h4 className="font-semibold mb-4">
                            <i className="fa-duotone fa-regular fa-clipboard-question mr-2" />
                            Pre-Screen Questions
                        </h4>
                        <div className="space-y-4">
                            {application.pre_screen_answers.map(
                                (answer, index) => {
                                    const questionText =
                                        typeof answer.question === "object"
                                            ? answer.question?.question
                                            : answer.question;
                                    return (
                                        <div
                                            key={index}
                                            className="border-l-4 border-primary pl-4"
                                        >
                                            <p className="font-semibold mb-1">
                                                {questionText ||
                                                    `Question ${index + 1}`}
                                            </p>
                                            <p className="text-sm text-base-content/70">
                                                {typeof answer.answer ===
                                                "string"
                                                    ? answer.answer
                                                    : JSON.stringify(
                                                          answer.answer,
                                                      )}
                                            </p>
                                        </div>
                                    );
                                },
                            )}
                        </div>
                    </div>
                )}
        </div>
    );
}

function DocumentsTab({ application }: { application: Application }) {
    const [selectedDocument, setSelectedDocument] =
        useState<ApplicationDocument | null>(null);
    const [showDocumentModal, setShowDocumentModal] = useState(false);

    const documents = application.documents || [];

    if (documents.length === 0) {
        return (
            <div className="text-center p-8 text-base-content/50">
                <i className="fa-duotone fa-file text-4xl mb-2" />
                <p>No documents uploaded</p>
            </div>
        );
    }

    const companyDocTypes = [
        "offer_letter",
        "employment_contract",
        "benefits_summary",
        "company_handbook",
        "nda",
        "company_document",
    ];
    const candidateDocuments = documents.filter(
        (doc) => !companyDocTypes.includes(doc.document_type || ""),
    );
    const companyDocuments = documents.filter((doc) =>
        companyDocTypes.includes(doc.document_type || ""),
    );

    const renderDocumentList = (docs: ApplicationDocument[], title: string) => (
        <div className="card bg-base-200 p-4">
            <h4 className="font-semibold mb-4">{title}</h4>
            <div className="space-y-2">
                {docs.map((doc) => (
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
                                          : doc.document_type === "offer_letter"
                                            ? "fa-file-signature"
                                            : doc.document_type ===
                                                "employment_contract"
                                              ? "fa-file-contract"
                                              : companyDocTypes.includes(
                                                      doc.document_type || "",
                                                  )
                                                ? "fa-building"
                                                : "fa-file"
                                } text-primary`}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">
                                    {doc.file_name}
                                </div>
                                <div className="text-sm text-base-content/60">
                                    {doc.document_type
                                        ?.replace(/_/g, " ")
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
                    renderDocumentList(candidateDocuments, "Your Documents")}
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

function AIReviewTab({ application }: { application: Application }) {
    if (!application.ai_review?.id) {
        return (
            <div className="text-center p-8 text-base-content/50">
                <i className="fa-duotone fa-brain text-4xl mb-2" />
                <p>AI analysis not yet available</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <AIReviewPanel aiReviewId={application.ai_review.id} />
        </div>
    );
}

function NotesTab({
    application,
    getToken,
    userId,
}: {
    application: Application;
    getToken: () => Promise<string | null>;
    userId: string;
}) {
    // API functions for notes - wrapped in useCallback to prevent infinite re-fetching
    // getToken is stable from Clerk, so these callbacks are stable too
    const fetchNotes = useCallback(async (
        applicationId: string,
    ): Promise<ApplicationNote[]> => {
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");
        const client = createAuthenticatedClient(token);
        const response = await client.get(
            `/applications/${applicationId}/notes`,
        );
        return response.data || [];
    }, [getToken]);

    const createNote = useCallback(async (
        data: CreateNoteData,
    ): Promise<ApplicationNote> => {
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");
        const client = createAuthenticatedClient(token);
        const response = await client.post(
            `/applications/${data.application_id}/notes`,
            data,
        );
        return response.data;
    }, [getToken]);

    const deleteNote = useCallback(async (noteId: string): Promise<void> => {
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");
        const client = createAuthenticatedClient(token);
        await client.delete(`/application-notes/${noteId}`);
    }, [getToken]);

    return (
        <ApplicationNotesPanel
            applicationId={application.id}
            currentUserId={userId}
            currentUserCreatorType="candidate"
            fetchNotes={fetchNotes}
            createNote={createNote}
            deleteNote={deleteNote}
            isOnCandidateSide={true}
            isOnCompanySide={false}
            allowAddNote={true}
            allowDeleteNote={true}
            emptyStateMessage="No notes yet. Add one to communicate with your recruiter."
            maxHeight="500px"
        />
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
