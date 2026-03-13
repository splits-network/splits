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
    color: "primary" | "secondary" | "accent" | "success" | "warning" | "info" | "error";
    badgeKey?: "messages" | "profile" | "notifications" | "resume";
    isPrimary?: boolean;
}

const ACTIONS: ActionItem[] = [
    {
        href: "/jobs",
        icon: "fa-magnifying-glass",
        label: "Find Jobs",
        color: "primary",
        isPrimary: true,
    },
    {
        href: "/portal/messages",
        icon: "fa-envelope",
        label: "Messages",
        color: "secondary",
        badgeKey: "messages",
    },
    {
        href: "/portal/profile",
        icon: "fa-user",
        label: "Profile",
        color: "accent",
        badgeKey: "profile",
    },
    {
        href: "/portal/applications",
        icon: "fa-paper-plane",
        label: "Applications",
        color: "success",
    },
    {
        href: "/portal/documents",
        icon: "fa-file-lines",
        label: "Documents",
        color: "warning",
        badgeKey: "resume",
    },
    {
        href: "/portal/notifications",
        icon: "fa-bell",
        label: "Alerts",
        color: "info",
        badgeKey: "notifications",
    },
    {
        href: "/marketplace",
        icon: "fa-grid-2",
        label: "Marketplace",
        color: "secondary",
    },
    {
        href: "/portal/recruiters",
        icon: "fa-handshake",
        label: "Recruiters",
        color: "primary",
    },
];

const COLOR_CLASSES = {
    primary: {
        bg: "bg-primary/10",
        text: "text-primary",
        hoverBg: "hover:bg-primary/20",
        solidBg: "bg-primary",
        solidText: "text-primary-content",
        solidHover: "hover:bg-primary/90",
    },
    secondary: {
        bg: "bg-secondary/10",
        text: "text-secondary",
        hoverBg: "hover:bg-secondary/20",
        solidBg: "bg-secondary",
        solidText: "text-secondary-content",
        solidHover: "hover:bg-secondary/90",
    },
    accent: {
        bg: "bg-accent/10",
        text: "text-accent",
        hoverBg: "hover:bg-accent/20",
        solidBg: "bg-accent",
        solidText: "text-accent-content",
        solidHover: "hover:bg-accent/90",
    },
    success: {
        bg: "bg-success/10",
        text: "text-success",
        hoverBg: "hover:bg-success/20",
        solidBg: "bg-success",
        solidText: "text-success-content",
        solidHover: "hover:bg-success/90",
    },
    warning: {
        bg: "bg-warning/10",
        text: "text-warning",
        hoverBg: "hover:bg-warning/20",
        solidBg: "bg-warning",
        solidText: "text-warning-content",
        solidHover: "hover:bg-warning/90",
    },
    info: {
        bg: "bg-info/10",
        text: "text-info",
        hoverBg: "hover:bg-info/20",
        solidBg: "bg-info",
        solidText: "text-info-content",
        solidHover: "hover:bg-info/90",
    },
    error: {
        bg: "bg-error/10",
        text: "text-error",
        hoverBg: "hover:bg-error/20",
        solidBg: "bg-error",
        solidText: "text-error-content",
        solidHover: "hover:bg-error/90",
    },
} as const;

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
                const colors = COLOR_CLASSES[action.color];

                if (action.isPrimary) {
                    return (
                        <Link
                            key={action.href}
                            href={action.href}
                            className={`relative flex items-center gap-2.5 px-5 py-2.5 shrink-0 ${colors.solidBg} ${colors.solidText} ${colors.solidHover} transition-all shadow-sm hover:shadow-md active:scale-[0.98]`}
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
                        className={`relative flex items-center gap-2 px-3.5 py-2.5 shrink-0 bg-base-100 ${colors.hoverBg} border border-base-300/50 hover:border-base-300 transition-all hover:shadow-sm active:scale-[0.98] group`}
                        style={{ borderRadius: 0 }}
                    >
                        <span
                            className={`flex items-center justify-center w-7 h-7 shrink-0 ${colors.bg}`}
                            style={{ borderRadius: 0 }}
                        >
                            <i className={`fa-duotone fa-regular ${action.icon} text-sm ${colors.text}`} />
                        </span>
                        <span className="text-sm font-medium text-base-content/80 group-hover:text-base-content whitespace-nowrap transition-colors">
                            {action.label}
                        </span>
                        {badge && (
                            <span
                                className="badge badge-sm badge-error font-bold ml-0.5"
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