"use client";

/**
 * Basel split list item — matches showcase/messages/one conversation item.
 * Square avatar with role color, online dot, role badge line, unread pill.
 */

import {
    type ConversationRow,
    type ConversationContext,
    getOtherParticipant,
    formatMessageDate,
    getRequestStateDisplay,
} from "@/app/portal/messages/types";
import { ActionsToolbar } from "./actions-toolbar";

/* ─── Role metadata — DaisyUI semantic tokens ──────────────────────────── */

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

interface SplitItemProps {
    row: ConversationRow;
    isSelected: boolean;
    currentUserId: string | null;
    presenceStatus?: "online" | "idle" | "offline";
    onSelect: (id: string) => void;
    context?: ConversationContext | null;
    otherUserRole?: string | null;
    initials: string;
}

export default function SplitItem({
    row,
    isSelected,
    currentUserId,
    presenceStatus,
    onSelect,
    context,
    otherUserRole,
    initials,
}: SplitItemProps) {
    const convo = row.conversation;
    const participant = row.participant;

    if (!convo || !participant) return null;

    const other = getOtherParticipant(convo, currentUserId);
    const name = other?.name || other?.email || "Unknown user";
    const meta = getRoleMeta(otherUserRole);
    const isOnline = presenceStatus === "online";
    const status = getRequestStateDisplay(row);

    const contextLabel =
        context?.jobTitle && context?.companyName
            ? `${context.jobTitle} at ${context.companyName}`
            : context?.jobTitle || context?.companyName || null;

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onSelect(convo.id)}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(convo.id);
                }
            }}
            className={`relative conv-item w-full text-left p-4 border-b border-base-300 transition-all hover:bg-base-300/50 cursor-pointer ${
                isSelected
                    ? "bg-base-100 border-l-4 border-l-primary"
                    : "border-l-4 border-l-transparent"
            }`}
        >
            <div className="flex gap-3">
                {/* Square avatar with role color */}
                <div className="relative flex-shrink-0">
                    <div
                        className={`w-11 h-11 flex items-center justify-center font-bold text-sm ${
                            meta?.bgClass ?? "bg-base-300 text-base-content"
                        }`}
                    >
                        {initials}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-2 min-w-0">
                            <span
                                className={`font-bold text-sm truncate ${
                                    participant.unread_count > 0
                                        ? "text-base-content"
                                        : "text-base-content/80"
                                }`}
                            >
                                {name}
                            </span>
                            {presenceStatus === "online" ? (
                                <span className="badge badge-xs badge-success badge-soft badge-outline">
                                    Online
                                </span>
                            ) : presenceStatus === "offline" ? (
                                <span className="badge badge-xs badge-neutral badge-soft badge-outline">
                                    Offline
                                </span>
                            ) : (
                                <span className="badge badge-xs badge-neutral badge-soft badge-outline">
                                    Unknown
                                </span>
                            )}
                        </div>
                        <span className="text-[11px] text-base-content/40 flex-shrink-0 ml-2">
                            {formatMessageDate(convo.last_message_at)}
                        </span>
                    </div>

                    {/* Role badge line */}
                    {meta && (
                        <div className="flex items-center gap-1.5 mb-1">
                            <i
                                className={`${meta.icon} text-[10px] ${meta.textClass}`}
                            />
                            <span
                                className={`text-[10px] font-semibold uppercase tracking-wider ${meta.textClass}`}
                            >
                                {meta.label}
                            </span>
                        </div>
                    )}

                    {/* Context preview */}
                    <div className="flex items-center justify-between">
                        <p
                            className={`text-xs truncate max-w-[85%] ${
                                participant.unread_count > 0
                                    ? "text-base-content/70 font-medium"
                                    : "text-base-content/50"
                            }`}
                        >
                            {contextLabel && (
                                <>
                                    <i className="fa-duotone fa-regular fa-briefcase mr-1" />
                                    {contextLabel}
                                </>
                            )}
                            {!contextLabel && context?.candidateName && (
                                <>
                                    <i className="fa-duotone fa-regular fa-user-shield mr-1" />
                                    Re: {context.candidateName}
                                </>
                            )}
                            {!contextLabel && !context?.candidateName && (
                                <span className="text-base-content/40">
                                    {status.label !== "Active"
                                        ? status.label
                                        : "No context"}
                                </span>
                            )}
                        </p>
                        {participant.unread_count > 0 && (
                            <span className="flex-shrink-0 w-5 h-5 bg-accent text-accent-content text-[10px] font-bold flex items-center justify-center rounded-full">
                                {participant.unread_count > 99
                                    ? "99+"
                                    : participant.unread_count}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
