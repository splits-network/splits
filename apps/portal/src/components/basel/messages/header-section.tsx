"use client";

import { BaselPageHeader } from "@splits-network/basel-ui";
import { useCompactHeaders } from "@/hooks/use-view-mode";

interface HeaderSectionProps {
    stats: {
        totalConversations: number;
        unreadMessages: number;
        pendingRequests: number;
        archivedConversations: number;
    };
}

export function HeaderSection({ stats }: HeaderSectionProps) {
    const { isCompact, toggleCompact, isLoaded } = useCompactHeaders();

    return (
        <BaselPageHeader
            icon="fa-envelope"
            kicker="Communications Hub"
            headline={[
                { text: "Your" },
                { text: "messages.", highlight: true },
                { text: "All in one place." },
            ]}
            subtitle="Manage conversations, track message requests, and stay connected across your recruiting network."
            stats={[
                { value: stats.totalConversations, label: "Conversations", icon: "fa-envelope", color: "primary" },
                { value: stats.unreadMessages, label: "Unread", icon: "fa-bell", color: "accent" },
                { value: stats.pendingRequests, label: "Requests", icon: "fa-hourglass-half", color: "secondary" },
                { value: stats.archivedConversations, label: "Archived", icon: "fa-box-archive", color: "base" },
            ]}
            isCompact={isCompact}
            onToggle={toggleCompact}
            isLoaded={isLoaded}
        />
    );
}
