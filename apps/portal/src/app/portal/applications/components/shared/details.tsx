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
import { getStageDisplay } from "./status-color";
import ApplicationTimeline from "@/app/portal/applications/components/shared/application-timeline";
import DocumentViewerModal from "@/app/portal/applications/components/modals/document-viewer-modal";
import CompanyContacts from "@/components/company-contacts";
import { categorizeDocuments } from "../../lib/permission-utils";
import type { Application } from "../../types";
import { formatApplicationDate } from "../../types";
import AIReviewPanel from "@/components/basel/applications/ai-review-panel";
import { ApplicationCandidateDetail } from "./application-candidate-detail";
import { ApplicationRoleDetail } from "./application-role-detail";

// ─── Types ──────────────────────────────────────────────────────────────────

type TabKey =
    | "overview"
    | "candidate"
    | "job"
    | "documents"
    | "ai_review"
    | "notes"
    | "timeline";

const TABS: { key: TabKey; label: string; icon: string }[] = [
    { key: "overview", label: "Overview", icon: "fa-clipboard" },
    { key: "candidate", label: "Candidate", icon: "fa-user" },
    { key: "job", label: "Role", icon: "fa-briefcase" },
    { key: "documents", label: "Documents", icon: "fa-file" },
    { key: "ai_review", label: "AI Analysis", icon: "fa-brain" },
    { key: "notes", label: "Notes", icon: "fa-comments" },
    { key: "timeline", label: "Timeline", icon: "fa-timeline" },
];

// ─── Props ──────────────────────────────────────────────────────────────────

interface DetailsProps {
    itemId: string;
    onRefresh?: () => void;
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function Details({ itemId, onRefresh }: DetailsProps) {
    const { getToken } = useAuth();
    const { isRecruiter, isCompanyUser } = useUserProfile();
    const [application, setApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabKey>("overview");

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
                <LoadingState message="Loading application..." />
            </div>
        );
    }

    if (!application) {
        return (
            <div className="p-6 text-center text-base-content/40">
                <p>This application could not be loaded.</p>
            </div>
        );
    }

    const stageDisplay = getStageDisplay(application.stage);
    const candidate = application.candidate;
    const job = application.job;
    const documents = application.documents || [];
    const auditLogs =
        application.timeline || (application as any).audit_log || [];

    return (
        <div className="flex flex-col h-full min-h-0 p-4 md:p-6 gap-6">
            {/* ─── Header ─────────────────────────────────────────────── */}
            <div className="flex items-start justify-between shrink-0">
                <div>
                    <h3 className="text-2xl font-black tracking-tight">
                        {candidate?.full_name || "Unnamed Candidate"}
                    </h3>
                    <p className="text-base-content/60 mt-1">
                        {job?.title || "Untitled Role"}
                        {job?.company?.name && ` at ${job.company.name}`}
                    </p>
                </div>
                <span
                    className={`text-[10px] uppercase tracking-[0.2em] font-bold px-3 py-1.5 ${stageDisplay.badge}`}
                >
                    <i
                        className={`fa-duotone fa-regular ${stageDisplay.icon} mr-1`}
                    />
                    {stageDisplay.label}
                </span>
            </div>

            {/* ─── Tabs ───────────────────────────────────────────────── */}
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
                    data-tab-scroll-basel
                >
                    <style>{`[data-tab-scroll-basel]::-webkit-scrollbar { display: none; }`}</style>
                    <div
                        role="tablist"
                        className="tabs tabs-bordered min-w-max"
                    >
                        {TABS.map((tab) => (
                            <a
                                key={tab.key}
                                role="tab"
                                className={`tab ${activeTab === tab.key ? "tab-active" : ""}`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                <i
                                    className={`fa-duotone fa-regular ${tab.icon} mr-2`}
                                />
                                {tab.label}
                                {tab.key === "documents" &&
                                    documents.length > 0 && (
                                        <span className="ml-1 text-[10px] uppercase tracking-[0.2em] font-bold px-1.5 py-0.5 bg-primary/15 text-primary">
                                            {documents.length}
                                        </span>
                                    )}
                            </a>
                        ))}
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

            {/* ─── Tab Content ────────────────────────────────────────── */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
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

// ═════════════════════════════════════════════════════════════════════════════
// TAB COMPONENTS (Basel editorial styling)
// ═════════════════════════════════════════════════════════════════════════════

// ─── Overview Tab ───────────────────────────────────────────────────────────

function OverviewTab({ application }: { application: Application }) {
    const job = application.job;
    const candidate = application.candidate;

    // Handle recruiter data - check multiple possible structures
    const recruiter =
        application.recruiter || (application as any).assigned_recruiter;
    const recruiterName =
        recruiter?.name ||
        recruiter?.user?.name ||
        (recruiter as any)?.full_name ||
        ((recruiter as any)?.first_name && (recruiter as any)?.last_name
            ? `${(recruiter as any).first_name} ${(recruiter as any).last_name}`
            : null);
    const recruiterEmail = recruiter?.email || recruiter?.user?.email || null;
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
        (candidate?.marketplace_profile as any)?.rich_bio || candidate?.bio;

    return (
        <div className="space-y-6">
            {/* Job Key Facts */}
            {job && (
                <div className="bg-base-100 border-l-4 border-primary p-6">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 font-bold mb-4">
                        Role Summary
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <div className="text-lg font-black tracking-tight">
                                {job.title}
                            </div>
                            <div className="text-sm text-base-content/60">
                                {job.company?.name || "Company pending"}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-base-content/60">
                            {job.location && (
                                <div className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-location-dot text-primary" />
                                    {job.location}
                                </div>
                            )}
                            {job.employment_type && (
                                <div className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-briefcase text-secondary" />
                                    {job.employment_type.replace("_", " ")}
                                </div>
                            )}
                            {(job.salary_min || job.salary_max) && (
                                <div className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-money-bill-wave text-accent" />
                                    ${job.salary_min?.toLocaleString() || "..."}{" "}
                                    - $
                                    {job.salary_max?.toLocaleString() || "..."}
                                </div>
                            )}
                        </div>
                        {jobDescription && (
                            <div className="text-sm text-base-content/60 leading-relaxed pt-3 border-t border-base-300">
                                {truncateText(jobDescription)}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Candidate Key Facts */}
            {candidate && (
                <div className="bg-base-100 border-l-4 border-secondary p-6">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 font-bold mb-4">
                        Candidate Summary
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <div className="text-lg font-black tracking-tight">
                                {candidate.full_name}
                            </div>
                            {candidate.current_title && (
                                <div className="text-sm text-base-content/60">
                                    {candidate.current_title}
                                    {candidate.current_company &&
                                        ` at ${candidate.current_company}`}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-base-content/60">
                            {candidate.email && (
                                <div className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-envelope text-secondary" />
                                    {candidate.email}
                                </div>
                            )}
                            {candidate.phone && (
                                <div className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-phone text-primary" />
                                    {candidate.phone}
                                </div>
                            )}
                            {candidate.location && (
                                <div className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-location-dot text-accent" />
                                    {candidate.location}
                                </div>
                            )}
                        </div>
                        {candidateBio && (
                            <div className="text-sm text-base-content/60 leading-relaxed pt-3 border-t border-base-300">
                                {truncateText(candidateBio)}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Submitting Recruiter */}
            <div className="bg-base-100 border-l-4 border-accent p-6">
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 font-bold mb-4">
                    Submitting Recruiter
                </h3>
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary text-primary-content font-black text-lg flex-shrink-0">
                        {recruiterInitials}
                    </div>
                    <div className="flex-1">
                        <div className="text-lg font-black tracking-tight">
                            {recruiterName || "Unassigned"}
                        </div>
                        {recruiterEmail && (
                            <a
                                href={`mailto:${recruiterEmail}`}
                                className="text-sm text-primary hover:text-primary/80 font-bold"
                            >
                                {recruiterEmail}
                            </a>
                        )}
                        <div className="text-sm text-base-content/50 mt-1">
                            <i className="fa-duotone fa-regular fa-calendar mr-1" />
                            Submitted{" "}
                            {formatApplicationDate(application.created_at)}
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Analysis (compact reuse) */}
            <AIReviewPanel applicationId={application.id} variant="compact" />
        </div>
    );
}

// ─── Candidate Tab ──────────────────────────────────────────────────────────

function CandidateTab({ application }: { application: Application }) {
    const candidate = application.candidate;

    if (!candidate) {
        return (
            <div className="text-center p-8 text-base-content/50">
                <i className="fa-duotone fa-user text-4xl mb-2 block" />
                <p>No candidate data on file for this application.</p>
            </div>
        );
    }

    return <ApplicationCandidateDetail candidate={candidate as any} />;
}

// ─── Job Tab ────────────────────────────────────────────────────────────────

function JobTab({ application }: { application: Application }) {
    const job = application.job;

    if (!job) {
        return (
            <div className="text-center p-8 text-base-content/50">
                <i className="fa-duotone fa-briefcase text-4xl mb-2 block" />
                <p>No role data on file for this application.</p>
            </div>
        );
    }

    return <ApplicationRoleDetail job={job as any} />;
}

// ─── Documents Tab ──────────────────────────────────────────────────────────

function DocumentsTab({ application }: { application: Application }) {
    const [selectedDocument, setSelectedDocument] = useState<any>(null);
    const [showDocumentModal, setShowDocumentModal] = useState(false);

    const documents = application.documents || [];
    const { candidateDocuments, companyDocuments } =
        categorizeDocuments(documents);

    if (documents.length === 0) {
        return (
            <div className="text-center p-8 text-base-content/50">
                <i className="fa-duotone fa-file text-4xl mb-2 block" />
                <p>No documents attached to this application.</p>
            </div>
        );
    }

    const getDocIcon = (docType: string | null) => {
        switch (docType) {
            case "resume":
                return "fa-file-user";
            case "cover_letter":
                return "fa-file-lines";
            case "portfolio":
                return "fa-folder-open";
            case "reference":
                return "fa-file-certificate";
            default:
                return "fa-file";
        }
    };

    const renderDocumentList = (docs: any[], title: string) => (
        <div className="border-l-4 border-primary">
            <div className="px-6 py-3 border-b border-base-300">
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40">
                    {title}
                </h4>
            </div>
            <div className="divide-y divide-base-200">
                {docs.map((doc: any) => (
                    <div
                        key={doc.id}
                        className="flex items-center justify-between px-6 py-3 bg-base-200/50 hover:bg-base-200 transition-colors"
                    >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <i
                                className={`fa-duotone fa-regular ${getDocIcon(doc.document_type)} text-primary`}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-sm truncate">
                                    {doc.file_name}
                                </div>
                                <div className="text-xs text-base-content/50">
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
                                <span className="text-[10px] uppercase tracking-[0.2em] font-bold px-2 py-0.5 bg-primary/15 text-primary">
                                    Primary
                                </span>
                            )}
                            <button
                                onClick={() => {
                                    setSelectedDocument(doc);
                                    setShowDocumentModal(true);
                                }}
                                className="btn btn-ghost btn-sm btn-square"
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
            <div className="space-y-6">
                {candidateDocuments.length > 0 &&
                    renderDocumentList(candidateDocuments, "From Candidate")}
                {companyDocuments.length > 0 &&
                    renderDocumentList(companyDocuments, "From Company")}
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

// ─── AI Review Tab ──────────────────────────────────────────────────────────

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
                <i className="fa-duotone fa-brain text-4xl mb-2 block" />
                <p>AI analysis has not been run for this application.</p>
            </div>
        );
    }

    return <AIReviewPanel applicationId={application.id} />;
}

// ─── Notes Tab ──────────────────────────────────────────────────────────────

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

    const getCreatorType = (): ApplicationNoteCreatorType => {
        if (profile?.is_platform_admin) return "platform_admin";
        if (isRecruiter) return "candidate_recruiter";
        if (isCompanyUser) {
            if (profile?.roles.includes("hiring_manager"))
                return "hiring_manager";
            return "company_admin";
        }
        return "candidate";
    };

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const deleteNote = useCallback(
        async (noteId: string): Promise<void> => {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");
            const client = createAuthenticatedClient(token);
            await client.delete(`/application-notes/${noteId}`);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    if (!profile) {
        return (
            <div className="text-center p-8 text-base-content/50">
                <i className="fa-duotone fa-comments text-4xl mb-2 block" />
                <p>Loading profile...</p>
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
            emptyStateMessage="No notes yet. Add a note to begin the discussion."
            maxHeight="500px"
        />
    );
}

// ─── Timeline Tab ───────────────────────────────────────────────────────────

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
