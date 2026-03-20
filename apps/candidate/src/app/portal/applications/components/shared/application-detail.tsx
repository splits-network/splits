"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createAuthenticatedClient } from "@/lib/api-client";
import {
    ApplicationNotesPanel,
    MarkdownRenderer,
    type CreateNoteData,
} from "@splits-network/shared-ui";
import type { ApplicationNote } from "@splits-network/shared-types";
import { startChatConversation } from "@/lib/chat-start";
import { useToast } from "@/lib/toast-context";
import { formatDate } from "@/lib/utils";
import type { Application, ApplicationDocument } from "../../types";
import { getStageDisplay, semanticPill } from "@splits-network/basel-ui";
import {
    companyName,
    companyInitials,
    recruiterName,
    appliedAgo,
    salaryDisplay,
} from "./helpers";
import ActionsToolbar from "./actions-toolbar";
import AIReviewPanel from "./ai-review-panel";
import { ApplicationCallsSection } from "./application-calls-section";
import ApplicationTimeline from "./application-timeline";
import DocumentViewerModal from "../modals/document-viewer-modal";

/* ─── Detail Panel ───────────────────────────────────────────────────────── */

export function ApplicationDetail({
    application,
    onClose,
    onRefresh,
}: {
    application: Application;
    onClose?: () => void;
    onRefresh?: () => void;
}) {
    const { user } = useUser();
    const { getToken } = useAuth();
    const router = useRouter();
    const toast = useToast();
    const [startingChat, setStartingChat] = useState(false);

    const name = companyName(application);
    const salary = salaryDisplay(application);
    const recName = recruiterName(application);
    const ago = appliedAgo(application);
    const job = application.job;

    const requirements = job?.job_requirements || [];
    const mandatoryReqs = requirements
        .filter((r) => r.requirement_type === "mandatory")
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const preferredReqs = requirements
        .filter((r) => r.requirement_type === "preferred")
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    const documents = application.documents || [];
    const auditLogs = application.timeline || application.audit_log || [];

    // Document viewer state
    const [selectedDocument, setSelectedDocument] =
        useState<ApplicationDocument | null>(null);
    const [showDocumentModal, setShowDocumentModal] = useState(false);

    // Document type helpers
    const companyDocTypes = [
        "offer_letter",
        "employment_contract",
        "benefits_summary",
        "company_handbook",
        "nda",
        "company_document",
    ];

    const getDocIcon = (docType: string | null) => {
        switch (docType) {
            case "resume":
                return "fa-file-text";
            case "cover_letter":
                return "fa-file-lines";
            case "offer_letter":
                return "fa-file-signature";
            case "employment_contract":
                return "fa-file-contract";
            default:
                if (companyDocTypes.includes(docType || ""))
                    return "fa-building";
                return "fa-file";
        }
    };

    // Notes API callbacks
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

    return (
        <div>
            {/* ── Sticky Header ── */}
            <div className="sticky top-0 bg-base-100 border-b-2 border-base-300 px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        {/* Stage pill */}
                        <div className="flex items-center gap-2 mb-2">
                            {(() => {
                                const s = getStageDisplay(application.stage, { acceptedByCandidate: application.accepted_by_candidate });
                                return (
                                    <span className={`text-sm uppercase tracking-[0.2em] font-bold px-2 py-1 ${semanticPill[s.color]}`}>
                                        {s.label}
                                    </span>
                                );
                            })()}
                        </div>

                        {/* Company kicker */}
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-2">
                            {name}
                        </p>

                        {/* Job title */}
                        <h2 className="text-2xl lg:text-3xl font-black leading-[0.95] tracking-tight mb-3">
                            {job?.title || "Unknown Position"}
                        </h2>

                        {/* Location / company metadata */}
                        <div className="flex flex-wrap gap-3 text-sm text-base-content/60">
                            <span>
                                <i className="fa-duotone fa-regular fa-building mr-1" />
                                {name}
                            </span>
                            {job?.location && (
                                <span>
                                    <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                                    {job.location}
                                </span>
                            )}
                            {salary && (
                                <span>
                                    <i className="fa-duotone fa-regular fa-money-bill mr-1" />
                                    {salary}
                                </span>
                            )}
                        </div>
                    </div>

                    {onClose && (
                        <button
                            onClick={onClose}
                            className="btn btn-sm btn-square btn-ghost"
                            style={{ borderRadius: 0 }}
                        >
                            <i className="fa-duotone fa-regular fa-xmark text-lg" />
                        </button>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-4">
                    <ActionsToolbar
                        item={application}
                        variant="descriptive"
                        size="sm"
                        onStageChange={onRefresh}
                    />
                </div>
            </div>

            {/* ── Content ── */}
            <div className="p-6 space-y-8">
                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-[2px] bg-base-300">
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Status
                        </p>
                        <p className="text-lg font-black tracking-tight">
                            {getStageDisplay(application.stage, { acceptedByCandidate: application.accepted_by_candidate }).label}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Applied
                        </p>
                        <p className="text-lg font-black tracking-tight">
                            {ago}
                        </p>
                        <p className="text-sm text-base-content/40">
                            {formatDate(application.submitted_at || application.created_at)}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Your Recruiter
                        </p>
                        <p className="text-lg font-black tracking-tight">
                            {recName}
                        </p>
                        {application.recruiter?.tagline && (
                            <p className="text-sm text-base-content/40 italic">
                                {application.recruiter.tagline}
                            </p>
                        )}

                        {/* Contact links */}
                        <div className="flex flex-col gap-1 mt-2">
                            {(application.recruiter?.user?.email || application.recruiter?.email) && (
                                <a
                                    href={`mailto:${application.recruiter?.user?.email || application.recruiter?.email}`}
                                    className="inline-flex items-center gap-1.5 text-sm text-base-content/60 hover:text-primary transition-colors truncate"
                                >
                                    <i className="fa-duotone fa-regular fa-envelope w-3.5 text-center flex-shrink-0" />
                                    <span className="truncate">{application.recruiter?.user?.email || application.recruiter?.email}</span>
                                </a>
                            )}
                            {application.recruiter?.phone && (
                                <a
                                    href={`tel:${application.recruiter.phone}`}
                                    className="inline-flex items-center gap-1.5 text-sm text-base-content/60 hover:text-primary transition-colors"
                                >
                                    <i className="fa-duotone fa-regular fa-phone w-3.5 text-center flex-shrink-0" />
                                    {application.recruiter.phone}
                                </a>
                            )}
                            {application.recruiter?.id && (
                                <Link
                                    href={`/marketplace/${application.recruiter.id}`}
                                    className="inline-flex items-center gap-1.5 text-sm text-base-content/60 hover:text-primary transition-colors"
                                >
                                    <i className="fa-duotone fa-regular fa-user w-3.5 text-center flex-shrink-0" />
                                    View Profile
                                </Link>
                            )}
                            {application.recruiter?.user?.id && (
                                <button
                                    className="inline-flex items-center gap-1.5 text-sm text-base-content/60 hover:text-primary transition-colors disabled:opacity-50"
                                    disabled={startingChat}
                                    onClick={async () => {
                                        const recruiterUserId = application.recruiter?.user?.id;
                                        if (!recruiterUserId) return;
                                        try {
                                            setStartingChat(true);
                                            const conversationId = await startChatConversation(
                                                getToken,
                                                recruiterUserId,
                                                {
                                                    application_id: application.id,
                                                    job_id: application.job?.id ?? application.job_id,
                                                    company_id: application.job?.company?.id ?? application.company?.id ?? null,
                                                },
                                            );
                                            router.push(`/portal/messages?conversationId=${conversationId}`);
                                        } catch (err: any) {
                                            toast.error(err?.message || "Couldn't start conversation. Try again.");
                                        } finally {
                                            setStartingChat(false);
                                        }
                                    }}
                                >
                                    {startingChat ? (
                                        <span className="loading loading-spinner loading-xs w-3.5" />
                                    ) : (
                                        <i className="fa-duotone fa-regular fa-comment w-3.5 text-center flex-shrink-0" />
                                    )}
                                    Send a Message
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Job closed warning */}
                {job?.status &&
                    ["closed", "filled", "cancelled"].includes(job.status) && (
                        <div className="bg-warning/5 border-l-4 border-warning p-4">
                            <h3 className="font-bold">
                                <i className="fa-duotone fa-regular fa-triangle-exclamation mr-2" />
                                This position is no longer available
                            </h3>
                            <p className="text-sm mt-1 text-base-content/70">
                                The company has closed this position and is not
                                accepting new applications.
                            </p>
                        </div>
                    )}

                {/* Proposal banner */}
                {application.stage === "recruiter_proposed" && (
                    <div className="bg-info/5 border-l-4 border-info p-6">
                        <h3 className="font-bold text-lg mb-1">
                            <i className="fa-duotone fa-regular fa-handshake mr-2" />
                            {recName} thinks you'd be a great fit for this role!
                        </h3>
                        {application.recruiter_notes && (
                            <div className="mt-3 p-3 bg-base-100 border-2 border-base-300">
                                <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                    Recruiter's Message
                                </p>
                                <p className="whitespace-pre-wrap text-sm text-base-content/70">
                                    {application.recruiter_notes}
                                </p>
                            </div>
                        )}
                        <p className="text-sm text-base-content/60 mt-3">
                            Use the toolbar buttons above to accept or decline
                            this proposal.
                        </p>
                    </div>
                )}

                {/* Offer banner */}
                {application.stage === "offer" && (
                    <div className={`border-2 p-6 ${application.accepted_by_candidate ? "border-success bg-success/5" : "border-primary bg-primary/5"}`}>
                        <p className={`text-sm font-bold uppercase tracking-[0.2em] ${application.accepted_by_candidate ? "text-success" : "text-primary"} mb-2`}>
                            <i className={`fa-duotone fa-regular ${application.accepted_by_candidate ? "fa-check-double" : "fa-file-signature"} mr-2`} />
                            {application.accepted_by_candidate ? "Offer Accepted" : "You Have an Offer"}
                        </p>
                        <h3 className="text-lg font-black tracking-tight mb-3">
                            {application.accepted_by_candidate
                                ? "Congratulations — you've accepted this offer!"
                                : `${name} has extended you a formal offer`}
                        </h3>
                        {!application.accepted_by_candidate && (
                            <Link
                                href={`/portal/applications/${application.id}/offer`}
                                className="btn btn-success btn-sm gap-2"
                                style={{ borderRadius: 0 }}
                            >
                                <i className="fa-duotone fa-regular fa-file-signature" />
                                Review & Accept Offer
                            </Link>
                        )}
                    </div>
                )}

                {/* AI Review */}
                {application.ai_review?.id && (
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            AI Analysis
                        </h3>
                        <AIReviewPanel
                            applicationId={application.id}
                            variant="full"
                        />
                    </div>
                )}

                {/* Job Description */}
                {(job?.candidate_description ||
                    job?.recruiter_description ||
                    job?.description) && (
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            Job Description
                        </h3>
                        <MarkdownRenderer
                            content={
                                (job.candidate_description ||
                                    job.recruiter_description ||
                                    job.description)!
                            }
                            className="prose prose-sm max-w-none text-base-content/70 leading-relaxed"
                        />
                    </div>
                )}

                {/* Must Have Requirements */}
                {mandatoryReqs.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            Must Have
                        </h3>
                        <ul className="space-y-2">
                            {mandatoryReqs.map((req, i) => (
                                <li
                                    key={req.id || i}
                                    className="flex items-start gap-3 text-base-content/70"
                                >
                                    <i className="fa-duotone fa-regular fa-check text-primary text-xs mt-1.5 flex-shrink-0" />
                                    <span className="leading-relaxed">
                                        {req.description}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Preferred Requirements */}
                {preferredReqs.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            Preferred
                        </h3>
                        <ul className="space-y-2">
                            {preferredReqs.map((req, i) => (
                                <li
                                    key={req.id || i}
                                    className="flex items-start gap-3 text-base-content/70"
                                >
                                    <i className="fa-duotone fa-regular fa-arrow-right text-secondary text-xs mt-1.5 flex-shrink-0" />
                                    <span className="leading-relaxed">
                                        {req.description}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Pre-screen Answers */}
                {application.pre_screen_answers &&
                    application.pre_screen_answers.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                                Pre-Screen Questions
                            </h3>
                            <div className="space-y-4">
                                {application.pre_screen_answers.map(
                                    (answer: any, index: number) => (
                                        <div
                                            key={index}
                                            className="border-l-4 border-primary pl-4"
                                        >
                                            <p className="font-semibold mb-1">
                                                {answer.question ||
                                                    `Question ${index + 1}`}
                                            </p>
                                            <p className="text-sm text-base-content/70">
                                                {typeof answer.answer ===
                                                "boolean"
                                                    ? answer.answer
                                                        ? "Yes"
                                                        : "No"
                                                    : Array.isArray(
                                                            answer.answer,
                                                        )
                                                      ? answer.answer.join(", ")
                                                      : answer.answer ||
                                                        "No answer"}
                                            </p>
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>
                    )}

                {/* Documents */}
                {documents.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            Documents
                        </h3>
                        <div className="space-y-2">
                            {documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between p-3 bg-base-200 hover:bg-base-200/80 transition-colors"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <i
                                            className={`fa-duotone fa-regular ${getDocIcon(doc.document_type)} text-primary`}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">
                                                {doc.file_name}
                                            </p>
                                            <p className="text-xs text-base-content/50">
                                                {doc.document_type
                                                    ?.replace(/_/g, " ")
                                                    .toUpperCase()}
                                                {doc.file_size &&
                                                    ` \u2022 ${(doc.file_size / 1024).toFixed(1)} KB`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {doc.metadata?.is_primary && (
                                            <span className="text-sm uppercase tracking-[0.2em] font-bold px-2 py-1 bg-primary/15 text-primary">
                                                Primary
                                            </span>
                                        )}
                                        <button
                                            onClick={() => {
                                                setSelectedDocument(doc);
                                                setShowDocumentModal(true);
                                            }}
                                            className="btn btn-ghost btn-sm btn-square"
                                            style={{ borderRadius: 0 }}
                                            title="View document"
                                        >
                                            <i className="fa-duotone fa-regular fa-eye" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                )}

                {/* Company Info */}
                {job?.company && (
                    <div className="border-t-2 border-base-300 pt-6">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-4">
                            Company
                        </h3>
                        <div className="flex items-center gap-4">
                            {job.company.logo_url ? (
                                <img
                                    src={job.company.logo_url}
                                    alt={name}
                                    className="w-12 h-12 object-contain"
                                />
                            ) : (
                                <div className="w-12 h-12 flex items-center justify-center border-2 border-base-300 bg-base-200 font-bold text-sm">
                                    {companyInitials(name)}
                                </div>
                            )}
                            <div>
                                <p className="font-bold">{name}</p>
                                {job.company.industry && (
                                    <p className="text-sm text-base-content/50">
                                        {job.company.industry}
                                    </p>
                                )}
                                {job.company.headquarters_location && (
                                    <p className="text-sm text-base-content/50">
                                        <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                                        {job.company.headquarters_location}
                                    </p>
                                )}
                            </div>
                        </div>
                        {job.company.description && (
                            <p className="text-sm text-base-content/70 mt-3">
                                {job.company.description}
                            </p>
                        )}
                    </div>
                )}

                {/* Notes */}
                {user && (
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            Notes
                        </h3>
                        <ApplicationNotesPanel
                            applicationId={application.id}
                            currentUserId={user.id}
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
                    </div>
                )}

                {/* Calls */}
                <ApplicationCallsSection applicationId={application.id} />

                {/* Timeline */}
                {auditLogs.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            Timeline
                        </h3>
                        <ApplicationTimeline
                            auditLogs={auditLogs}
                            currentStage={application.stage}
                        />
                    </div>
                )}
            </div>

            {/* Document Viewer Modal */}
            <DocumentViewerModal
                document={selectedDocument}
                isOpen={showDocumentModal}
                onClose={() => {
                    setShowDocumentModal(false);
                    setSelectedDocument(null);
                }}
            />
        </div>
    );
}

/* ─── Detail Loading Wrapper ─────────────────────────────────────────────── */

export function DetailLoader({
    applicationId,
    onClose,
    onRefresh,
}: {
    applicationId: string;
    onClose: () => void;
    onRefresh?: () => void;
}) {
    const { getToken } = useAuth();
    const [application, setApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchDetail = useCallback(
        async (id: string, signal?: { cancelled: boolean }) => {
            try {
                const token = await getToken();
                if (!token || signal?.cancelled) return;
                const client = createAuthenticatedClient(token);
                const res = await client.get<{ data: Application }>(
                    `/applications/${id}/view/detail`,
                );
                if (!signal?.cancelled) setApplication(res.data);
            } catch (err) {
                console.error("Failed to fetch application detail:", err);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        },
        [],
    );

    useEffect(() => {
        const signal = { cancelled: false };
        setLoading(true);

        fetchDetail(applicationId, signal).finally(() => {
            if (!signal.cancelled) setLoading(false);
        });

        return () => {
            signal.cancelled = true;
        };
    }, [applicationId, refreshKey, fetchDetail]);

    const handleRefresh = useCallback(() => {
        setRefreshKey((k) => k + 1);
        onRefresh?.();
    }, [onRefresh]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center p-12">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-primary mb-4 block" />
                    <span className="text-sm uppercase tracking-[0.2em] font-bold text-base-content/40">
                        Loading application...
                    </span>
                </div>
            </div>
        );
    }

    if (!application) return null;

    return (
        <ApplicationDetail
            application={application}
            onClose={onClose}
            onRefresh={handleRefresh}
        />
    );
}
