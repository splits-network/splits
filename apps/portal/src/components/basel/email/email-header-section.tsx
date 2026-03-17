"use client";

import { BaselPageHeader } from "@splits-network/basel-ui";
import { useCompactHeaders } from "@/hooks/use-view-mode";
import { useEmail } from "./email-context";

export default function EmailHeaderSection() {
    const { messages, unreadCount, connections } = useEmail();
    const { isCompact, toggleCompact, isLoaded } = useCompactHeaders();

    return (
        <BaselPageHeader
            icon="fa-inbox"
            kicker="Email Hub"
            headline={[
                { text: "Your" },
                { text: "inbox.", highlight: true },
                { text: "Unified." },
            ]}
            subtitle="Read and manage emails from connected accounts in one unified view."
            stats={[
                { value: messages.length, label: "Messages", icon: "fa-envelope", color: "primary" },
                { value: unreadCount, label: "Unread", icon: "fa-bell", color: "accent" },
                { value: connections.length, label: "Accounts", icon: "fa-plug", color: "secondary" },
            ]}
            isCompact={isCompact}
            onToggle={toggleCompact}
            isLoaded={isLoaded}
        />
    );
}
