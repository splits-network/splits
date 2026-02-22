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
import { Button, SpeedDial, type SpeedDialAction } from "@splits-network/basel-ui";
import SubmitToJobWizard from "../wizards/submit-to-job-wizard";
import TerminateCandidateModal from "../modals/terminate-candidate-modal";
import VerificationModal from "../modals/verification-modal";
import ScheduleInterviewModal from "@/components/basel/scheduling/schedule-interview-modal";

/* ─── Types ─────────────────────────────────────────────────────────────── */

export interface CandidateActionsToolbarProps {
    candidate: Candidate;
    variant: "icon-only" | "descriptive";
    layout?: "horizontal" | "vertical";
    size?: "xs" | "sm" | "md";
    showActions?: {
        viewDetails?: boolean;
        message?: boolean;
        sendJobOpportunity?: boolean;
        scheduleInterview?: boolean;
        verify?: boolean;
        endRepresentation?: boolean;
    };
    onRefresh?: () => void;
    onViewDetails?: (candidateId: string) => void;
    onVerify?: (candidate: Candidate) => void;
    onMessage?: (
        conversationId: string,
        candidateName: string,
        candidateUserId: string,
        context?: any,
    ) => void;
    className?: string;
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export default function CandidateActionsToolbar({
    candidate,
    variant,
    layout = "horizontal",
    size = "sm",
    showActions = {},
    onRefresh,
    onViewDetails,
    onVerify,
    onMessage,
    className = "",
}: CandidateActionsToolbarProps) {
    const { getToken } = useAuth();
    const router = useRouter();
    const toast = useToast();
    const { isAdmin, isRecruiter } = useUserProfile();
    const refresh = onRefresh ?? (() => {});

    /* ── Modal states ── */
    const [showSubmitWizard, setShowSubmitWizard] = useState(false);
    const [showTerminateModal, setShowTerminateModal] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);

    /* ── Loading states ── */
    const [startingChat, setStartingChat] = useState(false);

    /* ── Chat presence ── */
    const canChat = Boolean(candidate.user_id);
    const chatDisabledReason = canChat
        ? null
        : "This candidate isn't linked to a user yet.";
    const presence = usePresence([candidate.user_id], { enabled: canChat });
    const presenceStatus = candidate.user_id
        ? presence[candidate.user_id]?.status
        : undefined;

    /* ── Permissions ── */

    const canManageCandidate = useMemo(() => {
        if (isAdmin) return true;
        if (isRecruiter && candidate.is_sourcer) return true;
        if (isRecruiter && candidate.has_active_relationship) return true;
        return false;
    }, [isAdmin, isRecruiter, candidate]);

    const canVerifyCandidate = useMemo(
        () => isAdmin || isRecruiter,
        [isAdmin, isRecruiter],
    );

    const canSendJobOpportunity = useMemo(
        () => isRecruiter || isAdmin,
        [isRecruiter, isAdmin],
    );

    /* ── Action Handlers ── */

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

    /* ── Action Visibility ── */

    const actions = {
        viewDetails: showActions.viewDetails !== false,
        message: showActions.message !== false,
        sendJobOpportunity:
            showActions.sendJobOpportunity !== false && canSendJobOpportunity,
        scheduleInterview:
            showActions.scheduleInterview !== false && (isRecruiter || isAdmin),
        verify: showActions.verify !== false && canVerifyCandidate,
        endRepresentation:
            showActions.endRepresentation !== false &&
            isRecruiter &&
            candidate.has_active_relationship,
    };

    const getSizeClass = () => `btn-${size}`;
    const getLayoutClass = () =>
        layout === "horizontal" ? "gap-1" : "flex-col gap-2";

    /* ── Modals ── */

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
            {showVerifyModal && (
                <VerificationModal
                    candidate={candidate}
                    isOpen={showVerifyModal}
                    onClose={() => setShowVerifyModal(false)}
                    onUpdate={() => {
                        setShowVerifyModal(false);
                        refresh();
                    }}
                />
            )}
            {showScheduleModal && (
                <ScheduleInterviewModal
                    candidateName={candidate.full_name || "Unknown"}
                    candidateEmail={candidate.email || undefined}
                    onClose={() => setShowScheduleModal(false)}
                    onSuccess={() => {
                        setShowScheduleModal(false);
                        refresh();
                    }}
                />
            )}
        </ModalPortal>
    );

    /* ── Icon-Only Variant (SpeedDial) ── */

    if (variant === "icon-only") {
        const speedDialActions: SpeedDialAction[] = [];

        if (actions.sendJobOpportunity) {
            speedDialActions.push({
                key: "send-job",
                icon: "fa-duotone fa-regular fa-paper-plane",
                label: "Send Job Opportunity",
                variant: "btn-primary",
                onClick: () => setShowSubmitWizard(true),
            });
        }
        if (actions.scheduleInterview) {
            speedDialActions.push({
                key: "schedule-interview",
                icon: "fa-duotone fa-regular fa-calendar-plus",
                label: "Schedule Interview",
                variant: "btn-info",
                onClick: () => setShowScheduleModal(true),
            });
        }
        if (actions.verify && candidate.verification_status !== "verified") {
            speedDialActions.push({
                key: "verify",
                icon: "fa-duotone fa-regular fa-badge-check",
                label: "Verify Candidate",
                variant: "btn-success",
                onClick: () => setShowVerifyModal(true),
            });
        }
        if (actions.endRepresentation) {
            speedDialActions.push({
                key: "end-rep",
                icon: "fa-duotone fa-regular fa-link-slash",
                label: "End Representation",
                variant: "btn-error",
                onClick: () => setShowTerminateModal(true),
            });
        }
        if (actions.message) {
            speedDialActions.push({
                key: "message",
                icon: "fa-duotone fa-regular fa-messages",
                label: "Message Candidate",
                variant: "btn-neutral btn-outline",
                disabled: !canChat || startingChat,
                loading: startingChat,
                title: chatDisabledReason || undefined,
                renderButton: (
                    <span title={chatDisabledReason || undefined} className="relative inline-block">
                        <Presence
                            status={presenceStatus}
                            className="absolute -top-1 -right-1 z-10"
                        />
                        <Button
                            icon="fa-duotone fa-regular fa-messages"
                            variant="btn-neutral btn-circle btn-outline"
                            size={size}
                            onClick={handleStartChat}
                            disabled={!canChat || startingChat}
                            loading={startingChat}
                            title="Message Candidate"
                        />
                    </span>
                ),
            });
        }
        if (actions.viewDetails) {
            speedDialActions.push({
                key: "details",
                icon: "fa-duotone fa-regular fa-eye",
                label: "View Details",
                variant: "btn-primary",
                onClick: onViewDetails ? handleViewDetails : undefined,
                href: !onViewDetails ? `/portal/candidates?candidateId=${candidate.id}` : undefined,
            });
        }

        return (
            <>
                <SpeedDial
                    actions={speedDialActions}
                    size={size ?? "sm"}
                    className={className}
                />
                {modals}
            </>
        );
    }

    /* ── Descriptive Variant ── */

    return (
        <>
            <div
                className={`flex flex-wrap items-center ${getLayoutClass()} ${className}`}
            >
                {/* Send Job Opportunity — Primary CTA */}
                {actions.sendJobOpportunity && (
                    <button
                        onClick={() => setShowSubmitWizard(true)}
                        className={`btn ${getSizeClass()} btn-primary gap-2`}
                        style={{ borderRadius: 0 }}
                        title="Send Job Opportunity"
                    >
                        <i className="fa-duotone fa-regular fa-paper-plane" />
                        <span className="hidden md:inline">Send Job</span>
                    </button>
                )}

                {/* Schedule Interview */}
                {actions.scheduleInterview && (
                    <button
                        onClick={() => setShowScheduleModal(true)}
                        className={`btn ${getSizeClass()} btn-info gap-2`}
                        style={{ borderRadius: 0 }}
                        title="Schedule Interview"
                    >
                        <i className="fa-duotone fa-regular fa-calendar-plus" />
                        <span className="hidden md:inline">Schedule</span>
                    </button>
                )}

                {/* Verify */}
                {actions.verify &&
                    candidate.verification_status !== "verified" && (
                        <button
                            onClick={() => setShowVerifyModal(true)}
                            className={`btn ${getSizeClass()} btn-success gap-2`}
                            style={{ borderRadius: 0 }}
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
                        style={{ borderRadius: 0 }}
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
                        actions.verify ||
                        actions.endRepresentation) && (
                        <div className="hidden sm:block w-px self-stretch bg-base-content/20 mx-1" />
                    )}

                {/* Message */}
                {actions.message && (
                    <span title={chatDisabledReason || undefined}>
                        <button
                            onClick={handleStartChat}
                            className={`btn ${getSizeClass()} btn-outline gap-2`}
                            style={{ borderRadius: 0 }}
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

                {/* View Details — far right */}
                {actions.viewDetails && (
                    <>
                        <div className="hidden sm:block w-px self-stretch bg-base-content/20 mx-1" />
                        {onViewDetails ? (
                            <button
                                onClick={handleViewDetails}
                                className={`btn ${getSizeClass()} btn-outline gap-2`}
                                style={{ borderRadius: 0 }}
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
                                style={{ borderRadius: 0 }}
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
