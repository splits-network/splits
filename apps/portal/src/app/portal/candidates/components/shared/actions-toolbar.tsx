"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { useUserProfile } from "@/contexts";
import { startChatConversation } from "@/lib/chat-start";
import { usePresence } from "@/hooks/use-presence";
import { Presence } from "@/components/presense";
import { ModalPortal } from "@splits-network/shared-ui";
import { Candidate } from "../../types";
import SubmitToJobWizard from "../wizards/submit-to-job-wizard";
import TerminateCandidateModal from "../modals/terminate-candidate-modal";

export interface ActionsToolbarProps {
    candidate: Candidate;
    variant: "icon-only" | "descriptive";
    layout?: "horizontal" | "vertical";
    size?: "xs" | "sm" | "md";
    showActions?: {
        viewDetails?: boolean;
        message?: boolean;
        sendJobOpportunity?: boolean;
        edit?: boolean;
        verify?: boolean;
        endRepresentation?: boolean;
    };
    onRefresh?: () => void;
    onViewDetails?: (candidateId: string) => void;
    onEdit?: (candidateId: string) => void;
    onVerify?: (candidate: Candidate) => void;
    onMessage?: (
        conversationId: string,
        candidateName: string,
        candidateUserId: string,
        context?: any,
    ) => void;
    className?: string;
}

export default function ActionsToolbar({
    candidate,
    variant,
    layout = "horizontal",
    size = "sm",
    showActions = {},
    onRefresh,
    onViewDetails,
    onEdit,
    onVerify,
    onMessage,
    className = "",
}: ActionsToolbarProps) {
    const { getToken } = useAuth();
    const router = useRouter();
    const toast = useToast();
    const { isAdmin, isRecruiter } = useUserProfile();

    const [startingChat, setStartingChat] = useState(false);
    const [showSubmitWizard, setShowSubmitWizard] = useState(false);
    const [showTerminateModal, setShowTerminateModal] = useState(false);
    const canChat = Boolean(candidate.user_id);
    const chatDisabledReason = canChat
        ? null
        : "This candidate isn't linked to a user yet.";
    const presence = usePresence([candidate.user_id], { enabled: canChat });
    const presenceStatus = candidate.user_id
        ? presence[candidate.user_id]?.status
        : undefined;

    const canManageCandidate = useMemo(() => {
        if (isAdmin) return true;
        if (isRecruiter && candidate.is_sourcer) return true;
        if (isRecruiter && candidate.has_active_relationship) return true;
        return false;
    }, [isAdmin, isRecruiter, candidate]);

    const canVerifyCandidate = useMemo(() => {
        return isAdmin || isRecruiter;
    }, [isAdmin, isRecruiter]);

    const canSendJobOpportunity = useMemo(() => {
        return isRecruiter || isAdmin;
    }, [isRecruiter, isAdmin]);

    const handleStartChat = async () => {
        if (!candidate.user_id) return;
        try {
            setStartingChat(true);
            const conversationId = await startChatConversation(
                getToken,
                candidate.user_id,
                { company_id: candidate.company_id || null },
            );

            if (onMessage) {
                onMessage(
                    conversationId,
                    candidate.full_name || "Unknown",
                    candidate.user_id,
                    { company_id: candidate.company_id || null },
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

    const handleSubmitToJob = async (
        jobId: string,
        notes: string,
        documentIds: string[],
    ) => {
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");

        const client = createAuthenticatedClient(token);
        await client.post("/proposals", {
            candidate_id: candidate.id,
            job_id: jobId,
            recruiter_pitch: notes,
            document_ids: documentIds,
        });

        setShowSubmitWizard(false);
        onRefresh?.();
    };

    const actions = {
        viewDetails: showActions.viewDetails !== false,
        message: showActions.message !== false,
        sendJobOpportunity:
            showActions.sendJobOpportunity !== false && canSendJobOpportunity,
        edit: showActions.edit !== false && canManageCandidate,
        verify: showActions.verify !== false && canVerifyCandidate,
        endRepresentation: showActions.endRepresentation !== false && isRecruiter && candidate.has_active_relationship,
    };

    const sizeClass = `btn-${size}`;
    const layoutClass = layout === "horizontal" ? "gap-1" : "flex-col gap-2";

    if (variant === "icon-only") {
        return (
            <>
                <div className={`flex items-center ${layoutClass} ${className}`}>
                    {/* Send Job Opportunity - CTA */}
                    {actions.sendJobOpportunity && (
                        <button
                            onClick={() => setShowSubmitWizard(true)}
                            className={`btn ${sizeClass} btn-square btn-primary`}
                            title="Send Job Opportunity"
                        >
                            <i className="fa-duotone fa-regular fa-paper-plane" />
                        </button>
                    )}

                    {/* Edit */}
                    {actions.edit && (
                        <button
                            onClick={() => onEdit?.(candidate.id)}
                            className={`btn ${sizeClass} btn-square btn-ghost`}
                            title="Edit Candidate"
                        >
                            <i className="fa-duotone fa-regular fa-pen-to-square" />
                        </button>
                    )}

                    {/* Verify */}
                    {actions.verify &&
                        candidate.verification_status !== "verified" && (
                            <button
                                onClick={() => onVerify?.(candidate)}
                                className={`btn ${sizeClass} btn-square btn-success`}
                                title="Verify Candidate"
                            >
                                <i className="fa-duotone fa-regular fa-badge-check" />
                            </button>
                        )}

                    {/* End Representation */}
                    {actions.endRepresentation && (
                        <button
                            onClick={() => setShowTerminateModal(true)}
                            className={`btn ${sizeClass} btn-square btn-error btn-outline`}
                            title="End Representation"
                        >
                            <i className="fa-duotone fa-regular fa-link-slash" />
                        </button>
                    )}

                    {/* Divider before Message */}
                    {actions.message && (actions.sendJobOpportunity || actions.edit || actions.verify || actions.endRepresentation) && (
                        <div className="w-px h-4 bg-base-300 mx-0.5" />
                    )}

                    {/* Message */}
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
                                    <span className="loading loading-spinner loading-xs"></span>
                                ) : (
                                    <i className="fa-duotone fa-regular fa-messages" />
                                )}
                            </button>
                        </span>
                    )}

                    {/* View Details - far right */}
                    {actions.viewDetails && (
                        <>
                            <div className="w-px h-4 bg-base-300 mx-0.5" />
                            {onViewDetails ? (
                                <button
                                    onClick={() => onViewDetails(candidate.id)}
                                    className={`btn ${sizeClass} btn-square btn-primary`}
                                    title="View Details"
                                >
                                    <i className="fa-duotone fa-regular fa-eye" />
                                </button>
                            ) : (
                                <Link
                                    href={`/portal/candidates/${candidate.id}`}
                                    className={`btn ${sizeClass} btn-square btn-primary`}
                                    title="View Details"
                                >
                                    <i className="fa-duotone fa-regular fa-eye" />
                                </Link>
                            )}
                        </>
                    )}
                </div>

                <ModalPortal>
                    {showSubmitWizard && (
                        <SubmitToJobWizard
                            candidateId={candidate.id}
                            candidateName={candidate.full_name || "Unknown"}
                            onClose={() => setShowSubmitWizard(false)}
                            onSubmit={handleSubmitToJob}
                        />
                    )}
                </ModalPortal>
                {showTerminateModal && (
                    <TerminateCandidateModal
                        isOpen={showTerminateModal}
                        onClose={() => setShowTerminateModal(false)}
                        onSuccess={() => {
                            setShowTerminateModal(false);
                            onRefresh?.();
                        }}
                        candidateId={candidate.id}
                        candidateName={candidate.full_name || "Unknown"}
                    />
                )}
            </>
        );
    }

    // Descriptive variant
    return (
        <>
            <div className={`flex ${layoutClass} ${className}`}>
                {/* Send Job Opportunity - CTA */}
                {actions.sendJobOpportunity && (
                    <button
                        onClick={() => setShowSubmitWizard(true)}
                        className={`btn ${sizeClass} btn-primary gap-2`}
                    >
                        <i className="fa-duotone fa-regular fa-paper-plane" />
                        Send Job
                    </button>
                )}

                {/* Edit */}
                {actions.edit && (
                    <button
                        onClick={() => onEdit?.(candidate.id)}
                        className={`btn ${sizeClass} btn-ghost gap-2`}
                    >
                        <i className="fa-duotone fa-regular fa-pen-to-square" />
                        Edit
                    </button>
                )}

                {/* Verify */}
                {actions.verify &&
                    candidate.verification_status !== "verified" && (
                        <button
                            onClick={() => onVerify?.(candidate)}
                            className={`btn ${sizeClass} btn-success gap-2`}
                        >
                            <i className="fa-duotone fa-regular fa-badge-check" />
                            Verify
                        </button>
                    )}

                {/* End Representation */}
                {actions.endRepresentation && (
                    <button
                        onClick={() => setShowTerminateModal(true)}
                        className={`btn ${sizeClass} btn-error btn-outline gap-2`}
                    >
                        <i className="fa-duotone fa-regular fa-link-slash" />
                        End Representation
                    </button>
                )}

                {/* Divider before Message */}
                {actions.message && (actions.sendJobOpportunity || actions.edit || actions.verify || actions.endRepresentation) && (
                    <div className="divider divider-horizontal mx-0" />
                )}

                {/* Message */}
                {actions.message && (
                    <span title={chatDisabledReason || undefined}>
                        <button
                            onClick={handleStartChat}
                            className={`btn ${sizeClass} btn-outline gap-2`}
                            disabled={!canChat || startingChat}
                        >
                            <Presence status={presenceStatus} />
                            {startingChat ? (
                                <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                                <i className="fa-duotone fa-regular fa-messages" />
                            )}
                            Message
                        </button>
                    </span>
                )}

                {/* View Details - far right */}
                {actions.viewDetails && (
                    <>
                        <div className="divider divider-horizontal mx-0" />
                        {onViewDetails ? (
                            <button
                                onClick={() => onViewDetails(candidate.id)}
                                className={`btn ${sizeClass} btn-outline gap-2`}
                            >
                                <i className="fa-duotone fa-regular fa-eye" />
                                View Details
                            </button>
                        ) : (
                            <Link
                                href={`/portal/candidates/${candidate.id}`}
                                className={`btn ${sizeClass} btn-outline gap-2`}
                            >
                                <i className="fa-duotone fa-regular fa-eye" />
                                View Details
                            </Link>
                        )}
                    </>
                )}
            </div>

            <ModalPortal>
                {showSubmitWizard && (
                    <SubmitToJobWizard
                        candidateId={candidate.id}
                        candidateName={candidate.full_name || "Unknown"}
                        onClose={() => setShowSubmitWizard(false)}
                        onSubmit={handleSubmitToJob}
                    />
                )}
            </ModalPortal>
            {showTerminateModal && (
                <TerminateCandidateModal
                    isOpen={showTerminateModal}
                    onClose={() => setShowTerminateModal(false)}
                    onSuccess={() => {
                        setShowTerminateModal(false);
                        onRefresh?.();
                    }}
                    candidateId={candidate.id}
                    candidateName={candidate.full_name || "Unknown"}
                />
            )}
        </>
    );
}
