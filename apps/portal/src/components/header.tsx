"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { UserDropdown } from "./user-dropdown";
import NotificationBell from "./notification-bell";

const landingNavLinks = [
    { label: "For Recruiters", href: "/public/for-recruiters", icon: "fa-user-tie", dockLabel: "Recruiters" },
    { label: "For Companies", href: "/public/for-companies", icon: "fa-building", dockLabel: "Companies" },
    { label: "How It Works", href: "/public/how-it-works", icon: "fa-gears", dockLabel: "How It Works" },
    { label: "Pricing", href: "/public/pricing", icon: "fa-tag", dockLabel: "Pricing" },
];

export function Header() {
    const pathname = usePathname();
    const { isSignedIn } = useAuth();
    const [isDark, setIsDark] = useState(false);

    const isPortalPage = pathname?.startsWith("/portal");

    useEffect(() => {
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

    const handleSmoothScroll = (
        e: React.MouseEvent<HTMLAnchorElement>,
        href: string,
    ) => {
        if (href.startsWith("#")) {
            e.preventDefault();
            const element = document.querySelector(href);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    };

    // Don't show header on auth pages
    const isAuthPage =
        pathname?.startsWith("/sign-in") ||
        pathname?.startsWith("/sign-up") ||
        pathname?.startsWith("/sso-callback");
    if (isAuthPage) return null;

    return (
        <>
            <header className="navbar bg-base-100/95 backdrop-blur-sm border-b border-base-200 sticky top-0 z-50">
                <div className="container mx-auto px-4 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        {/* Left: Logo */}
                        <div className="flex-shrink-0 ml-4">
                            <Link href="/">
                                <img
                                    src="/logo.svg"
                                    alt="Splits Network"
                                    className="h-10"
                                />
                            </Link>
                        </div>

                        {/* Center: Nav Links (landing page only, desktop) */}
                        {!isPortalPage && (
                            <nav className="hidden lg:flex items-center gap-1">
                                {landingNavLinks.map((link) =>
                                    link.href.startsWith("#") ? (
                                        <a
                                            key={link.href}
                                            href={link.href}
                                            onClick={(e) =>
                                                handleSmoothScroll(e, link.href)
                                            }
                                            className="px-4 py-2 font-medium text-base-content/70 hover:text-base-content transition-colors rounded-lg hover:bg-base-200"
                                        >
                                            {link.label}
                                        </a>
                                    ) : (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className="px-4 py-2 font-medium text-base-content/70 hover:text-base-content transition-colors rounded-lg hover:bg-base-200"
                                        >
                                            {link.label}
                                        </Link>
                                    ),
                                )}
                            </nav>
                        )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3">
                        {/* Theme toggle */}
                        <label
                            className="swap swap-rotate cursor-pointer btn btn-ghost btn-sm btn-circle"
                            title="Toggle Theme"
                        >
                            <input
                                type="checkbox"
                                checked={isDark}
                                onChange={handleThemeChange}
                                className="theme-controller"
                            />
                            <i className="fa-duotone fa-regular fa-sun-bright swap-off text-lg"></i>
                            <i className="fa-duotone fa-regular fa-moon swap-on text-lg"></i>
                        </label>

                        {isSignedIn ? (
                            <>
                                <Link
                                    href="/portal/dashboard"
                                    className="btn btn-ghost"
                                    title="Dashboard"
                                >
                                    <i className="fa-duotone fa-regular fa-gauge"></i>
                                    <span className="hidden sm:inline">
                                        Dashboard
                                    </span>
                                </Link>
                                <NotificationBell />
                                <UserDropdown />
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/sign-in"
                                    className="btn btn-ghost btn-sm"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/sign-up"
                                    className="btn btn-primary btn-sm"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile Bottom Dock (public/landing pages only) */}
            {!isPortalPage && (
                <div className="lg:hidden fixed inset-x-0 bottom-0 z-50">
                    <div className="dock bg-base-100 border-t border-base-200">
                        {landingNavLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={pathname === link.href || pathname?.startsWith(link.href + "/") ? "dock-active" : ""}
                                title={link.label}
                            >
                                <i className={`fa-duotone fa-regular ${link.icon}`}></i>
                                <span className="dock-label">{link.dockLabel}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
