"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";

import { useToast } from "@/lib/toast-context";
import { useUserProfile } from "@/contexts";
import { startChatConversation } from "@/lib/chat-start";
import { usePresence } from "@/hooks/use-presence";
import { Presence } from "@/components/presense";
import { useChatSidebar } from "@splits-network/chat-ui";
import { ModalPortal } from "@splits-network/shared-ui";
import type { Candidate } from "../../types";
import {
    Button,
    SpeedMenu,
    type SpeedDialAction,
} from "@splits-network/basel-ui";
import BaselSubmitCandidateWizard from "@/components/basel/applications/submit-candidate-wizard";
import TerminateCandidateModal from "../modals/terminate-candidate-modal";
import RequestToRepresentModal from "../modals/request-to-represent-modal";
import VerificationModal from "../modals/verification-modal";
import ComposeEmailModal from "@/components/basel/email/compose-email-modal";
import { CallCreationModal } from "@/components/calls/call-creation-modal";
import type { Participant } from "@/components/calls/participant-picker";

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
        sendEmail?: boolean;
        scheduleCall?: boolean;
        verify?: boolean;
        endRepresentation?: boolean;
        requestRepresentation?: boolean;
        save?: boolean;
    };
    onRefresh?: () => void;
    onUpdateItem?: (id: string, patch: Partial<Candidate>) => void;
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
    onUpdateItem,
    onViewDetails,
    onVerify,
    onMessage,
    className = "",
}: CandidateActionsToolbarProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const { isAdmin, isRecruiter, isCompanyUser } = useUserProfile();
    const chatSidebar = useChatSidebar();
    const refresh = onRefresh ?? (() => {});

    /* ── Modal states ── */
    const [showSubmitWizard, setShowSubmitWizard] = useState(false);
    const [showTerminateModal, setShowTerminateModal] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [showCallModal, setShowCallModal] = useState(false);
    const [showRTRModal, setShowRTRModal] = useState(false);

    /* ── Loading states ── */
    const [startingChat, setStartingChat] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

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

    /* ── Call pre-fill ── */
    const callDefaultParticipants: Participant[] = useMemo(() => {
        if (!candidate.user_id) return [];
        const nameParts = (candidate.full_name || "").split(" ");
        return [{
            user_id: candidate.user_id,
            first_name: nameParts[0] || "",
            last_name: nameParts.slice(1).join(" ") || "",
            email: candidate.email || "",
            avatar_url: null,
            role: "participant" as const,
        }];
    }, [candidate.user_id, candidate.full_name, candidate.email]);

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
                chatSidebar.openToThread(conversationId, {
                    otherUserName: candidate.full_name || "Unknown",
                });
            }
        } catch (err: any) {
            console.error("Failed to start chat:", err);
            toast.error(err?.message || "Couldn't start conversation. Try again.");
        } finally {
            setStartingChat(false);
        }
    };

    const handleViewDetails = () => {
        if (onViewDetails) onViewDetails(candidate.id);
    };

    const handleToggleSave = useCallback(async () => {
        setIsSaving(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            const client = createAuthenticatedClient(token);

            if (candidate.is_saved && candidate.saved_record_id) {
                await client.delete(`/v3/recruiter-saved-candidates/${candidate.saved_record_id}`);
                onUpdateItem?.(candidate.id, { is_saved: false, saved_record_id: null });
                toast.info("Candidate removed from saved.");
            } else {
                const res = await client.post("/v3/recruiter-saved-candidates", { candidate_id: candidate.id });
                onUpdateItem?.(candidate.id, { is_saved: true, saved_record_id: res?.data?.id });
                toast.success("Candidate saved.");
            }
        } catch (error: any) {
            console.error("Failed to toggle save:", error);
            toast.error("Failed to update saved status.");
        } finally {
            setIsSaving(false);
        }
    }, [candidate.id, candidate.is_saved, candidate.saved_record_id, getToken, onUpdateItem, toast]);

    /* ── Action Visibility ── */

    const actions = {
        viewDetails: showActions.viewDetails !== false,
        message: showActions.message !== false,
        sendJobOpportunity:
            showActions.sendJobOpportunity !== false && canSendJobOpportunity,
        sendEmail:
            showActions.sendEmail !== false && (isRecruiter || isCompanyUser || isAdmin),
        scheduleCall:
            showActions.scheduleCall !== false && canManageCandidate && canChat,
        verify: showActions.verify !== false && canVerifyCandidate,
        endRepresentation:
            showActions.endRepresentation !== false &&
            isRecruiter &&
            candidate.has_active_relationship,
        requestRepresentation:
            showActions.requestRepresentation !== false &&
            isRecruiter &&
            !candidate.has_active_relationship &&
            !candidate.has_pending_invitation &&
            Boolean(candidate.email),
        save: showActions.save !== false && isRecruiter,
    };

    const getSizeClass = () => `btn-${size}`;
    const getLayoutClass = () =>
        layout === "horizontal" ? "gap-1" : "flex-col gap-2";

    /* ── Modals ── */

    const modals = (
        <ModalPortal>
            {showSubmitWizard && (
                <BaselSubmitCandidateWizard
                    isOpen={showSubmitWizard}
                    onClose={() => setShowSubmitWizard(false)}
                    onSuccess={refresh}
                    preSelectedCandidate={{
                        id: candidate.id,
                        full_name: candidate.full_name || "Unknown",
                        email: candidate.email || "",
                        current_title: candidate.current_title ?? undefined,
                        current_company: candidate.current_company ?? undefined,
                        location: candidate.location ?? undefined,
                    }}
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
            {showRTRModal && (
                <RequestToRepresentModal
                    isOpen={showRTRModal}
                    onClose={() => setShowRTRModal(false)}
                    onSuccess={() => {
                        setShowRTRModal(false);
                        refresh();
                    }}
                    candidateId={candidate.id}
                    candidateName={candidate.full_name || "Unknown"}
                    candidateEmail={candidate.email || ""}
                />
            )}
            {showEmailModal && (
                <ComposeEmailModal
                    toEmail={candidate.email || undefined}
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
                defaultEntityType="candidate"
                defaultEntityId={candidate.id}
                defaultEntityLabel={candidate.full_name || "Candidate"}
                onSuccess={() => setShowCallModal(false)}
            />
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
        if (actions.sendEmail) {
            speedDialActions.push({
                key: "send-email",
                icon: "fa-duotone fa-regular fa-envelope",
                label: "Send Email",
                variant: "btn-secondary",
                onClick: () => setShowEmailModal(true),
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
        if (actions.verify && candidate.verification_status !== "verified") {
            speedDialActions.push({
                key: "verify",
                icon: "fa-duotone fa-regular fa-badge-check",
                label: "Verify Candidate",
                variant: "btn-success",
                onClick: () => setShowVerifyModal(true),
            });
        }
        if (actions.requestRepresentation) {
            speedDialActions.push({
                key: "request-rtr",
                icon: "fa-duotone fa-regular fa-handshake",
                label: "Request to Represent",
                variant: "btn-accent",
                onClick: () => setShowRTRModal(true),
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
        if (actions.save) {
            speedDialActions.push({
                key: "save",
                icon: candidate.is_saved ? "fa-solid fa-bookmark" : "fa-regular fa-bookmark",
                label: candidate.is_saved ? "Unsave Candidate" : "Save Candidate",
                variant: candidate.is_saved ? "btn-warning" : "btn-ghost",
                disabled: isSaving,
                loading: isSaving,
                onClick: handleToggleSave,
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
                onClick: handleStartChat,
            });
        }
        if (actions.viewDetails) {
            speedDialActions.push({
                key: "details",
                icon: "fa-duotone fa-regular fa-eye",
                label: "View Details",
                variant: "btn-primary",
                onClick: onViewDetails ? handleViewDetails : undefined,
                href: !onViewDetails
                    ? `/portal/candidates?candidateId=${candidate.id}`
                    : undefined,
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

                {/* Send Email */}
                {actions.sendEmail && (
                    <button
                        onClick={() => setShowEmailModal(true)}
                        className={`btn ${getSizeClass()} btn-secondary gap-2`}
                        style={{ borderRadius: 0 }}
                        title="Send Email"
                    >
                        <i className="fa-duotone fa-regular fa-envelope" />
                        <span className="hidden md:inline">Email</span>
                    </button>
                )}

                {/* Schedule Call */}
                {actions.scheduleCall && (
                    <button
                        onClick={() => setShowCallModal(true)}
                        className={`btn ${getSizeClass()} btn-primary btn-outline gap-2`}
                        style={{ borderRadius: 0 }}
                        title="Schedule Call"
                    >
                        <i className="fa-duotone fa-regular fa-phone" />
                        <span className="hidden md:inline">Schedule Call</span>
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

                {/* Request to Represent */}
                {actions.requestRepresentation && (
                    <button
                        onClick={() => setShowRTRModal(true)}
                        className={`btn ${getSizeClass()} btn-accent gap-2`}
                        style={{ borderRadius: 0 }}
                        title="Request to Represent"
                    >
                        <i className="fa-duotone fa-regular fa-handshake" />
                        <span className="hidden md:inline">
                            Request to Represent
                        </span>
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

                {/* Save/Bookmark */}
                {actions.save && (
                    <button
                        onClick={handleToggleSave}
                        className={`btn ${getSizeClass()} ${candidate.is_saved ? "btn-warning" : "btn-ghost"} gap-2`}
                        style={{ borderRadius: 0 }}
                        title={candidate.is_saved ? "Unsave Candidate" : "Save Candidate"}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : (
                            <i className={candidate.is_saved ? "fa-solid fa-bookmark" : "fa-regular fa-bookmark"} />
                        )}
                        <span className="hidden md:inline">
                            {candidate.is_saved ? "Saved" : "Save"}
                        </span>
                    </button>
                )}

                {/* Divider before Message */}
                {actions.message &&
                    (actions.sendJobOpportunity ||
                        actions.verify ||
                        actions.endRepresentation ||
                        actions.save) && (
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
                                href={`/portal/candidates?candidateId=${candidate.id}`}
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
