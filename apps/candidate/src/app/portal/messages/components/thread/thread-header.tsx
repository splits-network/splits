"use client";

import { ResyncData, UserSummary } from "./types";

interface ThreadHeaderProps {
    data: ResyncData;
    otherUser: UserSummary | null;
    headerTitle: string;
    headerSubtitle: string;
    requestPending: boolean;
    onAccept: () => void;
    onDecline: () => void;
    onArchive: () => void;
    onMute: () => void;
    onBlock: () => void;
    onReport: () => void;
    onClose?: () => void;
}

export function ThreadHeader({
    data,
    otherUser,
    headerTitle,
    headerSubtitle,
    requestPending,
    onAccept,
    onDecline,
    onArchive,
    onMute,
    onBlock,
    onReport,
    onClose,
}: ThreadHeaderProps) {
    const initials = otherUser?.name
        ? otherUser.name
              .trim()
              .split(/\s+/)
              .map((p) => p[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
        : "??";

    return (
        <div className="border-b border-base-300 bg-base-100/80 backdrop-blur-sm p-4 sticky top-0">
            <div className="flex items-start justify-between gap-3">
                {/* Contact info */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary text-primary-content flex items-center justify-center font-bold text-sm shrink-0">
                        {initials}
                    </div>
                    <div>
                        <div className="text-lg font-semibold">
                            {headerTitle}
                        </div>
                        <div className="text-sm text-base-content/60">
                            {headerSubtitle}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {requestPending && (
                        <>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={onAccept}
                            >
                                Accept
                            </button>
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={onDecline}
                            >
                                Decline
                            </button>
                        </>
                    )}
                    <div className="dropdown dropdown-end">
                        <button
                            type="button"
                            className="btn btn-ghost btn-sm btn-square"
                            aria-label="Conversation actions"
                        >
                            <i className="fa-duotone fa-ellipsis-vertical" />
                        </button>
                        <ul className="dropdown-content menu p-2 shadow bg-base-100 w-52 z-50">
                            <li>
                                <button onClick={onMute}>
                                    <i className="fa-duotone fa-volume" />
                                    {data.participant.muted_at
                                        ? "Unmute"
                                        : "Mute"}
                                </button>
                            </li>
                            <li>
                                <button onClick={onArchive}>
                                    <i className="fa-duotone fa-box-archive" />
                                    {data.participant.archived_at
                                        ? "Unarchive"
                                        : "Archive"}
                                </button>
                            </li>
                            <li>
                                <button onClick={onBlock}>
                                    <i className="fa-duotone fa-ban" />
                                    Block
                                </button>
                            </li>
                            <li>
                                <button onClick={onReport}>
                                    <i className="fa-duotone fa-flag" />
                                    Report
                                </button>
                            </li>
                        </ul>
                    </div>
                    {onClose && (
                        <button
                            className="btn btn-ghost btn-sm btn-square"
                            onClick={onClose}
                            aria-label="Close thread"
                        >
                            <i className="fa-duotone fa-xmark" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
