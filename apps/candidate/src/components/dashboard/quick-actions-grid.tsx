"use client";

import Link from "next/link";

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
                className="btn btn-primary btn-sm justify-start h-auto py-3 flex-col items-start gap-1 normal-case"
            >
                <i className="fa-duotone fa-regular fa-search text-lg"></i>
                <span className="font-semibold">Browse Jobs</span>
                <span className="text-[10px] opacity-80">
                    Find opportunities
                </span>
            </Link>

            {/* Messages - highlighted if unread */}
            <Link
                href="/portal/messages"
                className={`btn ${hasMessages ? "btn-warning" : "btn-outline"} btn-sm justify-start h-auto py-3 flex-col items-start gap-1 normal-case relative`}
            >
                <span
                    className={`badge badge-error badge-xs absolute -top-1 -right-1 transition-opacity duration-200 ${
                        hasMessages ? "opacity-100" : "opacity-0 w-0"
                    }`}
                >
                    {messageCount || 0}
                </span>
                <i className="fa-duotone fa-regular fa-messages text-lg"></i>
                <span className="font-semibold">Messages</span>
                <span className="text-[10px] opacity-80">
                    {hasMessages
                        ? `${messageCount} unread`
                        : "Chat with recruiters"}
                </span>
            </Link>

            {/* Profile - highlighted if incomplete */}
            <Link
                href="/portal/profile"
                className={`btn ${needsProfileCompletion ? "btn-outline btn-warning" : "btn-soft btn-warning"} btn-sm justify-start h-auto py-3 flex-col items-start gap-1 normal-case relative`}
            >
                <span
                    className={`badge badge-warning badge-xs absolute -top-1 -right-1 transition-opacity duration-200 ${
                        needsProfileCompletion ? "opacity-100" : "opacity-0 w-0"
                    }`}
                >
                    {profileCompletion}%
                </span>
                <i className="fa-duotone fa-regular fa-user text-lg"></i>
                <span className="font-semibold">Profile</span>
                <span className="text-[10px] opacity-80">
                    {needsProfileCompletion
                        ? "Complete profile"
                        : "Update details"}
                </span>
            </Link>

            {/* Notifications - highlighted if unread */}
            <Link
                href="/portal/notifications"
                className={`btn ${hasNotifications ? "btn-info" : "btn-outline"} btn-sm justify-start h-auto py-3 flex-col items-start gap-1 normal-case relative`}
            >
                <span
                    className={`badge badge-error badge-xs absolute -top-1 -right-1 transition-opacity duration-200 ${
                        hasNotifications ? "opacity-100" : "opacity-0 w-0"
                    }`}
                >
                    {notificationCount || 0}
                </span>
                <i className="fa-duotone fa-regular fa-bell text-lg"></i>
                <span className="font-semibold">Notifications</span>
                <span className="text-[10px] opacity-80">
                    {hasNotifications
                        ? `${notificationCount} new`
                        : "View updates"}
                </span>
            </Link>

            {/* Documents - highlighted if no resume */}
            <Link
                href="/portal/documents"
                className={`btn ${needsResume ? "btn-outline" : "btn-soft"} btn-accent btn-sm justify-start h-auto py-3 flex-col items-start gap-1 normal-case relative`}
            >
                <span
                    className={`badge badge-accent badge-xs absolute -top-1 -right-1 transition-opacity duration-200 ${
                        needsResume ? "opacity-100" : "opacity-0 w-0"
                    }`}
                >
                    !
                </span>
                <i className="fa-duotone fa-regular fa-upload text-lg"></i>
                <span className="font-semibold">Documents</span>
                <span className="text-[10px] opacity-80">
                    {needsResume ? "Upload resume" : "Manage files"}
                </span>
            </Link>

            {/* View Applications */}
            <Link
                href="/portal/applications"
                className="btn btn-outline btn-sm justify-start h-auto py-3 flex-col items-start gap-1 normal-case"
            >
                <i className="fa-duotone fa-regular fa-list text-lg"></i>
                <span className="font-semibold">Applications</span>
                <span className="text-[10px] opacity-80">Track progress</span>
            </Link>
        </div>
    );
}
