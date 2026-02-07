"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
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
import {
    canTakeActionOnApplication,
    getNextStageOnApprove,
    formatApplicationNote,
} from "@/app/portal/applications/lib/permission-utils";
import { useFilter } from "../../contexts/filter-context";
import type { Application } from "../../types";
import type { ApplicationStage } from "@splits-network/shared-types";

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
    };
    onViewDetails?: (applicationId: string) => void;
    onMessage?: (
        conversationId: string,
        candidateName: string,
        candidateUserId: string,
        context?: any,
    ) => void;
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
    className = "",
}: ActionsToolbarProps) {
    const { getToken } = useAuth();
    const router = useRouter();
    const toast = useToast();
    const { isAdmin, isRecruiter, isCompanyUser } = useUserProfile();
    const { refresh } = useFilter();

    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showDenyModal, setShowDenyModal] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [moveToOffer, setMoveToOffer] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [startingChat, setStartingChat] = useState(false);

    const candidateUserId = application.candidate?.user_id;
    const canChat = Boolean(candidateUserId);
    const chatDisabledReason = canChat
        ? null
        : "This candidate isn't linked to a user yet.";
    const presence = usePresence([candidateUserId], { enabled: canChat });
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

    const handleApprove = (toOffer: boolean = false) => {
        setMoveToOffer(toOffer);
        setShowApproveModal(true);
    };

    const handleConfirmApprove = async (note?: string, salary?: number) => {
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
                ...(note && {
                    notes: formatApplicationNote(
                        application.notes,
                        note,
                        isRecruiter || false,
                        isCompanyUser || false,
                        isAdmin || false,
                    ),
                }),
                ...(salary && { salary }),
                ...(isAcceptingApplication && {
                    accepted_by_company: true,
                    accepted_at: new Date().toISOString(),
                }),
            };

            await client.patch(`/applications/${application.id}`, updateData);

            if (targetStage === "hired") {
                toast.success("Candidate marked as hired successfully!");
            } else if (isAcceptingApplication) {
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
                notes: formatApplicationNote(
                    application.notes,
                    reason,
                    isRecruiter || false,
                    isCompanyUser || false,
                    isAdmin || false,
                ),
            });

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

    const handleSaveNote = async (note: string) => {
        setActionLoading(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            await client.patch(`/applications/${application.id}`, {
                notes: formatApplicationNote(
                    application.notes,
                    note,
                    isRecruiter || false,
                    isCompanyUser || false,
                    isAdmin || false,
                ),
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

    const actions = {
        viewDetails: showActions.viewDetails !== false,
        message: showActions.message !== false,
        addNote: showActions.addNote !== false && permissions.canAddNote,
        advanceStage:
            showActions.advanceStage !== false && permissions.canApprove,
        reject: showActions.reject !== false && permissions.canReject,
    };

    const isCompanyReviewStage = application.stage === "company_review";
    const sizeClass = `btn-${size}`;
    const layoutClass = layout === "horizontal" ? "gap-1" : "flex-col gap-2";

    const modals = (
        <>
            <ApproveGateModal
                isOpen={showApproveModal}
                onClose={() => setShowApproveModal(false)}
                onApprove={handleConfirmApprove}
                candidateName={application.candidate?.full_name || "Unknown"}
                jobTitle={application.job?.title || "Unknown"}
                gateName={permissions.stageLabel}
                isHireTransition={application.stage === "offer"}
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
            {showNoteModal && (
                <AddNoteModal
                    applicationId={application.id}
                    onClose={() => setShowNoteModal(false)}
                    onSave={handleSaveNote}
                    loading={actionLoading}
                />
            )}
        </>
    );

    if (variant === "icon-only") {
        return (
            <>
                <div className={`flex ${layoutClass} ${className}`}>
                    {actions.viewDetails && onViewDetails && (
                        <button
                            onClick={() => onViewDetails(application.id)}
                            className={`btn ${sizeClass} btn-square btn-ghost`}
                            title="View Details"
                        >
                            <i className="fa-duotone fa-regular fa-eye" />
                        </button>
                    )}
                    {actions.message && (
                        <span title={chatDisabledReason || undefined}>
                            <button
                                onClick={handleStartChat}
                                className={`btn ${sizeClass} btn-square btn-outline relative`}
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
                    {actions.advanceStage && (
                        <button
                            onClick={() => handleApprove(false)}
                            className={`btn ${sizeClass} btn-square btn-success`}
                            title={permissions.approveButtonText}
                            disabled={actionLoading}
                        >
                            {actionLoading ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                <i className="fa-duotone fa-regular fa-check" />
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
                </div>
                {modals}
            </>
        );
    }

    // Descriptive variant
    return (
        <>
            <div className={`flex ${layoutClass} ${className}`}>
                {actions.viewDetails && onViewDetails && (
                    <button
                        onClick={() => onViewDetails(application.id)}
                        className={`btn ${sizeClass} btn-outline gap-2`}
                    >
                        <i className="fa-duotone fa-regular fa-eye" />
                        View Details
                    </button>
                )}
                {actions.message && (
                    <span title={chatDisabledReason || undefined}>
                        <button
                            onClick={handleStartChat}
                            className={`btn ${sizeClass} btn-outline gap-2`}
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
            </div>
            {modals}
        </>
    );
}
