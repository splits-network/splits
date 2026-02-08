"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { startChatConversation } from "@/lib/chat-start";
import { useToast } from "@/lib/toast-context";
import { usePresence } from "@/hooks/use-presence";
import { Presence } from "@/components/presense";
import { type Application, WITHDRAWABLE_STAGES } from "../../types";

interface ActionsToolbarProps {
    item: Application;
    variant?: "icon-only" | "descriptive";
    onWithdraw?: () => void;
}

export default function ActionsToolbar({
    item,
    variant = "icon-only",
    onWithdraw,
}: ActionsToolbarProps) {
    const { getToken } = useAuth();
    const router = useRouter();
    const toast = useToast();
    const [startingChat, setStartingChat] = useState(false);
    const [withdrawing, setWithdrawing] = useState(false);

    const recruiterUserId = item.recruiter?.user?.id;
    const canWithdraw = WITHDRAWABLE_STAGES.includes(item.stage);
    const chatDisabledReason = recruiterUserId
        ? null
        : "Your recruiter isn't linked to a user yet.";

    const presence = usePresence([recruiterUserId], {
        enabled: Boolean(recruiterUserId),
    });
    const presenceStatus = recruiterUserId
        ? presence[recruiterUserId]?.status
        : undefined;

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
                    company_id: item.job?.company?.id ?? item.company?.id ?? null,
                },
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

    const handleWithdraw = async () => {
        if (!canWithdraw) return;
        try {
            setWithdrawing(true);
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");
            const { createAuthenticatedClient } = await import(
                "@/lib/api-client"
            );
            const client = createAuthenticatedClient(token);
            await client.patch(`/applications/${item.id}`, {
                stage: "withdrawn",
            });
            toast.success("Application withdrawn successfully");
            onWithdraw?.();
        } catch (err: any) {
            console.error("Failed to withdraw application:", err);
            toast.error(err?.message || "Failed to withdraw application");
        } finally {
            setWithdrawing(false);
        }
    };

    if (variant === "descriptive") {
        return (
            <div className="flex items-center gap-2">
                <Link
                    href={`/portal/applications/${item.id}`}
                    className="btn btn-primary btn-sm"
                >
                    <i className="fa-duotone fa-regular fa-arrow-right mr-1" />
                    View Full Application
                </Link>
                <span title={chatDisabledReason || undefined}>
                    <button
                        className="btn btn-outline btn-sm"
                        disabled={!recruiterUserId || startingChat}
                        onClick={handleMessageRecruiter}
                    >
                        {startingChat ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : (
                            <>
                                <Presence status={presenceStatus} />
                                Message Recruiter
                            </>
                        )}
                    </button>
                </span>
                {canWithdraw && (
                    <button
                        className="btn btn-outline btn-error btn-sm"
                        disabled={withdrawing}
                        onClick={handleWithdraw}
                    >
                        {withdrawing ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : (
                            <>
                                <i className="fa-duotone fa-regular fa-ban mr-1" />
                                Withdraw
                            </>
                        )}
                    </button>
                )}
            </div>
        );
    }

    // Icon-only variant for sidebar header
    return (
        <div className="flex items-center gap-1">
            <Link
                href={`/portal/applications/${item.id}`}
                className="btn btn-sm btn-ghost"
                title="View full application"
            >
                <i className="fa-duotone fa-regular fa-arrow-up-right-from-square" />
            </Link>
            <span title={chatDisabledReason || undefined}>
                <button
                    className="btn btn-sm btn-ghost relative"
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
            {canWithdraw && (
                <button
                    className="btn btn-sm btn-ghost text-error"
                    disabled={withdrawing}
                    onClick={handleWithdraw}
                    title="Withdraw application"
                >
                    {withdrawing ? (
                        <span className="loading loading-spinner loading-xs" />
                    ) : (
                        <i className="fa-duotone fa-regular fa-ban" />
                    )}
                </button>
            )}
        </div>
    );
}
