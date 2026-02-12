"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast-context";
import { useUserProfile } from "@/contexts";
import { startChatConversation } from "@/lib/chat-start";
import { usePresence } from "@/hooks/use-presence";
import { Presence } from "@/components/presense";
import { ModalPortal } from "@splits-network/shared-ui";
import { RecruiterWithUser, getDisplayName } from "../../types";
import { useRecruiterFilter } from "../../contexts/filter-context";
import InviteRecruiterModal from "../modals/invite-recruiter-modal";
import TerminateCompanyModal from "@/app/portal/companies/components/modals/terminate-company-modal";

export interface RecruiterActionsToolbarProps {
    recruiter: RecruiterWithUser;
    variant: "icon-only" | "descriptive";
    layout?: "horizontal" | "vertical";
    size?: "xs" | "sm" | "md";
    showActions?: {
        viewDetails?: boolean;
        message?: boolean;
        inviteToCompany?: boolean;
    };
    onViewDetails?: (id: string) => void;
    onInviteToCompany?: () => void;
    className?: string;
}

export default function RecruiterActionsToolbar({
    recruiter,
    variant,
    layout = "horizontal",
    size = "sm",
    showActions = {},
    onViewDetails,
    onInviteToCompany,
    className = "",
}: RecruiterActionsToolbarProps) {
    const { getToken } = useAuth();
    const router = useRouter();
    const toast = useToast();
    const { isCompanyUser, isAdmin } = useUserProfile();

    const [startingChat, setStartingChat] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showTerminateModal, setShowTerminateModal] = useState(false);

    const { companies, recruiterRelationships, refreshRelationships } = useRecruiterFilter();

    const companyRelationship = recruiterRelationships.get(recruiter.id);
    const hasActiveRelationship = companyRelationship?.status === "active";

    const recruiterUserId = recruiter.users?.id;
    const canChat = Boolean(recruiterUserId);
    const chatDisabledReason = canChat
        ? null
        : "This recruiter isn't linked to a user account.";
    const presence = usePresence([recruiterUserId], { enabled: canChat });
    const presenceStatus = recruiterUserId
        ? presence[recruiterUserId]?.status
        : undefined;

    const canInvite = useMemo(() => {
        return isCompanyUser || isAdmin;
    }, [isCompanyUser, isAdmin]);

    const handleStartChat = async () => {
        if (!recruiterUserId) return;
        try {
            setStartingChat(true);
            const conversationId = await startChatConversation(
                getToken,
                recruiterUserId,
                {},
            );
            router.push(
                `/portal/messages?conversationId=${conversationId}`,
            );
        } catch (err: any) {
            console.error("Failed to start chat:", err);
            toast.error(err?.message || "Failed to start chat");
        } finally {
            setStartingChat(false);
        }
    };

    const handleInviteToCompany = () => {
        if (onInviteToCompany) {
            onInviteToCompany();
        } else {
            setShowInviteModal(true);
        }
    };

    const handleViewDetails = () => {
        if (onViewDetails) {
            onViewDetails(recruiter.id);
        }
    };

    const actions = {
        viewDetails: showActions.viewDetails === true,
        message: showActions.message !== false,
        inviteToCompany: showActions.inviteToCompany !== false && canInvite,
        endRelationship: (isCompanyUser || isAdmin) && hasActiveRelationship,
    };

    const getSizeClass = () => `btn-${size}`;

    const getLayoutClass = () =>
        layout === "horizontal" ? "gap-1" : "flex-col gap-2";

    const inviteModal = showInviteModal && (
        <ModalPortal>
            <InviteRecruiterModal
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                onSuccess={() => setShowInviteModal(false)}
                recruiter={recruiter}
                companies={companies}
            />
        </ModalPortal>
    );

    const terminateModal = showTerminateModal && companyRelationship && (
        <TerminateCompanyModal
            isOpen={showTerminateModal}
            onClose={() => setShowTerminateModal(false)}
            onSuccess={() => {
                setShowTerminateModal(false);
                refreshRelationships();
            }}
            relationshipId={companyRelationship.id}
            recruiterId={companyRelationship.recruiter_id}
            companyId={companyRelationship.company_id}
            targetName={getDisplayName(recruiter)}
            targetEmail={recruiter.users?.email}
            targetRole="recruiter"
        />
    );

    if (variant === "icon-only") {
        return (
            <>
                <div className={`flex items-center ${getLayoutClass()} ${className}`}>
                    {/* Invite to Company - CTA */}
                    {actions.inviteToCompany && (
                        <button
                            onClick={handleInviteToCompany}
                            className={`btn ${getSizeClass()} btn-square btn-primary`}
                            title="Invite to Company"
                        >
                            <i className="fa-duotone fa-regular fa-paper-plane" />
                        </button>
                    )}

                    {/* End Relationship */}
                    {actions.endRelationship && (
                        <button
                            onClick={() => setShowTerminateModal(true)}
                            className={`btn ${getSizeClass()} btn-square btn-error btn-outline`}
                            title="End Relationship"
                        >
                            <i className="fa-duotone fa-regular fa-link-slash" />
                        </button>
                    )}

                    {/* Divider before Message */}
                    {actions.message && (actions.inviteToCompany || actions.endRelationship) && (
                        <div className="w-px h-4 bg-base-300 mx-0.5" />
                    )}

                    {/* Message */}
                    {actions.message && (
                        <span title={chatDisabledReason || undefined}>
                            <button
                                onClick={handleStartChat}
                                className={`btn ${getSizeClass()} btn-square btn-ghost relative`}
                                title="Message Recruiter"
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
                    {actions.viewDetails && onViewDetails && (
                        <>
                            <div className="w-px h-4 bg-base-300 mx-0.5" />
                            <button
                                onClick={handleViewDetails}
                                className={`btn ${getSizeClass()} btn-square btn-primary`}
                                title="View Details"
                            >
                                <i className="fa-duotone fa-regular fa-eye" />
                            </button>
                        </>
                    )}
                </div>
                {inviteModal}
                {terminateModal}
            </>
        );
    }

    // Descriptive variant
    return (
        <>
            <div className={`flex ${getLayoutClass()} ${className}`}>
                {/* Invite to Company - CTA */}
                {actions.inviteToCompany && (
                    <button
                        onClick={handleInviteToCompany}
                        className={`btn ${getSizeClass()} btn-primary gap-2`}
                    >
                        <i className="fa-duotone fa-regular fa-paper-plane" />
                        Invite
                    </button>
                )}

                {/* End Relationship */}
                {actions.endRelationship && (
                    <button
                        onClick={() => setShowTerminateModal(true)}
                        className={`btn ${getSizeClass()} btn-error btn-outline gap-2`}
                    >
                        <i className="fa-duotone fa-regular fa-link-slash" />
                        End Relationship
                    </button>
                )}

                {/* Divider before Message */}
                {actions.message && (actions.inviteToCompany || actions.endRelationship) && (
                    <div className="divider divider-horizontal mx-0" />
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

                {/* View Details - far right */}
                {actions.viewDetails && onViewDetails && (
                    <>
                        <div className="divider divider-horizontal mx-0" />
                        <button
                            onClick={handleViewDetails}
                            className={`btn ${getSizeClass()} btn-outline gap-2`}
                        >
                            <i className="fa-duotone fa-regular fa-eye" />
                            View Details
                        </button>
                    </>
                )}
            </div>
            {inviteModal}
            {terminateModal}
        </>
    );
}
