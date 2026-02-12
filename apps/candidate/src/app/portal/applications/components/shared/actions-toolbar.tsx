"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { startChatConversation } from "@/lib/chat-start";
import { useToast } from "@/lib/toast-context";
import { usePresence } from "@/hooks/use-presence";
import {
    useApplicationActions,
    type WizardData,
} from "@/hooks/use-application-actions";
import { Presence } from "@/components/presense";
import { createAuthenticatedClient } from "@/lib/api-client";
import { ModalPortal } from "@splits-network/shared-ui";
import ApplicationWizardModal from "@/components/application-wizard-modal";
import { ProposalResponseWizard } from "./proposal-response-wizard";
import { DeclineModal } from "./decline-modal";
import { type Application, WITHDRAWABLE_STAGES } from "../../types";

// Stages where "Move to Draft" is available
const BACK_TO_DRAFT_STAGES = [
    "ai_reviewed",
    "ai_review",
    "screen",
    "recruiter_request",
    "rejected",
];

// Stages where "Submit" is available
const SUBMITTABLE_STAGES = ["draft", "ai_reviewed"];

interface ActionsToolbarProps {
    item: Application;
    size?: "xs" | "sm" | "md";
    variant?: "icon-only" | "descriptive";
    onStageChange?: () => void;
    onViewDetails?: (id: string) => void;
}

export default function ActionsToolbar({
    item,
    size = "md",
    variant = "icon-only",
    onStageChange,
    onViewDetails,
}: ActionsToolbarProps) {
    const { getToken } = useAuth();
    const router = useRouter();
    const toast = useToast();

    // Chat state
    const [startingChat, setStartingChat] = useState(false);

    // Confirmation state
    const [confirmAction, setConfirmAction] = useState<string | null>(null);
    const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Edit wizard state
    const [showEditWizard, setShowEditWizard] = useState(false);

    // Proposal wizard state
    const [showProposalWizard, setShowProposalWizard] = useState(false);
    const [preScreenQuestions, setPreScreenQuestions] = useState<any[] | null>(
        null,
    );
    const [showDeclineModal, setShowDeclineModal] = useState(false);

    // Application actions hook
    const actions = useApplicationActions({ onSuccess: onStageChange });

    // Derived state
    const recruiterUserId = item.recruiter?.user?.id;
    const canEdit = item.stage === "draft";
    const canBackToDraft = BACK_TO_DRAFT_STAGES.includes(item.stage);
    const canSubmit = SUBMITTABLE_STAGES.includes(item.stage);
    const canWithdraw = WITHDRAWABLE_STAGES.includes(item.stage);
    const isProposal = item.stage === "recruiter_proposed";
    const isJobClosed = ["closed", "filled", "cancelled"].includes(
        item.job?.status || "",
    );
    const chatDisabledReason = recruiterUserId
        ? null
        : "Your recruiter isn't linked to a user yet.";

    const presence = usePresence([recruiterUserId], {
        enabled: Boolean(recruiterUserId),
    });
    const presenceStatus = recruiterUserId
        ? presence[recruiterUserId]?.status
        : undefined;

    // Clear confirm timer on unmount
    useEffect(() => {
        return () => {
            if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
        };
    }, []);

    // Start confirmation countdown
    const startConfirm = (action: string) => {
        setConfirmAction(action);
        if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
        confirmTimerRef.current = setTimeout(() => {
            setConfirmAction(null);
        }, 3000);
    };

    const handleConfirmClick = async (
        action: string,
        handler: () => Promise<void>,
    ) => {
        if (confirmAction === action) {
            setConfirmAction(null);
            if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
            await handler();
        } else {
            startConfirm(action);
        }
    };

    // Chat handler
    const handleMessageRecruiter = async () => {
        if (!recruiterUserId) return;
        try {
            setStartingChat(true);
            const conversationId = await startChatConversation(
                getToken,
                recruiterUserId,
                {
                    application_id: item.id,
                    job_id: item.job?.id ?? item.job_id,
                    company_id:
                        item.job?.company?.id ?? item.company?.id ?? null,
                },
            );
            router.push(`/portal/messages?conversationId=${conversationId}`);
        } catch (err: any) {
            console.error("Failed to start chat:", err);
            toast.error(err?.message || "Failed to start chat");
        } finally {
            setStartingChat(false);
        }
    };

    // Submit handler (context-aware: draft → AI review, ai_reviewed → submit)
    const handleSubmit = async () => {
        if (item.stage === "draft") {
            await actions.submitToAiReview(item.id);
        } else if (item.stage === "ai_reviewed") {
            await actions.submitApplication(item.id);
        }
    };

    // Back to draft handler (context-aware: ai_reviewed uses return-to-draft endpoint)
    const handleBackToDraft = async () => {
        if (item.stage === "ai_reviewed") {
            await actions.returnToDraft(item.id);
        } else {
            await actions.backToDraft(item.id);
        }
    };

    // Withdraw handler
    const handleWithdraw = async () => {
        await actions.withdraw(item.id);
    };

    // Accept proposal handler
    const handleAcceptProposal = async () => {
        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");
            const client = createAuthenticatedClient(token);
            const response = await client.get("/job-pre-screen-questions", {
                params: { job_id: item.job_id },
            });
            const questions = response.data || response;
            setPreScreenQuestions(Array.isArray(questions) ? questions : []);
            setShowProposalWizard(true);
        } catch (err: any) {
            toast.error(err?.message || "Failed to load application wizard");
        }
    };

    // Complete proposal application handler
    const handleCompleteProposal = async (wizardData: WizardData) => {
        const candidateId = (item as any).candidate_id;
        if (!candidateId) {
            toast.error("Missing candidate profile");
            return;
        }
        await actions.completeProposalApplication(
            item.id,
            candidateId,
            wizardData,
        );
    };

    // Decline proposal handler
    const handleDeclineProposal = async (reason: string, details?: string) => {
        await actions.declineProposal(item.id, reason, details);
    };

    // Get submit button label based on stage
    const getSubmitLabel = () => {
        if (item.stage === "draft") return "Submit for Review";
        if (item.stage === "ai_reviewed") return "Submit";
        return "Submit";
    };

    const getSizeClass = () => {
        switch (size) {
            case "xs":
                return "btn-xs";
            case "sm":
                return "btn-sm";
            case "md":
            default:
                return "btn-3";
        }
    };

    const isLoading = actions.loading !== null;

    // ========== DESCRIPTIVE VARIANT ==========
    if (variant === "descriptive") {
        return (
            <>
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Edit — only in draft */}
                    {canEdit && (
                        <button
                            className={`btn btn-primary ${getSizeClass()}`}
                            disabled={isLoading}
                            onClick={() => setShowEditWizard(true)}
                            title="Edit your application"
                        >
                            {actions.loading === "edit" ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                <i className="fa-duotone fa-regular fa-pen-to-square mr-1" />
                            )}
                            Edit
                        </button>
                    )}

                    {/* Move to Draft — available in several stages */}
                    {canBackToDraft && (
                        <button
                            className={`btn ${confirmAction ? "btn-success" : "btn-outline"} ${getSizeClass()}`}
                            disabled={isLoading}
                            onClick={() =>
                                handleConfirmClick(
                                    "back-to-draft",
                                    handleBackToDraft,
                                )
                            }
                            title="Move back to draft for editing"
                        >
                            {actions.loading === "back-to-draft" ||
                            actions.loading === "return-to-draft" ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                <i className="fa-duotone fa-regular fa-file-pen mr-1" />
                            )}
                            {confirmAction === "back-to-draft"
                                ? "Confirm?"
                                : "Move to Draft"}
                        </button>
                    )}

                    {/* Submit — draft or ai_reviewed */}
                    {canSubmit && (
                        <button
                            className={`btn btn-success ${getSizeClass()}`}
                            disabled={isLoading}
                            onClick={() =>
                                handleConfirmClick("submit", handleSubmit)
                            }
                            title={getSubmitLabel()}
                        >
                            {actions.loading === "submit" ||
                            actions.loading === "submit-ai" ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                <i className="fa-duotone fa-regular fa-paper-plane mr-1" />
                            )}
                            {confirmAction === "submit"
                                ? "Confirm?"
                                : getSubmitLabel()}
                        </button>
                    )}

                    {/* Withdraw */}
                    {canWithdraw && (
                        <button
                            className={`btn btn-error btn-outline ${getSizeClass()}`}
                            disabled={isLoading}
                            onClick={() =>
                                handleConfirmClick("withdraw", handleWithdraw)
                            }
                            title="Withdraw application"
                        >
                            {actions.loading === "withdraw" ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                <i className="fa-duotone fa-regular fa-ban mr-1" />
                            )}
                            {confirmAction === "withdraw"
                                ? "Confirm?"
                                : "Withdraw"}
                        </button>
                    )}

                    {/* Divider — only show if there are action buttons before message */}
                    {(canEdit ||
                        canBackToDraft ||
                        canSubmit ||
                        canWithdraw) && (
                        <div className="divider divider-horizontal mx-0" />
                    )}

                    {/* Message Recruiter — always visible */}
                    <span title={chatDisabledReason || undefined}>
                        <button
                            className={`btn btn-outline ${getSizeClass()}`}
                            disabled={!recruiterUserId || startingChat}
                            onClick={handleMessageRecruiter}
                        >
                            {startingChat ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                <>
                                    <Presence status={presenceStatus} />
                                    <i className="fa-duotone fa-regular fa-messages ml-1" />
                                    Message
                                </>
                            )}
                        </button>
                    </span>

                    {/* Proposal actions — contextual */}
                    {isProposal && (
                        <>
                            <div className="divider divider-horizontal mx-0" />
                            <button
                                className={`btn btn-primary ${getSizeClass()}`}
                                disabled={isJobClosed || isLoading}
                                onClick={handleAcceptProposal}
                                title={
                                    isJobClosed
                                        ? "Position is no longer available"
                                        : "Accept and apply"
                                }
                            >
                                <i className="fa-duotone fa-regular fa-check mr-1" />
                                Accept & Apply
                            </button>
                            <button
                                className={`btn btn-outline ${getSizeClass()}`}
                                disabled={isJobClosed || isLoading}
                                onClick={() => setShowDeclineModal(true)}
                                title="Decline this proposal"
                            >
                                <i className="fa-duotone fa-regular fa-times mr-1" />
                                Decline
                            </button>
                        </>
                    )}
                </div>

                {/* Modals - portaled to body to escape drawer stacking context */}
                <ModalPortal>
                    {showEditWizard && item.job && (
                        <ApplicationWizardModal
                            jobId={item.job.id || item.job_id}
                            jobTitle={item.job.title}
                            companyName={item.job.company?.name || "Company"}
                            onClose={() => setShowEditWizard(false)}
                            onSuccess={() => {
                                setShowEditWizard(false);
                                onStageChange?.();
                            }}
                            existingApplication={item}
                        />
                    )}

                    {showProposalWizard && (
                        <ProposalResponseWizard
                            isOpen={showProposalWizard}
                            onClose={() => setShowProposalWizard(false)}
                            applicationId={item.id}
                            jobTitle={item.job?.title || "this position"}
                            preScreenQuestions={preScreenQuestions || []}
                            onComplete={handleCompleteProposal}
                        />
                    )}

                    <DeclineModal
                        isOpen={showDeclineModal}
                        onClose={() => setShowDeclineModal(false)}
                        onSubmit={handleDeclineProposal}
                        jobTitle={item.job?.title || "this position"}
                    />
                </ModalPortal>
            </>
        );
    }

    // ========== ICON-ONLY VARIANT ==========
    return (
        <>
            <div className="flex items-center gap-1">
                {/* Edit — only shown in draft */}
                {canEdit && (
                    <button
                        className={`btn btn-ghost btn-circle ${getSizeClass()}`}
                        disabled={isLoading}
                        onClick={() => setShowEditWizard(true)}
                        title="Edit draft"
                    >
                        {actions.loading === "edit" ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : (
                            <i className="fa-duotone fa-regular fa-pen-to-square" />
                        )}
                    </button>
                )}

                {/* Move to Draft — only shown when applicable */}
                {canBackToDraft && (
                    <button
                        className={`btn btn-ghost btn-circle ${getSizeClass()}`}
                        disabled={isLoading}
                        onClick={() =>
                            handleConfirmClick(
                                "back-to-draft",
                                handleBackToDraft,
                            )
                        }
                        title={
                            confirmAction === "back-to-draft"
                                ? "Click to confirm"
                                : "Move to draft"
                        }
                    >
                        {actions.loading === "back-to-draft" ||
                        actions.loading === "return-to-draft" ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : confirmAction === "back-to-draft" ? (
                            <i className="fa-duotone fa-regular fa-check text-success" />
                        ) : (
                            <i className="fa-duotone fa-regular fa-file-pen" />
                        )}
                    </button>
                )}

                {/* Submit — only shown when applicable */}
                {canSubmit && (
                    <button
                        className={`btn btn-success ${getSizeClass()}`}
                        disabled={isLoading}
                        onClick={() =>
                            handleConfirmClick("submit", handleSubmit)
                        }
                        title={
                            confirmAction === "submit"
                                ? "Click to confirm"
                                : getSubmitLabel()
                        }
                    >
                        {actions.loading === "submit" ||
                        actions.loading === "submit-ai" ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : confirmAction === "submit" ? (
                            <i className="fa-duotone fa-regular fa-check" />
                        ) : (
                            <i className="fa-duotone fa-regular fa-paper-plane" />
                        )}
                        {confirmAction === "submit"
                            ? "Confirm?"
                            : getSubmitLabel()}
                    </button>
                )}

                {/* Withdraw — only shown when applicable */}
                {canWithdraw && (
                    <button
                        className={`btn btn-ghost text-error btn-circle ${getSizeClass()}`}
                        disabled={isLoading}
                        onClick={() =>
                            handleConfirmClick("withdraw", handleWithdraw)
                        }
                        title={
                            confirmAction === "withdraw"
                                ? "Click to confirm withdrawal"
                                : "Withdraw"
                        }
                    >
                        {actions.loading === "withdraw" ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : confirmAction === "withdraw" ? (
                            <i className="fa-duotone fa-regular fa-check" />
                        ) : (
                            <i className="fa-duotone fa-regular fa-ban" />
                        )}
                    </button>
                )}
                {/* Proposal actions — contextual */}
                {isProposal && (
                    <>
                        <div className="w-px h-4 bg-base-300 mx-0.5" />
                        <button
                            className={`btn btn-success ${getSizeClass()}`}
                            disabled={isJobClosed || isLoading}
                            onClick={handleAcceptProposal}
                            title={
                                isJobClosed
                                    ? "Position closed"
                                    : "Accept & Apply"
                            }
                        >
                            <i className="fa-duotone fa-regular fa-handshake" />
                            Accept
                        </button>
                        <button
                            className={`btn btn-error btn-circle ${getSizeClass()}`}
                            disabled={isJobClosed || isLoading}
                            onClick={() => setShowDeclineModal(true)}
                            title="Decline proposal"
                        >
                            <i className="fa-duotone fa-regular fa-times" />
                        </button>
                    </>
                )}

                {/* Divider — only if there are action buttons before message */}
                {(canEdit ||
                    canBackToDraft ||
                    canSubmit ||
                    canWithdraw ||
                    isProposal) && (
                    <div className="w-px h-4 bg-base-300 mx-0.5" />
                )}

                {/* Message — always visible */}
                <span title={chatDisabledReason || undefined}>
                    <button
                        className={`btn btn-ghost btn-circle relative ${getSizeClass()}`}
                        disabled={!recruiterUserId || startingChat}
                        onClick={handleMessageRecruiter}
                        title="Message recruiter"
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

                {/* View Details */}
                {onViewDetails && (
                    <>
                        <div className="w-px h-4 bg-base-300 mx-0.5" />
                        <button
                            className={`btn btn-primary btn-circle ${getSizeClass()}`}
                            onClick={() => onViewDetails(item.id)}
                            title="View details"
                        >
                            <i className="fa-duotone fa-regular fa-eye" />
                        </button>
                    </>
                )}
            </div>

            {/* Modals - portaled to body to escape drawer stacking context */}
            <ModalPortal>
                {showEditWizard && item.job && (
                    <ApplicationWizardModal
                        jobId={item.job.id || item.job_id}
                        jobTitle={item.job.title}
                        companyName={item.job.company?.name || "Company"}
                        onClose={() => setShowEditWizard(false)}
                        onSuccess={() => {
                            setShowEditWizard(false);
                            onStageChange?.();
                        }}
                        existingApplication={item}
                    />
                )}

                {showProposalWizard && (
                    <ProposalResponseWizard
                        isOpen={showProposalWizard}
                        onClose={() => setShowProposalWizard(false)}
                        applicationId={item.id}
                        jobTitle={item.job?.title || "this position"}
                        preScreenQuestions={preScreenQuestions || []}
                        onComplete={handleCompleteProposal}
                    />
                )}

                <DeclineModal
                    isOpen={showDeclineModal}
                    onClose={() => setShowDeclineModal(false)}
                    onSubmit={handleDeclineProposal}
                    jobTitle={item.job?.title || "this position"}
                />
            </ModalPortal>
        </>
    );
}
