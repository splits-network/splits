"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { useUserProfile } from "@/contexts";
import { startChatConversation } from "@/lib/chat-start";
import { usePresence } from "@/hooks/use-presence";
import { Presence } from "@/components/presense";
import { useChatSidebar } from "@splits-network/chat-ui";
import {
    Button,
    SpeedMenu,
    type SpeedDialAction,
} from "@splits-network/basel-ui";
import ApproveGateModal from "../modals/approve-gate-modal";
import DenyGateModal from "../modals/deny-gate-modal";
import BaselAddNoteModal from "@/components/basel/applications/add-note-modal";
import RequestChangesModal from "../modals/request-changes-modal";
import PreScreenRequestModal from "../modals/pre-screen-request-modal";
import ComposeEmailModal from "@/components/basel/email/compose-email-modal";
import { CallCreationModal } from "@/components/calls/call-creation-modal";
import type { Participant } from "@/components/calls/participant-picker";
import {
    canTakeActionOnApplication,
    getNextStageOnApprove,
} from "@/app/portal/applications/lib/permission-utils";
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
    variant: "icon-only" | "descriptive" | "priority";
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
    const router = useRouter();
    const { getToken } = useAuth();
    const toast = useToast();
    const { profile, isAdmin, isRecruiter, isCompanyUser, hasPermissionForCompany } =
        useUserProfile();
    const chatSidebar = useChatSidebar();
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
    const [showPreScreenModal, setShowPreScreenModal] = useState(false);
    const [showRequestChangesModal, setShowRequestChangesModal] =
        useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [showCallModal, setShowCallModal] = useState(false);
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

    // Pre-fill for Schedule Call modal
    const callDefaultParticipants: Participant[] = useMemo(() => {
        if (!candidateUserId) return [];
        const candidate = application.candidate;
        const nameParts = (candidate?.full_name || "").split(" ");
        return [{
            user_id: candidateUserId,
            first_name: nameParts[0] || "",
            last_name: nameParts.slice(1).join(" ") || "",
            email: candidate?.email || "",
            avatar_url: null,
            role: "participant" as const,
        }];
    }, [candidateUserId, application.candidate]);

    const callEntityLabel = `${application.candidate?.full_name || "Candidate"} — ${application.job?.title || "Application"}`;

    const isFirmJob = !application.job?.company_id && !!application.job?.source_firm_id;

    const permissions = useMemo(() => {
        const base = canTakeActionOnApplication(
            application.stage as ApplicationStage,
            isRecruiter || false,
            isCompanyUser || false,
            isAdmin || false,
            application.candidate_recruiter_id,
            (application as any).expired_at,
            isFirmJob,
        );

        // Gate recruiter stage advancement by can_advance_candidates permission
        // Skip for recruiter-owned stages where the recruiter should always have control
        const recruiterOwnedStages = ['recruiter_review', 'recruiter_request', 'company_feedback'];
        const isRecruiterOwnedStage = recruiterOwnedStages.includes(application.stage as string)
            && !!application.candidate_recruiter_id;

        if (
            isRecruiter &&
            !isAdmin &&
            !isFirmJob &&
            !isRecruiterOwnedStage &&
            application.job?.company_id &&
            !hasPermissionForCompany(
                application.job.company_id,
                "can_advance_candidates",
            )
        ) {
            base.canApprove = false;
            base.canReject = false;
        }

        return base;
    }, [
        application.stage,
        application.candidate_recruiter_id,
        (application as any).expired_at,
        application.job?.company_id,
        isRecruiter,
        isCompanyUser,
        isAdmin,
        isFirmJob,
        hasPermissionForCompany,
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
                chatSidebar.openToThread(conversationId, {
                    otherUserName:
                        application.candidate?.full_name || "Unknown",
                });
            }
        } catch (err: any) {
            console.error("Failed to start chat:", err);
            toast.error(err?.message || "Couldn't start conversation. Try again.");
        } finally {
            setStartingChat(false);
        }
    };

    const isOfferStage = application.stage === "offer";

    const handleApprove = (toOffer: boolean = false) => {
        // At offer stage, hire via wizard page
        if (isOfferStage) {
            router.push(`/portal/applications/${application.id}/hire`);
            return;
        }
        // Check if this transition leads to offer stage
        const nextStage = getNextStageOnApprove(
            application.stage as ApplicationStage,
            application.candidate_recruiter_id,
            toOffer,
        );
        if (nextStage === "offer") {
            router.push(`/portal/applications/${application.id}/offer`);
            return;
        }
        // Regular stage transitions stay as modal
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
                    "Application accepted. Moved to company review.",
                );
            } else {
                toast.success("Application advanced.");
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

            toast.success("Application rejected.");
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

            toast.success("Note added.");
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
                "Changes requested. Candidate notified.",
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
        sendEmail: isRecruiter || isCompanyUser || isAdmin,
        scheduleCall: isRecruiter || isCompanyUser || isAdmin,
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
            {profile?.clerk_user_id && (
                <BaselAddNoteModal
                    isOpen={showNoteModal}
                    applicationId={application.id}
                    currentUserId={profile.clerk_user_id}
                    creatorType={getCreatorType()}
                    onClose={() => setShowNoteModal(false)}
                    onSave={handleSaveNote}
                    loading={actionLoading}
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
                            toast.success("Pre-screen requested.");
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
            {showEmailModal && (
                <ComposeEmailModal
                    toEmail={application.candidate?.email || undefined}
                    subject={
                        application.job?.title
                            ? `Re: ${application.job.title}`
                            : undefined
                    }
                    onClose={() => setShowEmailModal(false)}
                    onSent={() => {
                        setShowEmailModal(false);
                        refresh();
                    }}
                />
            )}
            <CallCreationModal
                isOpen={showCallModal}
                onClose={() => setShowCallModal(false)}
                defaultParticipants={callDefaultParticipants}
                defaultEntityType="application"
                defaultEntityId={application.id}
                defaultEntityLabel={callEntityLabel}
                defaultMode="scheduled"
                onSuccess={() => {
                    setShowCallModal(false);
                    refresh();
                }}
            />
        </ModalPortal>
    );

    if (variant === "icon-only") {
        const speedDialActions: SpeedDialAction[] = [];

        if (actions.addNote) {
            speedDialActions.push({
                key: "add-note",
                icon: "fa-duotone fa-regular fa-note-sticky",
                label: "Add Note",
                variant: "btn-ghost",
                disabled: actionLoading,
                onClick: () => setShowNoteModal(true),
            });
        }
        if (actions.requestPrescreen) {
            speedDialActions.push({
                key: "prescreen",
                icon: "fa-duotone fa-regular fa-user-check",
                label: "Request Pre-Screen",
                variant: "btn-warning",
                disabled: actionLoading,
                onClick: () => setShowPreScreenModal(true),
            });
        }
        if (actions.scheduleCall) {
            speedDialActions.push({
                key: "schedule-call",
                icon: "fa-duotone fa-regular fa-phone",
                label: "Schedule Call",
                variant: "btn-primary btn-outline",
                onClick: () => setShowCallModal(true),
            });
        }
        if (actions.sendEmail) {
            speedDialActions.push({
                key: "send-email",
                icon: "fa-duotone fa-regular fa-envelope",
                label: "Send Email",
                variant: "btn-secondary",
                onClick: () => setShowEmailModal(true),
            });
        }
        if (actions.requestChanges) {
            speedDialActions.push({
                key: "request-changes",
                icon: "fa-duotone fa-regular fa-question",
                label: "Request Changes",
                variant: "btn-accent",
                disabled: actionLoading,
                onClick: () => setShowRequestChangesModal(true),
            });
        }
        if (actions.advanceStage) {
            speedDialActions.push({
                key: "advance",
                icon: "fa-duotone fa-regular fa-check",
                label: permissions.approveButtonText,
                variant: "btn-success",
                disabled: actionLoading,
                loading: actionLoading,
                onClick: () => handleApprove(false),
            });
        }
        if (actions.reject) {
            speedDialActions.push({
                key: "reject",
                icon: "fa-duotone fa-regular fa-xmark",
                label: permissions.rejectButtonText,
                variant: "btn-error",
                disabled: actionLoading,
                onClick: () => setShowDenyModal(true),
            });
        }
        if (actions.message) {
            speedDialActions.push({
                key: "message",
                icon: "fa-duotone fa-regular fa-messages",
                label: "Message",
                variant: "btn-neutral btn-outline",
                disabled: !canChat || startingChat,
                loading: startingChat,
                title: chatDisabledReason || undefined,
                onClick: handleStartChat,
            });
        }
        if (actions.viewDetails && onViewDetails) {
            speedDialActions.push({
                key: "details",
                icon: "fa-duotone fa-regular fa-eye",
                label: "View Details",
                variant: "btn-primary",
                onClick: () => onViewDetails(application.id),
            });
        }

        return (
            <>
                <SpeedMenu
                    actions={speedDialActions}
                    size={size ?? "sm"}
                    className={className}
                />
                {modals}
            </>
        );
    }

    // Priority variant (SpeedDial)
    if (variant === "priority") {
        const speedDialActions: SpeedDialAction[] = [];

        if (actions.advanceStage) {
            speedDialActions.push({
                key: "advance",
                icon: "fa-duotone fa-regular fa-check",
                label: permissions.approveButtonText,
                variant: "btn-success",
                disabled: actionLoading,
                loading: actionLoading,
                onClick: () => handleApprove(false),
            });
        }
        if (actions.reject) {
            speedDialActions.push({
                key: "reject",
                icon: "fa-duotone fa-regular fa-xmark",
                label: permissions.rejectButtonText,
                variant: "btn-error",
                disabled: actionLoading,
                onClick: () => setShowDenyModal(true),
            });
        }
        if (actions.message) {
            speedDialActions.push({
                key: "message",
                icon: "fa-duotone fa-regular fa-messages",
                label: "Message",
                variant: "btn-neutral btn-outline",
                disabled: !canChat || startingChat,
                loading: startingChat,
                title: chatDisabledReason || undefined,
                renderButton: (
                    <span
                        title={chatDisabledReason || undefined}
                        className="relative inline-block"
                    >
                        <Presence
                            status={presenceStatus}
                            className="absolute -top-0.5 -right-0.5 "
                        />
                        <Button
                            icon="fa-duotone fa-regular fa-messages"
                            variant="btn-neutral btn-circle btn-outline"
                            size={size}
                            disabled={!canChat || startingChat}
                            loading={startingChat}
                            onClick={handleStartChat}
                        />
                    </span>
                ),
            });
        }
        if (actions.addNote) {
            speedDialActions.push({
                key: "add-note",
                icon: "fa-duotone fa-regular fa-note-sticky",
                label: "Add Note",
                variant: "btn-ghost",
                disabled: actionLoading,
                onClick: () => setShowNoteModal(true),
            });
        }
        if (actions.scheduleCall) {
            speedDialActions.push({
                key: "schedule-call",
                icon: "fa-duotone fa-regular fa-phone",
                label: "Schedule Call",
                variant: "btn-primary btn-outline",
                onClick: () => setShowCallModal(true),
            });
        }
        if (actions.sendEmail) {
            speedDialActions.push({
                key: "send-email",
                icon: "fa-duotone fa-regular fa-envelope",
                label: "Send Email",
                variant: "btn-secondary",
                onClick: () => setShowEmailModal(true),
            });
        }
        if (actions.requestPrescreen) {
            speedDialActions.push({
                key: "prescreen",
                icon: "fa-duotone fa-regular fa-user-check",
                label: "Request Pre-Screen",
                variant: "btn-warning",
                disabled: actionLoading,
                onClick: () => setShowPreScreenModal(true),
            });
        }
        if (actions.requestChanges) {
            speedDialActions.push({
                key: "request-changes",
                icon: "fa-duotone fa-regular fa-question",
                label: "Request Changes",
                variant: "btn-accent",
                disabled: actionLoading,
                onClick: () => setShowRequestChangesModal(true),
            });
        }
        if (actions.viewDetails && onViewDetails) {
            speedDialActions.push({
                key: "details",
                icon: "fa-duotone fa-regular fa-eye",
                label: "View Details",
                variant: "btn-primary",
                onClick: () => onViewDetails(application.id),
            });
        }

        return (
            <>
                <SpeedMenu
                    actions={speedDialActions}
                    size={size ?? "sm"}
                    className={className}
                />
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
                        className={`btn ${sizeClass} btn-info gap-2`}
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
                {actions.scheduleCall && (
                    <button
                        onClick={() => setShowCallModal(true)}
                        className={`btn ${sizeClass} btn-primary gap-2`}
                    >
                        <i className="fa-duotone fa-regular fa-phone" />
                        Call
                    </button>
                )}
                {actions.sendEmail && (
                    <button
                        onClick={() => setShowEmailModal(true)}
                        className={`btn ${sizeClass} btn-secondary gap-2`}
                        style={{ borderRadius: 0 }}
                    >
                        <i className="fa-duotone fa-regular fa-envelope" />
                        Email
                    </button>
                )}
                {actions.requestChanges && (
                    <button
                        onClick={() => setShowRequestChangesModal(true)}
                        className={`btn ${sizeClass} btn-warning gap-2`}
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
                                    className={`btn ${sizeClass} btn-success gap-2`}
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
                            className={`btn ${sizeClass} btn-primary rounded-full gap-2`}
                            disabled={!canChat || startingChat}
                        >
                            <Presence status={presenceStatus} />
                            {startingChat ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                <i className="fa-duotone fa-regular fa-messages" />
                            )}
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
