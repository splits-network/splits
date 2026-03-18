"use client";

import Link from "next/link";

interface QuickActionsGridProps {
    profileCompletion?: number;
    messageCount?: number;
    notificationCount?: number;
    hasResume?: boolean;
}

interface ActionItem {
    href: string;
    icon: string;
    label: string;
    badgeKey?: "messages" | "profile" | "notifications" | "resume";
    isPrimary?: boolean;
    iconColor?: string;
}

const ACTIONS: ActionItem[] = [
    {
        href: "/jobs",
        icon: "fa-magnifying-glass",
        label: "Find Jobs",
        isPrimary: true,
    },
    {
        href: "/portal/messages",
        icon: "fa-envelope",
        label: "Messages",
        badgeKey: "messages",
        iconColor: "text-info",
    },
    {
        href: "/portal/profile",
        icon: "fa-user",
        label: "Profile",
        badgeKey: "profile",
        iconColor: "text-secondary",
    },
    {
        href: "/portal/applications",
        icon: "fa-paper-plane",
        label: "Applications",
        iconColor: "text-primary",
    },
    {
        href: "/portal/documents",
        icon: "fa-file-lines",
        label: "Documents",
        badgeKey: "resume",
        iconColor: "text-warning",
    },
    {
        href: "/portal/notifications",
        icon: "fa-bell",
        label: "Alerts",
        badgeKey: "notifications",
        iconColor: "text-accent",
    },
    {
        href: "/marketplace",
        icon: "fa-grid-2",
        label: "Marketplace",
        iconColor: "text-success",
    },
    {
        href: "/portal/recruiters",
        icon: "fa-handshake",
        label: "Recruiters",
        iconColor: "text-secondary",
    },
];

export default function QuickActionsGrid({
    profileCompletion = 100,
    messageCount = 0,
    notificationCount = 0,
    hasResume = false,
}: QuickActionsGridProps) {
    function getBadge(badgeKey?: string): string | null {
        if (!badgeKey) return null;
        switch (badgeKey) {
            case "messages":
                return messageCount > 0 ? messageCount.toString() : null;
            case "profile":
                return profileCompletion < 50 ? `${profileCompletion}%` : null;
            case "notifications":
                return notificationCount > 0
                    ? notificationCount.toString()
                    : null;
            case "resume":
                return !hasResume ? "!" : null;
            default:
                return null;
        }
    }

    return (
        <div className="flex items-stretch justify-center gap-2 overflow-x-auto scrollbar-none py-1">
            {ACTIONS.map((action) => {
                const badge = getBadge(action.badgeKey);

                if (action.isPrimary) {
                    return (
                        <Link
                            key={action.href}
                            href={action.href}
                            className="relative flex items-center gap-2.5 px-5 py-2.5 shrink-0 bg-primary text-primary-content hover:bg-primary/90 transition-colors active:scale-[0.98]"
                            style={{ borderRadius: 0 }}
                        >
                            <i className={`fa-duotone fa-regular ${action.icon} text-base`} />
                            <span className="text-sm font-bold whitespace-nowrap">
                                {action.label}
                            </span>
                            <i className="fa-solid fa-arrow-right text-sm opacity-70" />
                        </Link>
                    );
                }

                return (
                    <Link
                        key={action.href}
                        href={action.href}
                        className="relative flex items-center gap-2 px-3.5 py-2.5 shrink-0 bg-base-100 hover:bg-base-300/50 border border-base-300/50 hover:border-base-300 transition-colors active:scale-[0.98] group"
                        style={{ borderRadius: 0 }}
                    >
                        <span
                            className="flex items-center justify-center w-7 h-7 shrink-0 bg-base-content/5"
                            style={{ borderRadius: 0 }}
                        >
                            <i className={`fa-duotone fa-regular ${action.icon} text-sm ${action.iconColor || "text-base-content/60"} transition-colors`} />
                        </span>
                        <span className="text-sm font-medium text-base-content/80 group-hover:text-base-content whitespace-nowrap transition-colors">
                            {action.label}
                        </span>
                        {badge && (
                            <span
                                className="badge badge-sm badge-warning font-bold ml-0.5"
                                style={{ borderRadius: 0 }}
                            >
                                {badge}
                            </span>
                        )}
                    </Link>
                );
            })}
        </div>
    );
}
