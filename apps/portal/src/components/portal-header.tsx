"use client";

import { useState, useEffect, useMemo } from "react";
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
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Sync state with pre-rendered theme from localStorage
        try {
            const saved = localStorage.getItem("theme") || "splits-light";
            setIsDark(saved === "splits-dark");
        } catch {}
    }, []);

    const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.currentTarget.checked;
        const theme = checked ? "splits-dark" : "splits-light";
        document.documentElement.setAttribute("data-theme", theme);
        setIsDark(checked);
        try {
            localStorage.setItem("theme", theme);
        } catch {}
    };

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
            <header className="navbar bg-base-100 border-b border-base-300 min-h-16 px-4">
                {/* Logo */}
                <div className="flex-none">
                    <Link href="/" className="">
                        <img
                            src="/logo.svg"
                            alt="Splits Network"
                            className="h-8"
                        />
                    </Link>
                </div>

                {/* Search bar - centered in header */}
                <div className="flex-1 ml-0 lg:pl-40 min-w-0 px-2 flex items-center gap-4">
                    {/* Page title (hidden on smaller screens when search is prominent) */}
                    {title && (
                        <div className="hidden xl:flex flex-col items-start gap-0 shrink-0 max-w-xs">
                            <h1 className="text-base font-semibold truncate w-full">
                                {title}
                            </h1>
                            {subtitle && (
                                <span className="text-xs text-base-content/60 truncate w-full">
                                    {subtitle}
                                </span>
                            )}
                        </div>
                    )}
                    {/* Global search */}
                    <div className="flex-1 max-w-lg">
                        <GlobalSearchBar />
                    </div>
                </div>

                {/* User controls */}
                <div className="flex-none flex items-center gap-1">
                    {/* Plan indicator badge */}
                    <PlanBadge />

                    {/* Theme toggle */}
                    <label
                        className="swap swap-rotate cursor-pointer btn btn-ghost btn-circle ml-2"
                        title="Toggle Theme"
                    >
                        <input
                            type="checkbox"
                            checked={isDark}
                            onChange={handleThemeChange}
                            className="theme-controller"
                        />
                        <i className="fa-duotone fa-regular fa-sun-bright swap-off text-xl"></i>
                        <i className="fa-duotone fa-regular fa-moon swap-on text-xl"></i>
                    </label>

                    <NotificationBell />
                    <UserDropdown />
                </div>
            </header>

            {/* Conditional toolbar row — only renders when a page provides titleChildren */}
            {titleChildren && (
                <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b border-base-300 bg-base-100 lg:justify-end">
                    {titleChildren}
                </div>
            )}
        </div>
    );
}
