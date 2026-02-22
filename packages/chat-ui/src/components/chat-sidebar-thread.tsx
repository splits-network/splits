"use client";

import type { ReactNode } from "react";

export interface ChatSidebarThreadProps {
    conversationId: string;
    messagesPagePath?: string;
    children: ReactNode;
}

export function ChatSidebarThread({ children }: ChatSidebarThreadProps) {
    return <>{children}</>;
}
