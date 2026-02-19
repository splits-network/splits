"use client";

import Link from "next/link";

interface QuickActionsGridProps {
    profileCompletion?: number;
    messageCount?: number;
    notificationCount?: number;
    hasResume?: boolean;
}

// Static class maps so Tailwind can detect them at build time
const COLOR_CLASSES: Record<string, { bg: string; border: string; text: string }> = {
    primary: { bg: "bg-primary/10", border: "border-primary", text: "text-primary" },
    secondary: { bg: "bg-secondary/10", border: "border-secondary", text: "text-secondary" },
    accent: { bg: "bg-accent/10", border: "border-accent", text: "text-accent" },
    success: { bg: "bg-success/10", border: "border-success", text: "text-success" },
    warning: { bg: "bg-warning/10", border: "border-warning", text: "text-warning" },
    info: { bg: "bg-info/10", border: "border-info", text: "text-info" },
};

const ACTIONS = [
    {
        href: "/public/jobs",
        icon: "fa-search",
        label: "Browse Jobs",
        description: "Find opportunities",
        color: "primary",
        alwaysHighlight: true,
    },
    {
        href: "/portal/messages",
        icon: "fa-messages",
        label: "Messages",
        description: "Chat with recruiters",
        color: "secondary",
        badgeKey: "messages" as const,
    },
    {
        href: "/portal/profile",
        icon: "fa-user",
        label: "Profile",
        description: "Update details",
        color: "accent",
        badgeKey: "profile" as const,
    },
    {
        href: "/portal/notifications",
        icon: "fa-bell",
        label: "Notifications",
        description: "View updates",
        color: "info",
        badgeKey: "notifications" as const,
    },
    {
        href: "/portal/documents",
        icon: "fa-upload",
        label: "Documents",
        description: "Manage files",
        color: "warning",
        badgeKey: "resume" as const,
    },
    {
        href: "/portal/applications",
        icon: "fa-list",
        label: "Applications",
        description: "Track progress",
        color: "success",
    },
    {
        href: "/public/marketplace",
        icon: "fa-store",
        label: "Marketplace",
        description: "Find recruiters",
        color: "secondary",
    },
    {
        href: "/portal/recruiters",
        icon: "fa-user-tie",
        label: "Recruiters",
        description: "Your connections",
        color: "primary",
    },
];

export default function QuickActionsGrid({
    profileCompletion = 100,
    messageCount = 0,
    notificationCount = 0,
    hasResume = false,
}: QuickActionsGridProps) {
    const needsProfileCompletion = profileCompletion < 50;
    const needsResume = !hasResume;
    const hasMessages = messageCount > 0;
    const hasNotifications = notificationCount > 0;

    function getBadge(
        badgeKey?: string,
    ): { value: string; show: boolean } | null {
        if (!badgeKey) return null;
        switch (badgeKey) {
            case "messages":
                return hasMessages
                    ? { value: messageCount.toString(), show: true }
                    : null;
            case "profile":
                return needsProfileCompletion
                    ? { value: `${profileCompletion}%`, show: true }
                    : null;
            case "notifications":
                return hasNotifications
                    ? { value: notificationCount.toString(), show: true }
                    : null;
            case "resume":
                return needsResume ? { value: "!", show: true } : null;
            default:
                return null;
        }
    }

    function isHighlighted(action: (typeof ACTIONS)[0]): boolean {
        if (action.alwaysHighlight) return true;
        const badge = getBadge(action.badgeKey);
        return badge?.show || false;
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ACTIONS.map((action) => {
                const badge = getBadge(action.badgeKey);
                const highlighted = isHighlighted(action);
                const colors = COLOR_CLASSES[action.color] || COLOR_CLASSES.primary;

                return (
                    <Link
                        key={action.href}
                        href={action.href}
                        className={`action-card relative p-4 flex flex-col items-start gap-1.5 transition-all duration-200 hover:-translate-y-0.5 opacity-0 ${
                            highlighted
                                ? `${colors.bg} border-l-4 ${colors.border}`
                                : "bg-base-100 border-l-4 border-transparent hover:border-base-content/10"
                        }`}
                    >
                        {badge?.show && (
                            <span
                                className="absolute top-2 right-2 badge badge-sm badge-error text-[10px] font-bold"
                                style={{ borderRadius: 0 }}
                            >
                                {badge.value}
                            </span>
                        )}
                        <i
                            className={`fa-duotone fa-regular ${action.icon} text-lg ${
                                highlighted
                                    ? colors.text
                                    : "text-base-content/50"
                            }`}
                        />
                        <span className="text-xs font-bold uppercase tracking-wider text-base-content">
                            {action.label}
                        </span>
                        <span className="text-[10px] text-base-content/40">
                            {badge?.show && action.badgeKey === "messages"
                                ? `${messageCount} unread`
                                : badge?.show && action.badgeKey === "profile"
                                  ? "Complete profile"
                                  : badge?.show && action.badgeKey === "resume"
                                    ? "Upload resume"
                                    : badge?.show &&
                                        action.badgeKey === "notifications"
                                      ? `${notificationCount} new`
                                      : action.description}
                        </span>
                    </Link>
                );
            })}
        </div>
    );
}
