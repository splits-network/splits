"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast-context";
import { useUserProfile } from "@/contexts";
import { startChatConversation } from "@/lib/chat-start";
import { usePresence } from "@/hooks/use-presence";
import { Presence } from "@/components/presense";
import { RecruiterWithUser } from "./detail";

export interface RecruiterActionsToolbarProps {
    recruiter: RecruiterWithUser;
    variant: "icon-only" | "descriptive";
    layout?: "horizontal" | "vertical";
    size?: "xs" | "sm" | "md";
    showActions?: {
        message?: boolean;
        inviteToCompany?: boolean;
    };
    onMessage?: (
        conversationId: string,
        recruiterName: string,
        recruiterUserId: string,
    ) => void;
    onInviteToCompany?: () => void;
    className?: string;
}

export default function RecruiterActionsToolbar({
    recruiter,
    variant,
    layout = "horizontal",
    size = "sm",
    showActions = {},
    onMessage,
    onInviteToCompany,
    className = "",
}: RecruiterActionsToolbarProps) {
    const { getToken } = useAuth();
    const router = useRouter();
    const toast = useToast();
    const { isCompanyUser, isAdmin } = useUserProfile();

    // Chat state
    const [startingChat, setStartingChat] = useState(false);
    const recruiterUserId = recruiter.users?.id;
    const canChat = Boolean(recruiterUserId);
    const chatDisabledReason = canChat
        ? null
        : "This recruiter isn't linked to a user account.";
    const presence = usePresence([recruiterUserId], { enabled: canChat });
    const presenceStatus = recruiterUserId
        ? presence[recruiterUserId]?.status
        : undefined;

    // Permission logic
    const canInvite = useMemo(() => {
        return isCompanyUser || isAdmin;
    }, [isCompanyUser, isAdmin]);

    // Action handlers
    const handleStartChat = async () => {
        if (!recruiterUserId) {
            return;
        }
        try {
            setStartingChat(true);
            const conversationId = await startChatConversation(
                getToken,
                recruiterUserId,
                {},
            );

            const recruiterName =
                recruiter.users?.name ||
                recruiter.name ||
                recruiter.users?.email ||
                "Unknown";

            if (onMessage) {
                onMessage(conversationId, recruiterName, recruiterUserId);
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

    const handleInviteToCompany = () => {
        if (onInviteToCompany) {
            onInviteToCompany();
        }
    };

    // Action visibility
    const actions = {
        message: showActions.message !== false,
        inviteToCompany: showActions.inviteToCompany !== false && canInvite,
    };

    // Render helpers
    const getSizeClass = () => {
        return `btn-${size}`;
    };

    const getLayoutClass = () => {
        return layout === "horizontal" ? "gap-1" : "flex-col gap-2";
    };

    // Icon-only variant
    if (variant === "icon-only") {
        return (
            <div className={`flex ${getLayoutClass()} ${className}`}>
                {/* Message */}
                {actions.message && (
                    <span title={chatDisabledReason || undefined}>
                        <button
                            onClick={handleStartChat}
                            className={`btn ${getSizeClass()} btn-square btn-outline relative`}
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

                {/* Invite to Company */}
                {actions.inviteToCompany && (
                    <button
                        onClick={handleInviteToCompany}
                        className={`btn ${getSizeClass()} btn-square btn-primary`}
                        title="Invite to Company"
                    >
                        <i className="fa-duotone fa-regular fa-paper-plane" />
                    </button>
                )}
            </div>
        );
    }

    // Descriptive variant
    return (
        <div className={`flex ${getLayoutClass()} ${className}`}>
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

            {/* Invite to Company */}
            {actions.inviteToCompany && (
                <button
                    onClick={handleInviteToCompany}
                    className={`btn ${getSizeClass()} btn-primary gap-2`}
                >
                    <i className="fa-duotone fa-regular fa-paper-plane" />
                    Invite
                </button>
            )}
        </div>
    );
}
