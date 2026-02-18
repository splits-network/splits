"use client";

import Link from "next/link";
import { Badge } from "@splits-network/memphis-ui";

interface QuickActionsGridProps {
    profileCompletion?: number;
    messageCount?: number;
    notificationCount?: number;
    hasResume?: boolean;
}

export default function QuickActionsGrid({
    profileCompletion = 100,
    messageCount = 0,
    notificationCount = 0,
    hasResume = false,
}: QuickActionsGridProps) {
    // Determine which actions to highlight
    const needsProfileCompletion = profileCompletion < 50;
    const needsResume = !hasResume;
    const hasMessages = messageCount > 0;
    const hasNotifications = notificationCount > 0;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Browse Jobs - always prominent */}
            <Link
                href="/public/jobs"
                className="border-4 border-dark bg-coral text-white p-3 flex flex-col items-start gap-1 hover:-translate-y-0.5 transition-transform"
            >
                <i className="fa-duotone fa-regular fa-search text-lg"></i>
                <span className="text-xs font-black uppercase tracking-widest">Browse Jobs</span>
                <span className="text-[10px] opacity-80">
                    Find opportunities
                </span>
            </Link>

            {/* Messages - highlighted if unread */}
            <Link
                href="/portal/messages"
                className={`border-4 border-dark p-3 flex flex-col items-start gap-1 relative hover:-translate-y-0.5 transition-transform ${
                    hasMessages ? "bg-yellow text-dark" : "bg-white text-dark"
                }`}
            >
                {hasMessages && (
                    <Badge color="coral" size="xs" className="absolute -top-2 -right-2">
                        {messageCount}
                    </Badge>
                )}
                <i className="fa-duotone fa-regular fa-messages text-lg"></i>
                <span className="text-xs font-black uppercase tracking-widest">Messages</span>
                <span className="text-[10px] opacity-60">
                    {hasMessages
                        ? `${messageCount} unread`
                        : "Chat with recruiters"}
                </span>
            </Link>

            {/* Profile - highlighted if incomplete */}
            <Link
                href="/portal/profile"
                className={`border-4 border-dark p-3 flex flex-col items-start gap-1 relative hover:-translate-y-0.5 transition-transform ${
                    needsProfileCompletion ? "bg-yellow/20 text-dark" : "bg-white text-dark"
                }`}
            >
                {needsProfileCompletion && (
                    <Badge color="yellow" size="xs" className="absolute -top-2 -right-2">
                        {profileCompletion}%
                    </Badge>
                )}
                <i className="fa-duotone fa-regular fa-user text-lg"></i>
                <span className="text-xs font-black uppercase tracking-widest">Profile</span>
                <span className="text-[10px] opacity-60">
                    {needsProfileCompletion
                        ? "Complete profile"
                        : "Update details"}
                </span>
            </Link>

            {/* Notifications - highlighted if unread */}
            <Link
                href="/portal/notifications"
                className={`border-4 border-dark p-3 flex flex-col items-start gap-1 relative hover:-translate-y-0.5 transition-transform ${
                    hasNotifications ? "bg-teal text-dark" : "bg-white text-dark"
                }`}
            >
                {hasNotifications && (
                    <Badge color="coral" size="xs" className="absolute -top-2 -right-2">
                        {notificationCount}
                    </Badge>
                )}
                <i className="fa-duotone fa-regular fa-bell text-lg"></i>
                <span className="text-xs font-black uppercase tracking-widest">Notifications</span>
                <span className="text-[10px] opacity-60">
                    {hasNotifications
                        ? `${notificationCount} new`
                        : "View updates"}
                </span>
            </Link>

            {/* Documents - highlighted if no resume */}
            <Link
                href="/portal/documents"
                className={`border-4 border-dark p-3 flex flex-col items-start gap-1 relative hover:-translate-y-0.5 transition-transform ${
                    needsResume ? "bg-purple/20 text-dark" : "bg-white text-dark"
                }`}
            >
                {needsResume && (
                    <Badge color="purple" size="xs" className="absolute -top-2 -right-2">
                        !
                    </Badge>
                )}
                <i className="fa-duotone fa-regular fa-upload text-lg"></i>
                <span className="text-xs font-black uppercase tracking-widest">Documents</span>
                <span className="text-[10px] opacity-60">
                    {needsResume ? "Upload resume" : "Manage files"}
                </span>
            </Link>

            {/* View Applications */}
            <Link
                href="/portal/applications"
                className="border-4 border-dark bg-white text-dark p-3 flex flex-col items-start gap-1 hover:-translate-y-0.5 transition-transform"
            >
                <i className="fa-duotone fa-regular fa-list text-lg"></i>
                <span className="text-xs font-black uppercase tracking-widest">Applications</span>
                <span className="text-[10px] opacity-60">Track progress</span>
            </Link>
        </div>
    );
}
