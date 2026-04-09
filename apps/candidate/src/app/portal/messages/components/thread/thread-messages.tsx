"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { MessageItem, ResyncData, UserSummary } from "./types";

interface ThreadMessagesProps {
    data: ResyncData;
    otherUser: UserSummary | null;
    applicationTitle: string | null;
    jobTitle: string | null;
    companyName: string | null;
    companyLogoUrl: string | null;
    isLoadingMore: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
}

function formatDateSeparator(date: Date): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
    );
    const diffDays = Math.round(
        (today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function ThreadMessages({
    data,
    otherUser,
    applicationTitle,
    jobTitle,
    companyName,
    companyLogoUrl,
    isLoadingMore,
    hasMore,
    onLoadMore,
}: ThreadMessagesProps) {
    const messagesRef = useRef<HTMLDivElement | null>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const initialScrollDoneRef = useRef(false);

    const scrollToBottom = useCallback(() => {
        if (!messagesRef.current) return;
        messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }, []);

    const handleScroll = useCallback(() => {
        const container = messagesRef.current;
        if (!container) return;
        const { scrollHeight, scrollTop, clientHeight } = container;
        setIsAtBottom(scrollHeight - scrollTop - clientHeight <= 80);
        if (scrollTop <= 40) onLoadMore();
    }, [onLoadMore]);

    useEffect(() => {
        if (!data.messages) return;
        if (!initialScrollDoneRef.current) {
            initialScrollDoneRef.current = true;
            requestAnimationFrame(scrollToBottom);
            return;
        }
        if (isAtBottom) requestAnimationFrame(scrollToBottom);
    }, [data.messages?.length, isAtBottom, scrollToBottom]);

    const getInitials = (value?: string | null) => {
        if (!value) return "??";
        const parts = value.trim().split(/\s+/);
        if (parts.length === 1) return parts[0]?.slice(0, 2).toUpperCase();
        return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
    };

    const hasContext =
        data.conversation.application_id ||
        data.conversation.job_id ||
        data.conversation.company_id;

    return (
        <div className="flex-1 min-h-0 flex flex-col gap-4 p-4">
            {/* Context card */}
            {hasContext && (
                <div className="border-l-4 border-l-info border border-base-200 bg-info/5 p-4 text-sm">
                    <div className="font-semibold mb-2 flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-link text-info" />
                        Context
                    </div>
                    <div className="flex flex-wrap gap-3 text-base-content/70">
                        {data.conversation.application_id && (
                            <Link
                                className="link link-hover flex items-center gap-1.5"
                                href={`/portal/applications?applicationId=${data.conversation.application_id}`}
                            >
                                <i className="fa-duotone fa-regular fa-file-lines text-primary" />
                                Application:{" "}
                                {applicationTitle ||
                                    data.conversation.application_id}
                            </Link>
                        )}
                        {data.conversation.job_id && (
                            <span className="flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-briefcase text-secondary" />
                                Role:{" "}
                                {jobTitle || data.conversation.job_id}
                            </span>
                        )}
                        {data.conversation.company_id && (
                            <span className="flex items-center gap-1.5">
                                {companyLogoUrl ? (
                                    <img
                                        src={companyLogoUrl}
                                        alt=""
                                        className="w-4 h-4 object-contain"
                                    />
                                ) : (
                                    <i className="fa-duotone fa-regular fa-building text-secondary" />
                                )}
                                Company:{" "}
                                {companyName || data.conversation.company_id}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Messages */}
            <div
                ref={messagesRef}
                onScroll={handleScroll}
                className="relative flex-1 min-h-0 border border-base-200 bg-base-100 p-4 space-y-1 overflow-y-auto"
            >
                {isLoadingMore && (
                    <div className="text-center text-xs text-base-content/50">
                        Loading more messages...
                    </div>
                )}
                {data.messages.length === 0 ? (
                    <div className="text-center text-base-content/50 py-12">
                        <i className="fa-duotone fa-regular fa-messages text-4xl mb-3 text-primary/20 block" />
                        No messages yet.
                    </div>
                ) : (
                    data.messages.map((msg, idx) => {
                        const isOwn =
                            msg.sender_id === data.participant.user_id;
                        const prevMsg = data.messages[idx - 1];
                        const msgDate = new Date(msg.created_at);
                        const prevDate = prevMsg
                            ? new Date(prevMsg.created_at)
                            : null;
                        const showDateSeparator =
                            !prevDate ||
                            prevDate.toDateString() !== msgDate.toDateString();
                        const isGrouped =
                            !showDateSeparator &&
                            prevMsg?.sender_id === msg.sender_id;
                        const senderLabel = isOwn
                            ? "You"
                            : otherUser?.name ||
                              otherUser?.email ||
                              "Unknown user";
                        const fullTimestamp = msgDate.toLocaleString();

                        return (
                            <div key={msg.id}>
                                {showDateSeparator && (
                                    <div className="flex justify-center my-4">
                                        <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-base-200 text-base-content/60">
                                            {formatDateSeparator(msgDate)}
                                        </span>
                                    </div>
                                )}
                            <div
                                title={fullTimestamp}
                                className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""} ${isGrouped ? "mt-1" : "mt-5"}`}
                            >
                                {/* Avatar */}
                                {!isGrouped ? (
                                    <div
                                        className={`w-9 h-9 shrink-0 flex items-center justify-center font-bold text-xs mt-1 ${
                                            isOwn
                                                ? "bg-primary text-primary-content"
                                                : "bg-base-200 text-base-content"
                                        }`}
                                    >
                                        {isOwn ? (
                                            <i className="fa-duotone fa-user" />
                                        ) : (
                                            getInitials(senderLabel)
                                        )}
                                    </div>
                                ) : (
                                    <div className="w-9 shrink-0" />
                                )}

                                {/* Bubble */}
                                <div
                                    className={`max-w-[70%] ${isOwn ? "text-right" : ""}`}
                                >
                                    {!isGrouped && (
                                        <div
                                            className={`flex items-center gap-2 mb-1 ${isOwn ? "flex-row-reverse" : ""}`}
                                        >
                                            <span className="text-xs font-bold">
                                                {senderLabel}
                                            </span>
                                            <span className="text-sm text-base-content/40">
                                                {new Date(
                                                    msg.created_at,
                                                ).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                    )}
                                    <div
                                        className={`px-4 py-2.5 text-sm leading-relaxed ${
                                            isOwn
                                                ? "bg-primary text-primary-content"
                                                : "bg-base-200 text-base-content"
                                        }`}
                                    >
                                        <MarkdownRenderer
                                            content={
                                                msg.body || "Message removed"
                                            }
                                            className={`[&_p]:!m-0 [&_ul]:!my-2 [&_ol]:!my-2 ${isOwn ? "text-primary-content" : "text-base-content/90"}`}
                                        />
                                    </div>
                                </div>
                            </div>
                            </div>
                        );
                    })
                )}

                {/* Scroll to bottom FAB */}
                {!isAtBottom && (
                    <div className="sticky bottom-4 flex justify-end pr-2">
                        <button
                            type="button"
                            onClick={scrollToBottom}
                            className="btn btn-square btn-primary shadow-md"
                            aria-label="Jump to latest"
                        >
                            <i className="fa-duotone fa-arrow-down" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
