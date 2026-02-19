"use client";

/**
 * Basel browse list item — clean DaisyUI.
 * Already clean in original; self-contained in Basel tree.
 */

import { Presence } from "@/components/presense";
import {
    type ConversationRow,
    type ConversationContext,
    getOtherParticipant,
    formatMessageDate,
} from "@/app/portal/messages/types";

interface BrowseListItemProps {
    row: ConversationRow;
    isSelected: boolean;
    currentUserId: string | null;
    presenceStatus?: "online" | "idle" | "offline";
    onSelect: (id: string) => void;
    context?: ConversationContext | null;
    otherUserRole?: string | null;
}

export default function BrowseListItem({
    row,
    isSelected,
    currentUserId,
    presenceStatus,
    onSelect,
    context,
    otherUserRole,
}: BrowseListItemProps) {
    const convo = row.conversation;
    const participant = row.participant;

    if (!convo || !participant) return null;

    const other = getOtherParticipant(convo, currentUserId);
    const name = other?.name || other?.email || "Unknown user";

    const contextLabel =
        context?.jobTitle && context?.companyName
            ? `${context.jobTitle} at ${context.companyName}`
            : context?.jobTitle || context?.companyName || null;

    return (
        <button
            type="button"
            onClick={() => onSelect(convo.id)}
            className={`
                group w-full relative p-3 sm:p-4 border-b border-base-300 cursor-pointer transition-all duration-200
                hover:bg-base-100
                ${
                    isSelected
                        ? "bg-base-100 border-l-4 border-l-primary shadow-sm z-10"
                        : "border-l-4 border-l-transparent"
                }
            `}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    {/* Name + role + status badges */}
                    <div className="flex items-center gap-2 justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0 text-left">
                            <span className="font-semibold truncate">
                                {name}
                            </span>
                            {otherUserRole && (
                                <span className="badge badge-outline badge-xs">
                                    {otherUserRole}
                                </span>
                            )}
                            {participant.request_state === "pending" && (
                                <span className="badge badge-warning badge-sm">
                                    Request
                                </span>
                            )}
                            {participant.archived_at && (
                                <span className="badge badge-ghost badge-sm">
                                    Archived
                                </span>
                            )}
                            {participant.muted_at && (
                                <span className="badge badge-ghost badge-sm">
                                    <i className="fa-duotone fa-regular fa-volume-slash text-xs" />
                                </span>
                            )}
                        </div>
                        <Presence status={presenceStatus} variant="badge" />
                    </div>

                    {/* Context line */}
                    {contextLabel && (
                        <div className="text-xs text-start text-base-content/50 truncate mb-1">
                            <i className="fa-duotone fa-regular fa-briefcase mr-1" />
                            {contextLabel}
                        </div>
                    )}

                    {/* Candidate representation context */}
                    {context?.candidateName && (
                        <div className="text-xs text-start text-base-content/50 truncate mb-1">
                            <i className="fa-duotone fa-regular fa-user-shield mr-1" />
                            Re: {context.candidateName}
                        </div>
                    )}

                    {/* Timestamp */}
                    <div className="text-xs text-start text-base-content/60">
                        {formatMessageDate(convo.last_message_at)}
                    </div>
                </div>
                {participant.unread_count > 0 && (
                    <span className="badge badge-primary">
                        {participant.unread_count > 99
                            ? "99+"
                            : participant.unread_count}
                    </span>
                )}
            </div>
        </button>
    );
}
