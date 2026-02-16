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
import type { Candidate } from "../../types";
import { ExpandableButton } from "./expandable-button";
import SubmitToJobWizard from "../wizards/submit-to-job-wizard";
import TerminateCandidateModal from "../modals/terminate-candidate-modal";
import EditCandidateModal from "../modals/edit-candidate-modal";
import VerificationModal from "../modals/verification-modal";

// ===== TYPES =====

export interface CandidateActionsToolbarProps {
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

// ===== COMPONENT =====

export default function CandidateActionsToolbar({
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
}: CandidateActionsToolbarProps) {
    const { getToken } = useAuth();
    const router = useRouter();
    const toast = useToast();
    const { isAdmin, isRecruiter } = useUserProfile();
    const refresh = onRefresh ?? (() => {});

    // Modal states
    const [showSubmitWizard, setShowSubmitWizard] = useState(false);
    const [showTerminateModal, setShowTerminateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);

    // Loading states
    const [startingChat, setStartingChat] = useState(false);

    // Chat presence
    const canChat = Boolean(candidate.user_id);
    const chatDisabledReason = canChat
        ? null
        : "This candidate isn't linked to a user yet.";
    const presence = usePresence([candidate.user_id], { enabled: canChat });
    const presenceStatus = candidate.user_id
        ? presence[candidate.user_id]?.status
        : undefined;

    // ===== PERMISSION LOGIC =====

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

    // ===== ACTION HANDLERS =====

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
        refresh();
    };

    const handleViewDetails = () => {
        if (onViewDetails) onViewDetails(candidate.id);
    };

    // ===== ACTION VISIBILITY =====

    const actions = {
        viewDetails: showActions.viewDetails !== false,
        message: showActions.message !== false,
        sendJobOpportunity:
            showActions.sendJobOpportunity !== false && canSendJobOpportunity,
        edit: showActions.edit !== false && canManageCandidate,
        verify: showActions.verify !== false && canVerifyCandidate,
        endRepresentation:
            showActions.endRepresentation !== false &&
            isRecruiter &&
            candidate.has_active_relationship,
    };

    // ===== RENDER HELPERS =====

    const getSizeClass = () => `btn-${size}`;

    const getLayoutClass = () =>
        layout === "horizontal" ? "gap-1" : "flex-col gap-2";

    // ===== MODALS (shared between both variants) =====

    const modals = (
        <ModalPortal>
            {showSubmitWizard && (
                <SubmitToJobWizard
                    candidateId={candidate.id}
                    candidateName={candidate.full_name || "Unknown"}
                    onClose={() => setShowSubmitWizard(false)}
                    onSubmit={handleSubmitToJob}
                />
            )}
            {showTerminateModal && (
                <TerminateCandidateModal
                    isOpen={showTerminateModal}
                    onClose={() => setShowTerminateModal(false)}
                    onSuccess={() => {
                        setShowTerminateModal(false);
                        refresh();
                    }}
                    candidateId={candidate.id}
                    candidateName={candidate.full_name || "Unknown"}
                />
            )}
            {showEditModal && (
                <EditCandidateModal
                    candidateId={candidate.id}
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={() => {
                        setShowEditModal(false);
                        refresh();
                    }}
                />
            )}
            {showVerifyModal && (
                <VerificationModal
                    candidate={candidate}
                    isOpen={showVerifyModal}
                    onClose={() => setShowVerifyModal(false)}
                    onUpdate={(updatedCandidate) => {
                        setShowVerifyModal(false);
                        refresh();
                    }}
                />
            )}
        </ModalPortal>
    );

    // ===== ICON-ONLY VARIANT =====

    if (variant === "icon-only") {
        return (
            <>
                <div
                    className={`flex items-center ${getLayoutClass()} ${className}`}
                >
                    {/* Send Job Opportunity - Primary CTA */}
                    {actions.sendJobOpportunity && (
                        <ExpandableButton
                            icon="fa-duotone fa-regular fa-paper-plane"
                            label="Send Job"
                            variant="btn-primary"
                            size={size}
                            onClick={() => setShowSubmitWizard(true)}
                            title="Send Job Opportunity"
                        />
                    )}

                    {/* Edit */}
                    {actions.edit && (
                        <ExpandableButton
                            icon="fa-duotone fa-regular fa-pen-to-square"
                            label="Edit"
                            variant="btn-ghost"
                            size={size}
                            onClick={() => setShowEditModal(true)}
                            title="Edit Candidate"
                        />
                    )}

                    {/* Verify */}
                    {actions.verify &&
                        candidate.verification_status !== "verified" && (
                            <ExpandableButton
                                icon="fa-duotone fa-regular fa-badge-check"
                                label="Verify"
                                variant="btn-success"
                                size={size}
                                onClick={() => setShowVerifyModal(true)}
                                title="Verify Candidate"
                            />
                        )}

                    {/* End Representation */}
                    {actions.endRepresentation && (
                        <ExpandableButton
                            icon="fa-duotone fa-regular fa-link-slash"
                            label="End Rep"
                            variant="btn-error"
                            size={size}
                            onClick={() => setShowTerminateModal(true)}
                            title="End Representation"
                        />
                    )}

                    {/* Divider before Message */}
                    {actions.message &&
                        (actions.sendJobOpportunity ||
                            actions.edit ||
                            actions.verify ||
                            actions.endRepresentation) && (
                            <div className="w-px h-4 bg-dark/20 mx-0.5" />
                        )}

                    {/* Message */}
                    {actions.message && (
                        <span title={chatDisabledReason || undefined}>
                            <ExpandableButton
                                icon="fa-duotone fa-regular fa-messages"
                                label="Message"
                                variant="btn-ghost"
                                size={size}
                                onClick={handleStartChat}
                                disabled={!canChat || startingChat}
                                loading={startingChat}
                                title="Message Candidate"
                            />
                        </span>
                    )}

                    {/* Divider before View Details */}
                    {actions.viewDetails && (
                        <>
                            <div className="w-px h-4 bg-dark/20 mx-0.5" />
                            {onViewDetails ? (
                                <ExpandableButton
                                    icon="fa-duotone fa-regular fa-eye"
                                    label="Details"
                                    variant="btn-primary"
                                    size={size}
                                    onClick={handleViewDetails}
                                    title="View Details"
                                />
                            ) : (
                                <ExpandableButton
                                    icon="fa-duotone fa-regular fa-eye"
                                    label="Details"
                                    variant="btn-primary"
                                    size={size}
                                    href={`/portal/candidates/${candidate.id}`}
                                    title="View Details"
                                />
                            )}
                        </>
                    )}
                </div>

                {modals}
            </>
        );
    }

    // ===== DESCRIPTIVE VARIANT =====

    return (
        <>
            <div
                className={`flex flex-wrap items-center ${getLayoutClass()} ${className}`}
            >
                {/* Send Job Opportunity - Primary CTA */}
                {actions.sendJobOpportunity && (
                    <button
                        onClick={() => setShowSubmitWizard(true)}
                        className={`btn ${getSizeClass()} btn-primary gap-2`}
                        title="Send Job Opportunity"
                    >
                        <i className="fa-duotone fa-regular fa-paper-plane" />
                        <span className="hidden md:inline">Send Job</span>
                    </button>
                )}

                {/* Edit */}
                {actions.edit && (
                    <button
                        onClick={() => setShowEditModal(true)}
                        className={`btn ${getSizeClass()} btn-ghost gap-2`}
                        title="Edit Candidate"
                    >
                        <i className="fa-duotone fa-regular fa-pen-to-square" />
                        <span className="hidden md:inline">Edit</span>
                    </button>
                )}

                {/* Verify */}
                {actions.verify &&
                    candidate.verification_status !== "verified" && (
                        <button
                            onClick={() => setShowVerifyModal(true)}
                            className={`btn ${getSizeClass()} btn-success gap-2`}
                            title="Verify Candidate"
                        >
                            <i className="fa-duotone fa-regular fa-badge-check" />
                            <span className="hidden md:inline">Verify</span>
                        </button>
                    )}

                {/* End Representation */}
                {actions.endRepresentation && (
                    <button
                        onClick={() => setShowTerminateModal(true)}
                        className={`btn ${getSizeClass()} btn-error btn-outline gap-2`}
                        title="End Representation"
                    >
                        <i className="fa-duotone fa-regular fa-link-slash" />
                        <span className="hidden md:inline">
                            End Representation
                        </span>
                    </button>
                )}

                {/* Divider before Message */}
                {actions.message &&
                    (actions.sendJobOpportunity ||
                        actions.edit ||
                        actions.verify ||
                        actions.endRepresentation) && (
                        <div className="hidden sm:block w-px self-stretch bg-dark/20 mx-1" />
                    )}

                {/* Message */}
                {actions.message && (
                    <span title={chatDisabledReason || undefined}>
                        <button
                            onClick={handleStartChat}
                            className={`btn ${getSizeClass()} btn-outline gap-2`}
                            title="Message Candidate"
                            disabled={!canChat || startingChat}
                        >
                            <Presence status={presenceStatus} />
                            {startingChat ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                <i className="fa-duotone fa-regular fa-messages" />
                            )}
                            <span className="hidden md:inline">Message</span>
                        </button>
                    </span>
                )}

                {/* View Details - far right */}
                {actions.viewDetails && (
                    <>
                        <div className="hidden sm:block w-px self-stretch bg-dark/20 mx-1" />
                        {onViewDetails ? (
                            <button
                                onClick={handleViewDetails}
                                className={`btn ${getSizeClass()} btn-outline gap-2`}
                                title="View Details"
                            >
                                <i className="fa-duotone fa-regular fa-eye" />
                                <span className="hidden md:inline">
                                    View Details
                                </span>
                            </button>
                        ) : (
                            <Link
                                href={`/portal/candidates/${candidate.id}`}
                                className={`btn ${getSizeClass()} btn-outline gap-2`}
                                title="View Details"
                            >
                                <i className="fa-duotone fa-regular fa-eye" />
                                <span className="hidden md:inline">
                                    View Details
                                </span>
                            </Link>
                        )}
                    </>
                )}
            </div>

            {modals}
        </>
    );
}
