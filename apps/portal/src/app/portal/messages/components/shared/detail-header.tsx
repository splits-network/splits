"use client";

import { useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useFilter } from "../../contexts/filter-context";
import type { ConversationRow } from "../../types";
import { getOtherParticipant } from "../../types";
import ActionsToolbar from "../shared/actions-toolbar";

interface DetailHeaderProps {
    item: ConversationRow | null;
    onClose: () => void;
}

export default function DetailHeader({ item, onClose }: DetailHeaderProps) {
    const { getToken } = useAuth();
    const { refresh, currentUserId } = useFilter();

    const otherUser = useMemo(() => {
        if (!item) return null;
        return getOtherParticipant(item.conversation, currentUserId);
    }, [item, currentUserId]);

    const requestPending = item?.participant.request_state === "pending";
    const title = otherUser?.name || otherUser?.email || "Conversation";

    const handleAccept = async () => {
        if (!item) return;
        const token = await getToken();
        if (!token) return;
        const client = createAuthenticatedClient(token);
        await client.post(`/chat/conversations/${item.conversation.id}/accept`);
        refresh();
    };

    const handleDecline = async () => {
        if (!item) return;
        const token = await getToken();
        if (!token) return;
        const client = createAuthenticatedClient(token);
        await client.post(
            `/chat/conversations/${item.conversation.id}/decline`,
        );
        refresh();
    };

    return (
        <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 p-3 flex items-center justify-between">
            {/* Mobile back button */}
            <button
                onClick={onClose}
                className="btn btn-sm btn-ghost md:hidden"
            >
                <i className="fa-duotone fa-regular fa-chevron-left mr-1" />
                Back
            </button>

            <span className="text-sm font-medium text-base-content/60 hidden md:block truncate">
                {title}
            </span>

            <div className="flex items-center gap-2">
                {requestPending && (
                    <>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={handleAccept}
                        >
                            Accept
                        </button>
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={handleDecline}
                        >
                            Decline
                        </button>
                    </>
                )}

                {item && (
                    <ActionsToolbar
                        conversation={item}
                        variant="descriptive"
                        size="md"
                    />
                )}

                <button
                    onClick={onClose}
                    className="btn btn-sm btn-square btn-ghost hidden md:flex"
                    aria-label="Close"
                >
                    <i className="fa-duotone fa-regular fa-xmark" />
                </button>
            </div>
        </div>
    );
}
