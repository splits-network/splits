"use client";

/**
 * Thread detail panel — shows all messages in a thread with
 * expand/collapse, subject header, back button, reply action.
 * Sits in the right 62% of the split view.
 */

import { useEmail } from "./email-context";
import EmailMessageCard from "./email-message-card";

export default function EmailThreadDetail() {
    const { thread, loadingThread, closeThread, openCompose, selectedConnection } =
        useEmail();

    if (loadingThread) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <span className="loading loading-spinner loading-md text-primary" />
                    <p className="text-sm text-base-content/50 mt-3">
                        Loading thread...
                    </p>
                </div>
            </div>
        );
    }

    if (!thread) return null;

    const subject = thread.messages[0]?.subject || "(no subject)";
    const messageCount = thread.messages.length;

    const handleReply = (messageId: string) => {
        const msg = thread.messages.find((m) => m.id === messageId);
        openCompose({
            toEmail: msg?.from?.email,
            subject: subject.startsWith("Re:") ? subject : `Re: ${subject}`,
            inReplyTo: messageId,
            threadId: thread.id,
            connectionId: selectedConnection?.id,
        });
    };

    return (
        <div className="flex flex-col h-full">
            {/* Thread header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-base-300 bg-base-200/30">
                <div className="flex items-center gap-3 min-w-0">
                    {/* Mobile back */}
                    <button
                        onClick={closeThread}
                        className="btn btn-ghost btn-sm btn-square lg:hidden"
                    >
                        <i className="fa-solid fa-arrow-left" />
                    </button>
                    <div className="min-w-0">
                        <h3 className="text-sm font-black tracking-tight truncate">
                            {subject}
                        </h3>
                        <p className="text-sm text-base-content/40">
                            {messageCount} message{messageCount !== 1 ? "s" : ""}{" "}
                            in thread
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={closeThread}
                        className="btn btn-ghost btn-sm rounded-none hidden lg:flex"
                    >
                        <i className="fa-duotone fa-regular fa-arrow-left" />
                        Back
                    </button>
                    <button
                        onClick={() => handleReply(thread.messages[thread.messages.length - 1].id)}
                        className="btn btn-primary btn-sm rounded-none font-bold uppercase tracking-wider"
                    >
                        <i className="fa-duotone fa-regular fa-reply" />
                        Reply
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
                {thread.messages.map((msg, i) => (
                    <EmailMessageCard
                        key={msg.id}
                        message={msg}
                        isLast={i === thread.messages.length - 1}
                        onReply={handleReply}
                    />
                ))}
            </div>
        </div>
    );
}
