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

// ===== TYPES =====

export interface Candidate {
    id: string;
    user_id?: string | null;
    company_id?: string | null;
    full_name: string | null;
    email?: string | null;
    phone?: string | null;
    current_title?: string | null;
    current_company?: string | null;
    location?: string | null;
    verification_status?:
        | "verified"
        | "pending"
        | "unverified"
        | "rejected"
        | string
        | null;
    is_sourcer?: boolean;
    has_active_relationship?: boolean;
    has_other_active_recruiters?: boolean;
    other_active_recruiters_count?: number;
    marketplace_visibility?: string | null;
    [key: string]: any;
}

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
    };
    onRefresh?: () => void;
    onViewDetails?: (candidateId: string) => void;
    onEdit?: (candidateId: string) => void;
    onVerify?: (candidate: Candidate) => void;
    onSendJobOpportunity?: (candidateId: string, candidateName: string) => void;
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
    onSendJobOpportunity,
    onMessage,
    className = "",
}: CandidateActionsToolbarProps) {
    const { getToken } = useAuth();
    const router = useRouter();
    const toast = useToast();
    const { profile, isAdmin, isRecruiter } = useUserProfile();

    // Chat state
    const [startingChat, setStartingChat] = useState(false);
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

        // Recruiter who sourced the candidate can manage
        if (isRecruiter && candidate.is_sourcer) {
            return true;
        }

        // Recruiter with active relationship can manage
        if (isRecruiter && candidate.has_active_relationship) {
            return true;
        }

        return false;
    }, [isAdmin, isRecruiter, candidate]);

    const canVerifyCandidate = useMemo(() => {
        // Only admins and recruiters can verify
        return isAdmin || isRecruiter;
    }, [isAdmin, isRecruiter]);

    const canSendJobOpportunity = useMemo(() => {
        // Recruiters and admins can send job opportunities
        return isRecruiter || isAdmin;
    }, [isRecruiter, isAdmin]);

    // ===== ACTION HANDLERS =====

    const handleViewDetails = () => {
        if (onViewDetails) {
            onViewDetails(candidate.id);
        }
    };

    const handleEdit = () => {
        if (onEdit) {
            onEdit(candidate.id);
        }
    };

    const handleVerify = () => {
        if (onVerify) {
            onVerify(candidate);
        }
    };

    const handleSendJobOpportunity = () => {
        if (onSendJobOpportunity) {
            onSendJobOpportunity(
                candidate.id,
                candidate.full_name || "Unknown",
            );
        }
    };

    const handleStartChat = async () => {
        if (!candidate.user_id) {
            return;
        }
        try {
            setStartingChat(true);
            const conversationId = await startChatConversation(
                getToken,
                candidate.user_id,
                {
                    company_id: candidate.company_id || null,
                },
            );

            // Use sidebar callback if provided, otherwise navigate to messages page
            if (onMessage) {
                onMessage(
                    conversationId,
                    candidate.full_name || "Unknown",
                    candidate.user_id,
                    {
                        company_id: candidate.company_id || null,
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

    // ===== ACTION VISIBILITY =====

    const actions = {
        viewDetails: showActions.viewDetails !== false,
        message: showActions.message !== false,
        sendJobOpportunity:
            showActions.sendJobOpportunity !== false && canSendJobOpportunity,
        edit: showActions.edit !== false && canManageCandidate,
        verify: showActions.verify !== false && canVerifyCandidate,
    };

    // ===== RENDER HELPERS =====

    const getSizeClass = () => {
        return `btn-${size}`;
    };

    const getLayoutClass = () => {
        return layout === "horizontal" ? "gap-1" : "flex-col gap-2";
    };

    // Quick verification button for icon-only variant
    const renderQuickVerifyButton = () => {
        if (variant !== "icon-only" || !actions.verify) return null;

        // Show verify button if not verified
        if (candidate.verification_status !== "verified") {
            return (
                <button
                    onClick={handleVerify}
                    className={`btn ${getSizeClass()} btn-square btn-success`}
                    title="Verify Candidate"
                >
                    <i className="fa-duotone fa-regular fa-badge-check" />
                </button>
            );
        }

        return null;
    };

    // ===== RENDER VARIANTS =====

    if (variant === "icon-only") {
        return (
            <div className={`flex ${getLayoutClass()} ${className}`}>
                {/* View Details */}
                {actions.viewDetails && (
                    <>
                        {onViewDetails ? (
                            <button
                                onClick={handleViewDetails}
                                className={`btn ${getSizeClass()} btn-square btn-ghost`}
                                title="View Details"
                            >
                                <i className="fa-duotone fa-regular fa-eye" />
                            </button>
                        ) : (
                            <Link
                                href={`/portal/candidates/${candidate.id}`}
                                className={`btn ${getSizeClass()} btn-square btn-ghost`}
                                title="View Details"
                            >
                                <i className="fa-duotone fa-regular fa-eye" />
                            </Link>
                        )}
                    </>
                )}

                {/* Message */}
                {actions.message && (
                    <span title={chatDisabledReason || undefined}>
                        <button
                            onClick={handleStartChat}
                            className={`btn ${getSizeClass()} btn-square btn-outline relative`}
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

                {/* Send Job Opportunity */}
                {actions.sendJobOpportunity && (
                    <button
                        onClick={handleSendJobOpportunity}
                        className={`btn ${getSizeClass()} btn-square btn-primary`}
                        title="Send Job Opportunity"
                    >
                        <i className="fa-duotone fa-regular fa-paper-plane" />
                    </button>
                )}

                {/* Edit */}
                {actions.edit && (
                    <button
                        onClick={handleEdit}
                        className={`btn ${getSizeClass()} btn-square btn-ghost`}
                        title="Edit Candidate"
                    >
                        <i className="fa-duotone fa-regular fa-pen-to-square" />
                    </button>
                )}

                {/* Quick Verify Action */}
                {renderQuickVerifyButton()}
            </div>
        );
    }

    // Descriptive variant
    return (
        <div className={`flex ${getLayoutClass()} ${className}`}>
            {/* View Details */}
            {actions.viewDetails && (
                <>
                    {onViewDetails ? (
                        <button
                            onClick={handleViewDetails}
                            className={`btn ${getSizeClass()} btn-outline gap-2`}
                        >
                            <i className="fa-duotone fa-regular fa-eye" />
                            View Details
                        </button>
                    ) : (
                        <Link
                            href={`/portal/candidates/${candidate.id}`}
                            className={`btn ${getSizeClass()} btn-outline gap-2`}
                        >
                            <i className="fa-duotone fa-regular fa-eye" />
                            View Details
                        </Link>
                    )}
                </>
            )}

            {/* Message */}
            {actions.message && (
                <span title={chatDisabledReason || undefined}>
                    <button
                        onClick={handleStartChat}
                        className={`btn ${getSizeClass()} btn-outline gap-2`}
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

            {/* Send Job Opportunity */}
            {actions.sendJobOpportunity && (
                <button
                    onClick={handleSendJobOpportunity}
                    className={`btn ${getSizeClass()} btn-primary gap-2`}
                >
                    <i className="fa-duotone fa-regular fa-paper-plane" />
                    Send Job
                </button>
            )}

            {/* Edit */}
            {actions.edit && (
                <button
                    onClick={handleEdit}
                    className={`btn ${getSizeClass()} btn-ghost gap-2`}
                >
                    <i className="fa-duotone fa-regular fa-pen-to-square" />
                    Edit
                </button>
            )}

            {/* Verify */}
            {actions.verify && candidate.verification_status !== "verified" && (
                <button
                    onClick={handleVerify}
                    className={`btn ${getSizeClass()} btn-success gap-2`}
                >
                    <i className="fa-duotone fa-regular fa-badge-check" />
                    Verify
                </button>
            )}
        </div>
    );
}
