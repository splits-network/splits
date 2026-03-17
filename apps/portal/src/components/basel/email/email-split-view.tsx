"use client";

/**
 * Email split view — 38% inbox / 62% thread detail.
 * Matches the Messages page split-view pattern exactly.
 * Mobile: full-screen takeover when thread is selected.
 */

import { useEmail } from "./email-context";
import EmailInboxHeader from "./email-inbox-header";
import EmailListItem from "./email-list-item";
import EmailThreadDetail from "./email-thread-detail";

export default function EmailSplitView() {
    const {
        messages,
        loading,
        connections,
        selectedConnection,
        selectedThreadId,
        selectThread,
        nextPageToken,
    } = useEmail();

    const noConnections = !loading && connections.length === 0;

    return (
        <div className="flex gap-0 lg:gap-6 h-[calc(100vh-20rem)] min-h-[500px]">
            {/* ── INBOX PANEL (left 38%) ─────────────────────────── */}
            <div
                className={`inbox-panel flex flex-col w-full lg:w-[38%] bg-base-200 border border-base-300 overflow-hidden ${
                    selectedThreadId ? "hidden lg:flex" : "flex"
                }`}
            >
                <EmailInboxHeader />

                {/* Message list */}
                <div className="flex-1 overflow-y-auto">
                    {loading && messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <span className="loading loading-spinner loading-md text-primary" />
                            <p className="text-sm text-base-content/50 mt-3">
                                Loading emails...
                            </p>
                        </div>
                    ) : noConnections ? (
                        <div className="flex flex-col items-center justify-center h-full p-8">
                            <div className="w-16 h-16 bg-base-300 flex items-center justify-center mb-4">
                                <i className="fa-duotone fa-regular fa-envelope-circle-check text-2xl text-base-content/30" />
                            </div>
                            <p className="text-sm font-bold text-base-content/50 mb-1">
                                No email connected
                            </p>
                            <p className="text-sm text-base-content/40 mb-4 text-center">
                                Connect your Gmail or Outlook account to view
                                and send emails directly from Splits.
                            </p>
                            <a
                                href="/portal/integrations"
                                className="btn btn-primary btn-sm rounded-none font-bold uppercase tracking-wider"
                            >
                                <i className="fa-duotone fa-regular fa-plug" />
                                Connect Email
                            </a>
                        </div>
                    ) : !loading && messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full opacity-40">
                            <i className="fa-duotone fa-regular fa-inbox text-4xl mb-3" />
                            <p className="text-sm">No messages found</p>
                        </div>
                    ) : (
                        <>
                            {messages.map((msg) => (
                                <EmailListItem
                                    key={msg.id}
                                    message={msg}
                                    isSelected={
                                        selectedThreadId === msg.threadId
                                    }
                                    onSelect={selectThread}
                                />
                            ))}

                            {nextPageToken && (
                                <div className="text-center py-4">
                                    <button className="btn btn-ghost btn-sm text-primary rounded-none font-semibold uppercase tracking-wider">
                                        Load more
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* ── THREAD PANEL (right 62%) ────────────────────────── */}
            <div
                className={`thread-panel flex flex-col flex-1 bg-base-100 border border-base-300 overflow-hidden ${
                    selectedThreadId
                        ? "fixed inset-0 z-50 flex bg-base-100 lg:static lg:z-auto"
                        : "hidden lg:flex"
                }`}
            >
                {selectedThreadId ? (
                    <EmailThreadDetail />
                ) : (
                    <div className="h-full flex items-center justify-center p-12">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-envelope-open-text text-2xl text-primary" />
                            </div>
                            <h3 className="font-black text-xl tracking-tight mb-2 text-base-content">
                                Select an Email
                            </h3>
                            <p className="text-sm text-base-content/50">
                                Click a message on the left to read the full
                                thread
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
