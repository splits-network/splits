"use client";

import { useState, useMemo } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { useUserProfile } from "@/contexts";
import { startChatConversation } from "@/lib/chat-start";
import { usePresence } from "@/hooks/use-presence";
import { Presence } from "@/components/presense";
import ApproveGateModal from "../modals/approve-gate-modal";
import DenyGateModal from "../modals/deny-gate-modal";
import AddNoteModal from "../modals/add-note-modal";
import RequestChangesModal from "../modals/request-changes-modal";
import HireModal from "@/app/portal/applications-memphis/components/modals/hire-modal";
import PreScreenRequestModal from "@/app/portal/applications-memphis/components/modals/pre-screen-request-modal";
import {
    canTakeActionOnApplication,
    getNextStageOnApprove,
} from "@/app/portal/applications-memphis/lib/permission-utils";
import { ModalPortal } from "@splits-network/shared-ui";
import { useFilterOptional } from "../../contexts/filter-context";
import type { Application } from "../../types";
import type {
    ApplicationStage,
    ApplicationNoteCreatorType,
} from "@splits-network/shared-types";
import type { CreateNoteData } from "@splits-network/shared-ui";

export interface ActionsToolbarProps {
    application: Application;
    variant: "icon-only" | "descriptive";
    layout?: "horizontal" | "vertical";
    size?: "xs" | "sm" | "md";
    showActions?: {
        viewDetails?: boolean;
        message?: boolean;
        addNote?: boolean;
        advanceStage?: boolean;
        reject?: boolean;
        requestPrescreen?: boolean;
        requestChanges?: boolean;
    };
    onViewDetails?: (applicationId: string) => void;
    onMessage?: (
        conversationId: string,
        candidateName: string,
        candidateUserId: string,
        context?: any,
    ) => void;
    /** Called after any mutation. Falls back to FilterContext.refresh() when inside a FilterProvider. */
    onRefresh?: () => void;
    className?: string;
}

export default function ActionsToolbar({
    application,
    variant,
    layout = "horizontal",
    size = "sm",
    showActions = {},
    onViewDetails,
    onMessage,
    onRefresh,
    className = "",
}: ActionsToolbarProps) {
    const { getToken } = useAuth();
    const { user } = useUser();
    const router = useRouter();
    const toast = useToast();
    const { profile, isAdmin, isRecruiter, isCompanyUser } = useUserProfile();
    const filterContext = useFilterOptional();
    const refresh = onRefresh ?? filterContext?.refresh ?? (() => {});

    // Determine creator type for notes
    const getCreatorType = (): ApplicationNoteCreatorType => {
        if (isAdmin) return "platform_admin";
        if (isRecruiter) return "candidate_recruiter";
        if (isCompanyUser) {
            if (profile?.roles?.includes("hiring_manager"))
                return "hiring_manager";
            return "company_admin";
        }
        return "candidate";
    };

    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showDenyModal, setShowDenyModal] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [showHireModal, setShowHireModal] = useState(false);
    const [showPreScreenModal, setShowPreScreenModal] = useState(false);
    const [showRequestChangesModal, setShowRequestChangesModal] =
        useState(false);
    const [moveToOffer, setMoveToOffer] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [startingChat, setStartingChat] = useState(false);

    const candidateUserId = application.candidate?.user_id;
    const canChat = Boolean(candidateUserId);
    const chatDisabledReason = canChat
        ? null
        : "This candidate isn't linked to a user yet.";
    const messageVisible = showActions.message !== false;
    const presence = usePresence([candidateUserId], {
        enabled: canChat && messageVisible,
    });
    const presenceStatus = candidateUserId
        ? presence[candidateUserId]?.status
        : undefined;

    const permissions = useMemo(() => {
        return canTakeActionOnApplication(
            application.stage as ApplicationStage,
            isRecruiter || false,
            isCompanyUser || false,
            isAdmin || false,
            application.candidate_recruiter_id,
        );
    }, [
        application.stage,
        application.candidate_recruiter_id,
        isRecruiter,
        isCompanyUser,
        isAdmin,
    ]);

    const handleStartChat = async () => {
        if (!candidateUserId) return;
        try {
            setStartingChat(true);
            const conversationId = await startChatConversation(
                getToken,
                candidateUserId,
                {
                    job_id: application.job_id || null,
                    company_id: application.job?.company?.id || null,
                },
            );

            if (onMessage) {
                onMessage(
                    conversationId,
                    application.candidate?.full_name || "Unknown",
                    candidateUserId,
                    {
                        job_id: application.job_id || null,
                        company_id: application.job?.company?.id || null,
                    },
                );
            } else {
                router.push(
                    `/portal/messages?conversationId=${conversationId}`,
                );
            }
        } catch (err: any) {
            console.error("Failed to start chat:", err);
            toast.error(err?.message || "Failed to start chat");
        } finally {
            setStartingChat(false);
        }
    };

    const isOfferStage = application.stage === "offer";

    const handleApprove = (toOffer: boolean = false) => {
        if (isOfferStage) {
            setShowHireModal(true);
            return;
        }
        setMoveToOffer(toOffer);
        setShowApproveModal(true);
    };

    const handleConfirmApprove = async (note?: string) => {
        setActionLoading(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            const targetStage = getNextStageOnApprove(
                application.stage as ApplicationStage,
                application.candidate_recruiter_id,
                moveToOffer,
            );

            const isAcceptingApplication =
                application.stage === "submitted" && (isCompanyUser || isAdmin);

            const updateData: any = {
                stage: targetStage,
                ...(isAcceptingApplication && {
                    accepted_by_company: true,
                    accepted_at: new Date().toISOString(),
                }),
            };

            await client.patch(`/applications/${application.id}`, updateData);

            // Create a stage transition note if a note was provided
            if (note && note.trim()) {
                try {
                    await client.post(`/applications/${application.id}/notes`, {
                        created_by_type: getCreatorType(),
                        note_type: "stage_transition",
                        visibility: "shared",
                        message_text: note.trim(),
                    });
                } catch (noteError: any) {
                    // Log but don't fail the stage transition if note creation fails
                    console.warn(
                        "Failed to create stage transition note:",
                        noteError,
                    );
                }
            }

            if (isAcceptingApplication) {
                toast.success(
                    "Application accepted and moved to company review",
                );
            } else {
                toast.success("Application moved to next stage successfully");
            }

            setShowApproveModal(false);
            refresh();
        } catch (error: any) {
            console.error("Failed to approve application:", error);
            toast.error(error.message || "Failed to approve application");
        } finally {
            setActionLoading(false);
            setMoveToOffer(false);
        }
    };

    const handleConfirmDeny = async (reason: string) => {
        setActionLoading(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            await client.patch(`/applications/${application.id}`, {
                stage: "rejected" as ApplicationStage,
                decline_reason: reason,
            });

            // Create a stage transition note for the rejection reason
            if (reason && reason.trim()) {
                try {
                    await client.post(`/applications/${application.id}/notes`, {
                        created_by_type: getCreatorType(),
                        note_type: "stage_transition",
                        visibility: "shared",
                        message_text: `Rejection reason: ${reason.trim()}`,
                    });
                } catch (noteError: any) {
                    // Log but don't fail the rejection if note creation fails
                    console.warn("Failed to create rejection note:", noteError);
                }
            }

            toast.success("Application rejected");
            setShowDenyModal(false);
            refresh();
        } catch (error: any) {
            console.error("Failed to reject application:", error);
            toast.error(error.message || "Failed to reject application");
        } finally {
            setActionLoading(false);
        }
    };

    const handleSaveNote = async (data: CreateNoteData) => {
        setActionLoading(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            await client.post(`/applications/${application.id}/notes`, {
                created_by_type: data.created_by_type,
                note_type: data.note_type,
                visibility: data.visibility,
                message_text: data.message_text,
                in_response_to_id: data.in_response_to_id,
            });

            toast.success("Note added successfully");
            setShowNoteModal(false);
            refresh();
        } catch (error: any) {
            console.error("Failed to add note:", error);
            toast.error(error.message || "Failed to add note");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRequestChanges = async (notes: string) => {
        setActionLoading(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            await client.patch(`/applications/${application.id}`, {
                stage: "recruiter_request" as ApplicationStage,
            });

            // Create a stage transition note for the request
            try {
                await client.post(`/applications/${application.id}/notes`, {
                    created_by_type: getCreatorType(),
                    note_type: "stage_transition",
                    visibility: "shared",
                    message_text: `Requested changes: ${notes}`,
                });
            } catch (noteError: any) {
                // Log but don't fail the request if note creation fails
                console.warn(
                    "Failed to create request changes note:",
                    noteError,
                );
            }

            toast.success(
                "Changes requested successfully. The candidate will be notified.",
            );
            setShowRequestChangesModal(false);
            refresh();
        } catch (error: any) {
            console.error("Failed to request changes:", error);
            toast.error(error.message || "Failed to request changes");
        } finally {
            setActionLoading(false);
        }
    };

    const actions = {
        viewDetails: showActions.viewDetails !== false,
        message: showActions.message !== false,
        addNote: showActions.addNote !== false && permissions.canAddNote,
        advanceStage:
            showActions.advanceStage !== false && permissions.canApprove,
        reject: showActions.reject !== false && permissions.canReject,
        requestPrescreen:
            showActions.requestPrescreen !== false &&
            permissions.canRequestPrescreen,
        requestChanges:
            showActions.requestChanges !== false &&
            permissions.canRequestChanges,
    };

    const isCompanyReviewStage = application.stage === "company_review";
    const sizeClass = `btn-${size}`;
    const layoutClass = layout === "horizontal" ? "gap-1" : "flex-col gap-2";

    const modals = (
        <ModalPortal>
            <ApproveGateModal
                isOpen={showApproveModal}
                onClose={() => setShowApproveModal(false)}
                onApprove={handleConfirmApprove}
                candidateName={application.candidate?.full_name || "Unknown"}
                jobTitle={application.job?.title || "Unknown"}
                gateName={permissions.stageLabel}
                applicationId={application.id}
                currentStage={application.stage ?? undefined}
            />
            <DenyGateModal
                isOpen={showDenyModal}
                onClose={() => setShowDenyModal(false)}
                onDeny={handleConfirmDeny}
                candidateName={application.candidate?.full_name || "Unknown"}
                jobTitle={application.job?.title || "Unknown"}
                gateName={permissions.stageLabel}
            />
            {showNoteModal && user?.id && (
                <AddNoteModal
                    applicationId={application.id}
                    currentUserId={user.id}
                    creatorType={getCreatorType()}
                    onClose={() => setShowNoteModal(false)}
                    onSave={handleSaveNote}
                    loading={actionLoading}
                />
            )}
            {showHireModal && (
                <HireModal
                    application={application}
                    onClose={() => setShowHireModal(false)}
                    onSuccess={() => {
                        setShowHireModal(false);
                        toast.success("Candidate hired successfully!");
                        refresh();
                    }}
                />
            )}
            {showPreScreenModal &&
                application.job_id &&
                application.job?.company?.id && (
                    <PreScreenRequestModal
                        application={application}
                        jobId={application.job_id}
                        companyId={application.job.company.id}
                        onClose={() => setShowPreScreenModal(false)}
                        onSuccess={() => {
                            setShowPreScreenModal(false);
                            toast.success("Pre-screen requested successfully!");
                            refresh();
                        }}
                    />
                )}
            <RequestChangesModal
                isOpen={showRequestChangesModal}
                onClose={() => setShowRequestChangesModal(false)}
                onRequestChanges={handleRequestChanges}
                candidateName={application.candidate?.full_name || "Unknown"}
                jobTitle={application.job?.title || "Unknown"}
            />
        </ModalPortal>
    );

    if (variant === "icon-only") {
        return (
            <>
                <div
                    className={`flex items-center ${layoutClass} ${className}`}
                >
                    {actions.addNote && (
                        <button
                            onClick={() => setShowNoteModal(true)}
                            className={`btn ${sizeClass} btn-square btn-ghost`}
                            title="Add Note"
                            disabled={actionLoading}
                        >
                            <i className="fa-duotone fa-regular fa-note-sticky" />
                        </button>
                    )}
                    {actions.requestPrescreen && (
                        <button
                            onClick={() => setShowPreScreenModal(true)}
                            className={`btn ${sizeClass} btn-warning`}
                            title="Request Pre-Screen"
                            disabled={actionLoading}
                        >
                            <i className="fa-duotone fa-regular fa-user-check" />
                            Pre-Screen
                        </button>
                    )}
                    {actions.requestChanges && (
                        <button
                            onClick={() => setShowRequestChangesModal(true)}
                            className={`btn ${sizeClass} btn-warning`}
                            title="Request Changes"
                            disabled={actionLoading}
                        >
                            <i className="fa-duotone fa-regular fa-question" />
                            Request
                        </button>
                    )}
                    {actions.advanceStage && (
                        <button
                            onClick={() => handleApprove(false)}
                            className={`btn ${sizeClass} btn-success`}
                            title={permissions.approveButtonText}
                            disabled={actionLoading}
                        >
                            {actionLoading ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-check" />
                                    Approve
                                </>
                            )}
                        </button>
                    )}
                    {actions.reject && (
                        <button
                            onClick={() => setShowDenyModal(true)}
                            className={`btn ${sizeClass} btn-square btn-error`}
                            title={permissions.rejectButtonText}
                            disabled={actionLoading}
                        >
                            <i className="fa-duotone fa-regular fa-xmark" />
                        </button>
                    )}

                    {/* Divider — only if there are action buttons before message */}
                    {(actions.addNote ||
                        actions.requestPrescreen ||
                        actions.requestChanges ||
                        actions.advanceStage ||
                        actions.reject) && (
                        <div className="w-px h-4 bg-base-300 mx-0.5" />
                    )}

                    {actions.message && (
                        <span title={chatDisabledReason || undefined}>
                            <button
                                onClick={handleStartChat}
                                className={`btn ${sizeClass} btn-square btn-ghost relative`}
                                title="Message Candidate"
                                disabled={!canChat || startingChat}
                            >
                                <Presence
                                    status={presenceStatus}
                                    className="absolute -top-1 -right-1"
                                />
                                {startingChat ? (
                                    <span className="loading loading-spinner loading-xs" />
                                ) : (
                                    <i className="fa-duotone fa-regular fa-messages" />
                                )}
                            </button>
                        </span>
                    )}
                    {actions.viewDetails && onViewDetails && (
                        <>
                            <div className="w-px h-4 bg-base-300 mx-0.5" />
                            <button
                                onClick={() => onViewDetails(application.id)}
                                className={`btn ${sizeClass} btn-square btn-primary`}
                                title="View Details"
                            >
                                <i className="fa-duotone fa-regular fa-eye" />
                            </button>
                        </>
                    )}
                </div>
                {modals}
            </>
        );
    }

    // Descriptive variant
    return (
        <>
            <div className={`flex ${layoutClass} ${className}`}>
                {actions.addNote && (
                    <button
                        onClick={() => setShowNoteModal(true)}
                        className={`btn ${sizeClass} btn-info btn-outline gap-2`}
                        disabled={actionLoading}
                    >
                        <i className="fa-duotone fa-regular fa-note-sticky" />
                        Add Note
                    </button>
                )}
                {actions.requestPrescreen && (
                    <button
                        onClick={() => setShowPreScreenModal(true)}
                        className={`btn ${sizeClass} btn-warning gap-2`}
                        disabled={actionLoading}
                    >
                        <i className="fa-duotone fa-regular fa-user-check" />
                        Request Pre-Screen
                    </button>
                )}
                {actions.requestChanges && (
                    <button
                        onClick={() => setShowRequestChangesModal(true)}
                        className={`btn ${sizeClass} btn-warning btn-outline gap-2`}
                        disabled={actionLoading}
                    >
                        <i className="fa-duotone fa-regular fa-comment-edit" />
                        Request Changes
                    </button>
                )}
                {actions.advanceStage && (
                    <>
                        {isCompanyReviewStage ? (
                            <>
                                <button
                                    onClick={() => handleApprove(false)}
                                    className={`btn ${sizeClass} btn-success gap-2`}
                                    disabled={actionLoading}
                                >
                                    {actionLoading && !moveToOffer ? (
                                        <span className="loading loading-spinner loading-xs" />
                                    ) : (
                                        <i className="fa-duotone fa-regular fa-calendar" />
                                    )}
                                    Move to Interview
                                </button>
                                <button
                                    onClick={() => handleApprove(true)}
                                    className={`btn ${sizeClass} btn-success btn-outline gap-2`}
                                    disabled={actionLoading}
                                >
                                    {actionLoading && moveToOffer ? (
                                        <span className="loading loading-spinner loading-xs" />
                                    ) : (
                                        <i className="fa-duotone fa-regular fa-handshake" />
                                    )}
                                    Move to Offer
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => handleApprove(false)}
                                className={`btn ${sizeClass} btn-success gap-2`}
                                disabled={actionLoading}
                            >
                                {actionLoading ? (
                                    <span className="loading loading-spinner loading-xs" />
                                ) : (
                                    <i className="fa-duotone fa-regular fa-check" />
                                )}
                                {permissions.approveButtonText}
                            </button>
                        )}
                    </>
                )}
                {actions.reject && (
                    <button
                        onClick={() => setShowDenyModal(true)}
                        className={`btn ${sizeClass} btn-error gap-2`}
                        disabled={actionLoading}
                    >
                        <i className="fa-duotone fa-regular fa-xmark" />
                        {permissions.rejectButtonText}
                    </button>
                )}
                {actions.message && (
                    <span title={chatDisabledReason || undefined}>
                        <button
                            onClick={handleStartChat}
                            className={`btn ${sizeClass} btn-ghost gap-2`}
                            disabled={!canChat || startingChat}
                        >
                            <Presence status={presenceStatus} />
                            {startingChat ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                <i className="fa-duotone fa-regular fa-messages" />
                            )}
                            Message
                        </button>
                    </span>
                )}
                {actions.viewDetails && onViewDetails && (
                    <button
                        onClick={() => onViewDetails(application.id)}
                        className={`btn ${sizeClass} btn-primary gap-2`}
                    >
                        <i className="fa-duotone fa-regular fa-eye" />
                        View Details
                    </button>
                )}
            </div>
            {modals}
        </>
    );
}

