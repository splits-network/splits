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
import { Button, ExpandableButton } from "@splits-network/basel-ui";
import type { RecruiterWithUser } from "../../types";
import { getDisplayName } from "../../types";
import { useCompanyContext } from "../../contexts/company-context";
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
    onRefresh?: () => void;
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
    onRefresh,
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

    const { companies, recruiterRelationships, refreshRelationships } =
        useCompanyContext();

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
        endRelationship:
            (isCompanyUser || isAdmin) && hasActiveRelationship,
    };

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

    // ===== ICON-ONLY VARIANT =====

    if (variant === "icon-only") {
        return (
            <>
                <div
                    className={`flex items-center ${getLayoutClass()} ${className}`}
                >
                    {actions.inviteToCompany && (
                        <ExpandableButton
                            icon="fa-duotone fa-regular fa-paper-plane"
                            label="Invite"
                            variant="btn-primary btn-square"
                            size={size}
                            onClick={handleInviteToCompany}
                            title="Invite to Company"
                        />
                    )}

                    {actions.endRelationship && (
                        <ExpandableButton
                            icon="fa-duotone fa-regular fa-link-slash"
                            label="End"
                            variant="btn-ghost btn-square"
                            size={size}
                            onClick={() => setShowTerminateModal(true)}
                            title="End Relationship"
                        />
                    )}

                    {actions.message &&
                        (actions.inviteToCompany ||
                            actions.endRelationship) && (
                            <div className="w-px h-4 bg-base-content/20 mx-0.5" />
                        )}

                    {actions.message && (
                        <span title={chatDisabledReason || undefined}>
                            <ExpandableButton
                                icon="fa-duotone fa-regular fa-messages"
                                label="Message"
                                variant="btn-ghost btn-square"
                                size={size}
                                onClick={handleStartChat}
                                disabled={!canChat || startingChat}
                                loading={startingChat}
                                title="Message Recruiter"
                            />
                        </span>
                    )}

                    {actions.viewDetails && onViewDetails && (
                        <>
                            <div className="w-px h-4 bg-base-content/20 mx-0.5" />
                            <ExpandableButton
                                icon="fa-duotone fa-regular fa-eye"
                                label="Details"
                                variant="btn-primary btn-square"
                                size={size}
                                onClick={handleViewDetails}
                                title="View Details"
                            />
                        </>
                    )}
                </div>
                {inviteModal}
                {terminateModal}
            </>
        );
    }

    // ===== DESCRIPTIVE VARIANT =====

    return (
        <>
            <div
                className={`flex flex-wrap items-center ${getLayoutClass()} ${className}`}
            >
                {actions.inviteToCompany && (
                    <button
                        onClick={handleInviteToCompany}
                        className={`btn btn-${size} btn-primary gap-2`}
                        style={{ borderRadius: 0 }}
                        title="Invite to Company"
                    >
                        <i className="fa-duotone fa-regular fa-paper-plane" />
                        <span className="hidden md:inline">Invite</span>
                    </button>
                )}

                {actions.endRelationship && (
                    <button
                        onClick={() => setShowTerminateModal(true)}
                        className={`btn btn-${size} btn-ghost gap-2 text-error`}
                        style={{ borderRadius: 0 }}
                        title="End Relationship"
                    >
                        <i className="fa-duotone fa-regular fa-link-slash" />
                        <span className="hidden md:inline">End</span>
                    </button>
                )}

                {actions.message &&
                    (actions.inviteToCompany ||
                        actions.endRelationship) && (
                        <div className="hidden sm:block w-px self-stretch bg-base-content/20 mx-1" />
                    )}

                {actions.message && (
                    <span title={chatDisabledReason || undefined}>
                        <button
                            onClick={handleStartChat}
                            className={`btn btn-${size} btn-ghost gap-2 relative`}
                            style={{ borderRadius: 0 }}
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

                {actions.viewDetails && onViewDetails && (
                    <>
                        <div className="hidden sm:block w-px self-stretch bg-base-content/20 mx-1" />
                        <button
                            onClick={handleViewDetails}
                            className={`btn btn-${size} btn-ghost gap-2`}
                            style={{ borderRadius: 0 }}
                            title="View Details"
                        >
                            <i className="fa-duotone fa-regular fa-eye" />
                            <span className="hidden md:inline">Details</span>
                        </button>
                    </>
                )}
            </div>
            {inviteModal}
            {terminateModal}
        </>
    );
}
