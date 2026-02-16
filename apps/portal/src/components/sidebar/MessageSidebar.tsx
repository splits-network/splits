"use client";

import { useEffect } from "react";
import Link from "next/link";
import ThreadPanel from "@/app/portal/messages-memphis/components/shared/thread-panel";

interface MessageSidebarProps {
    conversationId: string | null;
    candidateName?: string | null;
    onClose: () => void;
}

export default function MessageSidebar({
    conversationId,
    candidateName,
    onClose,
}: MessageSidebarProps) {
    // Reset conversation when conversationId changes to null
    useEffect(() => {
        if (!conversationId) {
            onClose();
        }
    }, [conversationId, onClose]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [onClose]);

    if (!conversationId) {
        return null;
    }

    return (
        <div className="drawer drawer-end">
            <input
                id="message-sidebar-drawer"
                type="checkbox"
                className="drawer-toggle"
                checked={!!conversationId}
                readOnly
            />

            <div className="drawer-side z-50">
                <label
                    className="drawer-overlay"
                    onClick={onClose}
                    aria-label="Close message sidebar"
                />

                <div className="bg-base-100 h-screen w-full md:w-2/3 lg:w-1/2 xl:w-1/2 flex flex-col">
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="min-w-0">
                                <h2 className="text-lg font-bold">
                                    {candidateName
                                        ? `Message ${candidateName}`
                                        : "Messages"}
                                </h2>
                                <p className="text-sm text-base-content/60">
                                    Chat with candidate
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Link to full messages page */}
                            <Link
                                href={`/portal/messages?conversationId=${conversationId}`}
                                className="btn btn-sm btn-outline"
                                title="Open in full messages page"
                            >
                                <i className="fa-duotone fa-regular fa-external-link"></i>
                                <span className="hidden sm:inline">
                                    Open Full
                                </span>
                            </Link>

                            <button
                                onClick={onClose}
                                className="btn btn-sm btn-square btn-ghost"
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Message Thread */}
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <ThreadPanel
                            conversationId={conversationId}
                            //onClose={onClose}// Hide the thread panel header since we have our own
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
