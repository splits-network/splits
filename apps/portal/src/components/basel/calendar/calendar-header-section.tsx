"use client";

import { BaselPageHeader } from "@splits-network/basel-ui";
import { useCompactHeaders } from "@/hooks/use-view-mode";
import { useCalendar } from "./calendar-context";

export default function CalendarHeaderSection() {
    const { events, connections } = useCalendar();
    const { isCompact, toggleCompact, isLoaded } = useCompactHeaders();

    const upcomingCount = events.filter((e) => {
        const start = e.start.dateTime || e.start.date;
        return start && new Date(start) > new Date();
    }).length;

    return (
        <BaselPageHeader
            icon="fa-calendar"
            kicker="Calendar Hub"
            headline={[
                { text: "Your" },
                { text: "schedule.", highlight: true },
                { text: "Organized." },
            ]}
            subtitle="View upcoming events, manage integrations, and keep your schedule in sync."
            stats={[
                { value: events.length, label: "Events", icon: "fa-calendar-check", color: "primary" },
                { value: upcomingCount, label: "Upcoming", icon: "fa-clock", color: "accent" },
                { value: connections.length, label: "Accounts", icon: "fa-plug", color: "secondary" },
            ]}
            isCompact={isCompact}
            onToggle={toggleCompact}
            isLoaded={isLoaded}
        />
    );
}
