"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useUserProfile } from "@/contexts";
import { usePageTitle } from "@/contexts/page-title-context";
import NotificationBell from "@/components/notification-bell";
import { PlanBadge } from "@/components/plan-badge";
import { useUser } from "@clerk/nextjs";
import { UserDropdown } from "./user-dropdown";
import { GlobalSearchBar } from "@/components/global-search";

export function PortalHeader() {
    const { user } = useUser();
    const { isAdmin, isRecruiter, isCompanyUser, logout } = useUserProfile();
    const { title, subtitle, children: titleChildren } = usePageTitle();

    // Get user initials for avatar
    const userInitials = useMemo(() => {
        if (!user) return "?";
        const firstName = user.firstName || "";
        const lastName = user.lastName || "";
        return (
            `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() ||
            user.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() ||
            "?"
        );
    }, [user]);

    // Get role display text
    const roleDisplay = useMemo(() => {
        if (isAdmin) return "Administrator";
        if (isRecruiter && isCompanyUser) return "Recruiter & Company";
        if (isRecruiter) return "Recruiter";
        if (isCompanyUser) return "Company User";
        return "User";
    }, [isAdmin, isRecruiter, isCompanyUser]);

    return (
        <div className="sticky top-0 z-40">
            <header className="navbar bg-base-100 border-b border-base-300 min-h-16 px-4 relative">
                {/* Logo — left */}
                <div className="flex-none">
                    <Link href="/" className="">
                        <img
                            src="/logo.svg"
                            alt="Splits Network"
                            className="h-8"
                        />
                    </Link>
                </div>

                {/* Global search — truly centered on page */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-full max-w-lg px-4 pointer-events-auto">
                        <GlobalSearchBar />
                    </div>
                </div>

                {/* User controls — right */}
                <div className="flex-none flex items-center gap-1 ml-auto">
                    {/* Plan indicator badge */}
                    <PlanBadge />

                    <NotificationBell />
                    <UserDropdown />
                </div>
            </header>

            {/* Bottom bar — page title + optional toolbar actions */}
            {(title || titleChildren) && (
                <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b border-base-300 bg-base-100">
                    {title && (
                        <div className="flex flex-col items-start gap-0 mr-auto">
                            <h1 className="text-base font-semibold truncate">
                                {title}
                            </h1>
                            {subtitle && (
                                <span className="text-xs text-base-content/60 truncate">
                                    {subtitle}
                                </span>
                            )}
                        </div>
                    )}
                    {titleChildren && (
                        <div className="flex flex-wrap items-center gap-2 ml-auto">
                            {titleChildren}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
