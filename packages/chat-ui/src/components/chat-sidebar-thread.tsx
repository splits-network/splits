"use client";

import type { ReactNode } from "react";

export interface ChatSidebarThreadProps {
    conversationId: string;
    messagesPagePath?: string;
    children: ReactNode;
}

export function ChatSidebarThread({
    children,
}: ChatSidebarThreadProps) {
    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 min-h-0 overflow-hidden">
                {children}
            </div>
        </div>
    );
}
