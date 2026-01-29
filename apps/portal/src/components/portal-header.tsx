"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useUserProfile } from "@/contexts";
import { usePageTitle } from "@/contexts/page-title-context";
import NotificationBell from "@/components/notification-bell";
import { PlanBadge } from "@/components/plan-badge";
import { useClerk, useUser } from "@clerk/nextjs";

export function PortalHeader() {
    const { user } = useUser();
    const { signOut } = useClerk();
    const { isAdmin, isRecruiter, isCompanyUser } = useUserProfile();
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
        <header className="navbar bg-base-100 border-b border-base-300 sticky top-0 z-40 min-h-16">
            {/* Mobile menu toggle */}
            <div className="flex-none lg:hidden">
                <label
                    htmlFor="sidebar-drawer"
                    className="btn btn-square btn-ghost"
                >
                    <i className="fa-duotone fa-regular fa-bars text-lg"></i>
                </label>
            </div>

            {/* Logo */}
            <div className="flex-none">
                <Link href="/portal/dashboard" className="btn btn-ghost px-2">
                    <img src="/logo.svg" alt="Splits Network" className="h-8" />
                </Link>
            </div>

            {/* Page title & subtitle */}
            <div className="flex-1 ml-40 min-w-0 px-2">
                <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                        {title && (
                            <div className="flex flex-col items-start gap-0">
                                <h1 className="text-lg font-semibold truncate">
                                    {title}
                                </h1>
                                {subtitle && (
                                    <span className="text-sm text-base-content/60 truncate hidden sm:inline">
                                        {subtitle}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    {titleChildren && (
                        <div className="flex items-center gap-4 ml-4">
                            {titleChildren}
                        </div>
                    )}
                </div>
            </div>

            {/* User controls */}
            <div className="flex-none flex items-center gap-1 ">
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

                {/* User menu */}
                <div className="dropdown dropdown-end">
                    <div
                        tabIndex={0}
                        role="button"
                        className="btn btn-ghost btn-circle avatar avatar-placeholder"
                    >
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                            {user?.imageUrl ? (
                                <img
                                    src={user.imageUrl}
                                    alt=""
                                    className="rounded-full"
                                />
                            ) : (
                                userInitials
                            )}
                        </div>
                    </div>
                    <ul className="dropdown-content menu bg-base-100 rounded-box shadow-lg p-2 w-56 mt-2 z-50">
                        <li className="menu-title px-4 py-2">
                            <span className="text-sm font-medium text-base-content truncate">
                                {user?.fullName ||
                                    user?.primaryEmailAddress?.emailAddress ||
                                    "User"}
                            </span>
                            <span className="text-xs text-base-content/50">
                                {roleDisplay}
                            </span>
                        </li>
                        <div className="divider my-1"></div>
                        <li>
                            <Link
                                href="/portal/profile"
                                className="justify-between"
                            >
                                <span className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-user text-base-content/70"></i>
                                    Profile
                                </span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/portal/billing"
                                className="justify-between"
                            >
                                <span className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-credit-card text-base-content/70"></i>
                                    Billing
                                </span>
                            </Link>
                        </li>
                        <div className="divider my-1"></div>
                        <li>
                            <button
                                type="button"
                                onClick={() => signOut()}
                                className="text-error"
                            >
                                <span className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-arrow-right-from-bracket"></i>
                                    Sign out
                                </span>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </header>
    );
}
