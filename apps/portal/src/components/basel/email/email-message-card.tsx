"use client";

/**
 * Single email message card — expand/collapse body, sender info,
 * to/cc, reply action. Used within email-thread-detail.
 */

import { useState } from "react";
import type { EmailMessage } from "@splits-network/shared-types";

interface EmailMessageCardProps {
    message: EmailMessage;
    isLast: boolean;
    onReply: (messageId: string) => void;
}

export default function EmailMessageCard({
    message,
    isLast,
    onReply,
}: EmailMessageCardProps) {
    const [expanded, setExpanded] = useState(isLast);
    const initial = (
        message.from?.name ||
        message.from?.email ||
        "?"
    )[0].toUpperCase();

    const formattedDate = message.date
        ? new Date(message.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          })
        : "";

    return (
        <div
            className={`border-b border-base-200 ${
                !isLast ? "" : "border-b-0"
            }`}
        >
            {/* Collapsed header — always visible */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full text-left px-5 py-4 hover:bg-base-200/30 transition-colors"
            >
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-primary/10 flex-shrink-0 flex items-center justify-center">
                        <span className="text-sm font-black text-primary">
                            {initial}
                        </span>
                    </div>

                    {/* Sender + snippet */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold truncate">
                                {message.from?.name || message.from?.email}
                            </span>
                            <span className="text-sm text-base-content/40 flex-shrink-0 ml-2">
                                {formattedDate}
                            </span>
                        </div>
                        {!expanded && message.snippet && (
                            <p className="text-sm text-base-content/40 truncate mt-0.5">
                                {message.snippet}
                            </p>
                        )}
                    </div>

                    {/* Expand icon */}
                    <i
                        className={`fa-solid fa-chevron-down text-sm text-base-content/30 transition-transform ${
                            expanded ? "rotate-180" : ""
                        }`}
                    />
                </div>
            </button>

            {/* Expanded body */}
            {expanded && (
                <div className="px-5 pb-5">
                    {/* To/CC line */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-base-content/40 mb-4 pl-13">
                        {message.to && message.to.length > 0 && (
                            <span>
                                To:{" "}
                                {message.to
                                    .map((t) => t.name || t.email)
                                    .join(", ")}
                            </span>
                        )}
                        {message.cc && message.cc.length > 0 && (
                            <span>
                                Cc:{" "}
                                {message.cc
                                    .map((c) => c.name || c.email)
                                    .join(", ")}
                            </span>
                        )}
                    </div>

                    {/* Body */}
                    <div className="text-sm text-base-content/80 leading-relaxed pl-13">
                        {message.bodyText ? (
                            <pre className="whitespace-pre-wrap font-sans">
                                {message.bodyText}
                            </pre>
                        ) : message.bodyHtml ? (
                            <div
                                className="prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{
                                    __html: message.bodyHtml,
                                }}
                            />
                        ) : (
                            <p className="italic text-base-content/30">
                                {message.snippet}
                            </p>
                        )}
                    </div>

                    {/* Attachments indicator */}
                    {message.hasAttachments && (
                        <div className="flex items-center gap-2 mt-4 pl-13 text-sm text-base-content/40">
                            <i className="fa-duotone fa-regular fa-paperclip" />
                            <span>Has attachments</span>
                        </div>
                    )}

                    {/* Reply action */}
                    <div className="mt-4 pl-13">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onReply(message.id);
                            }}
                            className="btn btn-ghost btn-sm rounded-none text-primary"
                        >
                            <i className="fa-duotone fa-regular fa-reply" />
                            Reply
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
