"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { startChatConversation } from "@/lib/chat-start";
import { useToast } from "@/lib/toast-context";
import { usePresence } from "@/hooks/use-presence";
import { useApplicationActions } from "@/hooks/use-application-actions";
import { Presence } from "@/components/presense";
import { ModalPortal } from "@splits-network/shared-ui";
import ApplicationWizardModal from "@/components/application-wizard-modal";
import { DeclineModal } from "../modals/decline-modal";
import { type Application, WITHDRAWABLE_STAGES } from "../../types";
import { SpeedMenu, type SpeedDialAction } from "@splits-network/basel-ui";

/* ─── Constants ─────────────────────────────────────────────────────────── */

const BACK_TO_DRAFT_STAGES = [
    "ai_review",
    "gpt_review",
    "ai_failed",
    "ai_reviewed",
    "recruiter_request",
    "recruiter_review",
    "screen",
    "rejected",
];

const SUBMITTABLE_STAGES = ["draft", "ai_reviewed", "ai_failed"];

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface ActionsToolbarProps {
    item: Application;
    size?: "xs" | "sm" | "md";
    variant?: "icon-only" | "descriptive";
    onStageChange?: () => void;
    onViewDetails?: (id: string) => void;
}

/* ─── Component ─────────────────────────────────────────────────────────── */

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

    // Decline modal state
    const [showDeclineModal, setShowDeclineModal] = useState(false);

    // Application actions hook
    const actions = useApplicationActions({ onSuccess: onStageChange });

    // Derived state
    const recruiterUserId = item.recruiter?.user?.id;
    const canEdit = item.stage === "draft" || item.stage === "ai_failed";
    const canBackToDraft = BACK_TO_DRAFT_STAGES.includes(item.stage);
    const canSubmit = SUBMITTABLE_STAGES.includes(item.stage);
    const canWithdraw = WITHDRAWABLE_STAGES.includes(item.stage);
    const isProposal = item.stage === "recruiter_proposed";
    const isOffer =
        item.stage === "offer" && !item.accepted_by_candidate;
    const hasAcceptedOffer =
        item.stage === "offer" && !!item.accepted_by_candidate;
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
            toast.error(err?.message || "Couldn't start conversation. Try again.");
        } finally {
            setStartingChat(false);
        }
    };

    // Submit handler
    const handleSubmit = async () => {
        if (item.stage === "draft" || item.stage === "ai_failed") {
            await actions.submitToAiReview(item.id);
        } else if (item.stage === "ai_reviewed") {
            await actions.submitApplication(item.id);
        }
    };

    // Back to draft handler
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

    // Decline proposal handler
    const handleDeclineProposal = async (reason: string, details?: string) => {
        await actions.declineProposal(item.id, reason, details);
    };

    // Get submit button label based on stage
    const getSubmitLabel = () => {
        if (item.stage === "draft") return "Submit for Review";
        if (item.stage === "ai_failed") return "Resubmit for Review";
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

    /* ── Modals ── */

    const modals = (
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

            <DeclineModal
                isOpen={showDeclineModal}
                onClose={() => setShowDeclineModal(false)}
                onSubmit={handleDeclineProposal}
                jobTitle={item.job?.title || "this position"}
            />
        </ModalPortal>
    );

    /* ── Descriptive Variant ── */

    if (variant === "descriptive") {
        return (
            <>
                <div className="flex items-center gap-1 flex-wrap">
                    {/* Edit -- only in draft */}
                    {canEdit && (
                        <button
                            className={`btn btn-primary ${getSizeClass()} gap-2`}
                            style={{ borderRadius: 0 }}
                            disabled={isLoading}
                            onClick={() => setShowEditWizard(true)}
                            title="Edit your application"
                        >
                            {actions.loading === "edit" ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                <i className="fa-duotone fa-regular fa-pen-to-square" />
                            )}
                            <span className="hidden md:inline">Edit</span>
                        </button>
                    )}

                    {/* Move to Draft */}
                    {canBackToDraft && (
                        <button
                            className={`btn ${confirmAction === "back-to-draft" ? "btn-success" : "btn-outline"} ${getSizeClass()} gap-2`}
                            style={{ borderRadius: 0 }}
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
                                <i className="fa-duotone fa-regular fa-file-pen" />
                            )}
                            <span className="hidden md:inline">
                                {confirmAction === "back-to-draft"
                                    ? "Confirm?"
                                    : "Move to Draft"}
                            </span>
                        </button>
                    )}

                    {/* Submit */}
                    {canSubmit && (
                        <button
                            className={`btn btn-success ${getSizeClass()} gap-2`}
                            style={{ borderRadius: 0 }}
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
                                <i className="fa-duotone fa-regular fa-paper-plane" />
                            )}
                            <span className="hidden md:inline">
                                {confirmAction === "submit"
                                    ? "Confirm?"
                                    : getSubmitLabel()}
                            </span>
                        </button>
                    )}

                    {/* Withdraw */}
                    {canWithdraw && (
                        <button
                            className={`btn btn-error btn-outline ${getSizeClass()} gap-2`}
                            style={{ borderRadius: 0 }}
                            disabled={isLoading}
                            onClick={() =>
                                handleConfirmClick("withdraw", handleWithdraw)
                            }
                            title="Withdraw application"
                        >
                            {actions.loading === "withdraw" ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                <i className="fa-duotone fa-regular fa-ban" />
                            )}
                            <span className="hidden md:inline">
                                {confirmAction === "withdraw"
                                    ? "Confirm?"
                                    : "Withdraw"}
                            </span>
                        </button>
                    )}

                    {/* Review Offer */}
                    {isOffer && (
                        <button
                            className={`btn btn-success ${getSizeClass()} gap-2`}
                            style={{ borderRadius: 0 }}
                            onClick={() =>
                                router.push(
                                    `/portal/applications/${item.id}/offer`,
                                )
                            }
                            title="Review and accept this offer"
                        >
                            <i className="fa-duotone fa-regular fa-file-signature" />
                            <span className="hidden md:inline">
                                Review Offer
                            </span>
                        </button>
                    )}

                    {/* Already accepted indicator */}
                    {hasAcceptedOffer && (
                        <span className={`btn btn-success btn-outline ${getSizeClass()} gap-2 no-animation pointer-events-none`}>
                            <i className="fa-duotone fa-regular fa-check-double" />
                            <span className="hidden md:inline">Offer Accepted</span>
                        </span>
                    )}

                    {/* Divider */}
                    {(canEdit ||
                        canBackToDraft ||
                        canSubmit ||
                        canWithdraw ||
                        isOffer) && (
                        <div className="hidden sm:block w-px self-stretch bg-base-300 mx-1" />
                    )}

                    {/* Message Recruiter */}
                    <span title={chatDisabledReason || undefined}>
                        <button
                            className={`btn btn-outline ${getSizeClass()} gap-2`}
                            style={{ borderRadius: 0 }}
                            disabled={!recruiterUserId || startingChat}
                            onClick={handleMessageRecruiter}
                        >
                            {startingChat ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                <>
                                    <Presence status={presenceStatus} />
                                    <i className="fa-duotone fa-regular fa-messages" />
                                    <span className="hidden md:inline">
                                        Message
                                    </span>
                                </>
                            )}
                        </button>
                    </span>

                    {/* Proposal actions */}
                    {isProposal && (
                        <>
                            <div className="hidden sm:block w-px self-stretch bg-base-300 mx-1" />
                            <button
                                className={`btn btn-primary ${getSizeClass()} gap-2`}
                                style={{ borderRadius: 0 }}
                                disabled={isJobClosed || isLoading}
                                onClick={() => setShowEditWizard(true)}
                                title={
                                    isJobClosed
                                        ? "Position is no longer available"
                                        : "Accept and apply"
                                }
                            >
                                <i className="fa-duotone fa-regular fa-check" />
                                <span className="hidden md:inline">
                                    Accept & Apply
                                </span>
                            </button>
                            <button
                                className={`btn btn-outline ${getSizeClass()} gap-2`}
                                style={{ borderRadius: 0 }}
                                disabled={isJobClosed || isLoading}
                                onClick={() => setShowDeclineModal(true)}
                                title="Decline this proposal"
                            >
                                <i className="fa-duotone fa-regular fa-times" />
                                <span className="hidden md:inline">
                                    Decline
                                </span>
                            </button>
                        </>
                    )}
                </div>

                {modals}
            </>
        );
    }

    /* ── Icon-Only Variant (SpeedDial) ── */

    const speedDialActions: SpeedDialAction[] = [];

    if (canEdit) {
        speedDialActions.push({
            key: "edit",
            icon: "fa-duotone fa-regular fa-pen-to-square",
            label: "Edit Draft",
            variant: "btn-ghost",
            loading: actions.loading === "edit",
            disabled: isLoading,
            onClick: () => setShowEditWizard(true),
        });
    }

    if (canBackToDraft) {
        speedDialActions.push({
            key: "back-to-draft",
            icon:
                confirmAction === "back-to-draft"
                    ? "fa-duotone fa-regular fa-check"
                    : "fa-duotone fa-regular fa-file-pen",
            label:
                confirmAction === "back-to-draft"
                    ? "Confirm?"
                    : "Move to Draft",
            variant:
                confirmAction === "back-to-draft" ? "btn-success" : "btn-ghost",
            loading:
                actions.loading === "back-to-draft" ||
                actions.loading === "return-to-draft",
            disabled: isLoading,
            keepOpen: confirmAction !== "back-to-draft",
            onClick: () =>
                handleConfirmClick("back-to-draft", handleBackToDraft),
        });
    }

    if (canSubmit) {
        speedDialActions.push({
            key: "submit",
            icon:
                confirmAction === "submit"
                    ? "fa-duotone fa-regular fa-check"
                    : "fa-duotone fa-regular fa-paper-plane",
            label: confirmAction === "submit" ? "Confirm?" : getSubmitLabel(),
            variant: "btn-success",
            loading:
                actions.loading === "submit" || actions.loading === "submit-ai",
            disabled: isLoading,
            keepOpen: confirmAction !== "submit",
            onClick: () => handleConfirmClick("submit", handleSubmit),
        });
    }

    if (canWithdraw) {
        speedDialActions.push({
            key: "withdraw",
            icon:
                confirmAction === "withdraw"
                    ? "fa-duotone fa-regular fa-check"
                    : "fa-duotone fa-regular fa-ban",
            label: confirmAction === "withdraw" ? "Confirm?" : "Withdraw",
            variant: "btn-error",
            loading: actions.loading === "withdraw",
            disabled: isLoading,
            keepOpen: confirmAction !== "withdraw",
            onClick: () => handleConfirmClick("withdraw", handleWithdraw),
        });
    }

    if (isOffer) {
        speedDialActions.push({
            key: "review-offer",
            icon: "fa-duotone fa-regular fa-file-signature",
            label: "Review Offer",
            variant: "btn-success",
            onClick: () =>
                router.push(`/portal/applications/${item.id}/offer`),
        });
    }

    if (isProposal) {
        speedDialActions.push({
            key: "accept",
            icon: "fa-duotone fa-regular fa-handshake",
            label: "Accept & Apply",
            variant: "btn-success",
            disabled: isJobClosed || isLoading,
            title: isJobClosed ? "Position closed" : "Accept & Apply",
            onClick: () => setShowEditWizard(true),
        });
        speedDialActions.push({
            key: "decline",
            icon: "fa-duotone fa-regular fa-times",
            label: "Decline",
            variant: "btn-error",
            disabled: isJobClosed || isLoading,
            onClick: () => setShowDeclineModal(true),
        });
    }

    speedDialActions.push({
        key: "message",
        icon: "fa-duotone fa-regular fa-messages",
        label: "Message",
        variant: "btn-ghost",
        loading: startingChat,
        disabled: !recruiterUserId || startingChat,
        title: chatDisabledReason || "Message recruiter",
        onClick: handleMessageRecruiter,
    });

    if (onViewDetails) {
        speedDialActions.push({
            key: "details",
            icon: "fa-duotone fa-regular fa-eye",
            label: "View Details",
            variant: "btn-primary",
            onClick: () => onViewDetails(item.id),
        });
    }

    return (
        <>
            <SpeedMenu actions={speedDialActions} size={size} />
            {modals}
        </>
    );
}
