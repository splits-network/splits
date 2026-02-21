"use client";

/**
 * Basel detail header — matches showcase/messages/one thread header.
 * Square avatar with role color, online dot, role+status line, action buttons.
 */

import { useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useFilter } from "@/app/portal/messages/contexts/filter-context";
import type { ConversationRow } from "@/app/portal/messages/types";
import { getOtherParticipant, getInitials } from "@/app/portal/messages/types";
import { ActionsToolbar } from "./actions-toolbar";

/* ─── Role metadata ────────────────────────────────────────────────────── */

type UserRole = "recruiter" | "company" | "candidate" | "admin";

const roleMeta: Record<
    UserRole,
    { label: string; bgClass: string; textClass: string; icon: string }
> = {
    recruiter: {
        label: "Recruiter",
        bgClass: "bg-primary text-primary-content",
        textClass: "text-primary",
        icon: "fa-duotone fa-regular fa-user-tie",
    },
    company: {
        label: "Company",
        bgClass: "bg-secondary text-secondary-content",
        textClass: "text-secondary",
        icon: "fa-duotone fa-regular fa-building",
    },
    candidate: {
        label: "Candidate",
        bgClass: "bg-accent text-accent-content",
        textClass: "text-accent",
        icon: "fa-duotone fa-regular fa-user",
    },
    admin: {
        label: "Admin",
        bgClass: "bg-neutral text-neutral-content",
        textClass: "text-neutral",
        icon: "fa-duotone fa-regular fa-shield-halved",
    },
};

function getRoleMeta(role: string | null | undefined) {
    if (!role) return null;
    const key = role.toLowerCase() as UserRole;
    return roleMeta[key] ?? null;
}

/* ─── Component ────────────────────────────────────────────────────────── */

interface DetailHeaderProps {
    item: ConversationRow | null;
    onClose: () => void;
}

export default function DetailHeader({ item, onClose }: DetailHeaderProps) {
    const { getToken } = useAuth();
    const { refresh, currentUserId, presenceMap } = useFilter();

    const otherUser = useMemo(() => {
        if (!item) return null;
        return getOtherParticipant(item.conversation, currentUserId);
    }, [item, currentUserId]);

    const requestPending = item?.participant.request_state === "pending";
    const title = otherUser?.name || otherUser?.email || "Conversation";
    const initials = getInitials(otherUser?.name || otherUser?.email);
    const meta = getRoleMeta(otherUser?.user_role);

    /* Derive presence from the presenceMap */
    const otherId = useMemo(() => {
        if (!item || !currentUserId) return null;
        return item.conversation.participant_a_id === currentUserId
            ? item.conversation.participant_b_id
            : item.conversation.participant_a_id;
    }, [item, currentUserId]);
    const isOnline = otherId
        ? presenceMap[otherId]?.status === "online"
        : false;

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
        <div className="flex items-center gap-4 p-4 border-b border-base-300 bg-base-100">
            {/* Mobile back button */}
            <button
                onClick={onClose}
                className="btn btn-ghost btn-sm btn-square lg:hidden"
            >
                <i className="fa-duotone fa-regular fa-arrow-left" />
            </button>

            {/* Contact info — showcase style */}
            <div className="flex items-center gap-3 flex-1">
                <div className="relative">
                    <div
                        className={`w-10 h-10 flex items-center justify-center font-bold text-sm ${
                            meta?.bgClass ?? "bg-base-300 text-base-content"
                        }`}
                    >
                        {initials}
                    </div>
                    {isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-base-100 rounded-full" />
                    )}
                </div>
                <div>
                    <div className="font-bold text-sm">{title}</div>
                    <div className="flex items-center gap-1.5">
                        {meta && (
                            <>
                                <i
                                    className={`${meta.icon} text-[10px] ${meta.textClass}`}
                                />
                                <span
                                    className={`text-[10px] font-semibold uppercase tracking-wider ${meta.textClass}`}
                                >
                                    {meta.label}
                                </span>
                                <span className="text-base-content/30 mx-1">
                                    |
                                </span>
                            </>
                        )}
                        {presenceMap[otherId]?.status === "online" ? (
                            <span className="badge badge-sm badge-success badge-soft badge-outline">
                                Online
                            </span>
                        ) : presenceMap[otherId]?.status === "offline" ? (
                            <span className="badge badge-sm badge-neutral badge-soft badge-outline">
                                Offline
                            </span>
                        ) : (
                            <span className="badge badge-sm badge-neutral badge-soft badge-outline">
                                Unknown
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
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
                        size="sm"
                    />
                )}

                <button
                    className="btn btn-ghost btn-sm btn-square"
                    title="More options"
                >
                    <i className="fa-duotone fa-regular fa-ellipsis-vertical text-base-content/50" />
                </button>
            </div>
        </div>
    );
}
