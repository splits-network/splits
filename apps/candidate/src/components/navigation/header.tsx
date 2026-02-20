"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { BaselHeader, ThemeToggle } from "@splits-network/basel-ui";
import type { NavItem, NavSubItem } from "@splits-network/shared-types";
import UserDropdown from "./user-dropdown";
import NotificationBell from "./notification-bell";
import Image from "next/image";

// ─── Default Nav Data (fallback when CMS is unavailable) ────────────────────

const DEFAULT_NAV_ITEMS: NavItem[] = [
    {
        label: "How It Works",
        href: "/how-it-works",
    },
    {
        label: "Find Jobs",
        href: "/jobs",
    },
    {
        label: "Resources",
        subItems: [
            {
                label: "Career Guides",
                href: "/resources/career-guides",
                icon: "fa-duotone fa-regular fa-book",
                desc: "Actionable career advice",
            },
            {
                label: "Salary Insights",
                href: "/resources/salary-insights",
                icon: "fa-duotone fa-regular fa-chart-line",
                desc: "Compensation data",
            },
            {
                label: "Interview Prep",
                href: "/resources/interview-prep",
                icon: "fa-duotone fa-regular fa-user-tie",
                desc: "Practice and frameworks",
            },
            {
                label: "Success Stories",
                href: "/resources/success-stories",
                icon: "fa-duotone fa-regular fa-star",
                desc: "Real candidate journeys",
            },
            {
                label: "Resume Tips",
                href: "/resources/resume-tips",
                icon: "fa-duotone fa-regular fa-file-alt",
                desc: "Stand out to recruiters",
            },
            {
                label: "Industry Trends",
                href: "/resources/industry-trends",
                icon: "fa-duotone fa-regular fa-display-chart-up",
                desc: "Market intelligence",
            },
        ],
    },
    {
        label: "Find a Recruiter",
        href: "/marketplace",
    },
    {
        label: "Companies",
        subItems: [
            {
                label: "Browse All Companies",
                href: "/companies",
                icon: "fa-duotone fa-regular fa-building",
                desc: "Explore employers",
            },
            {
                label: "Featured Employers",
                href: "/companies/featured",
                icon: "fa-duotone fa-regular fa-crown",
                desc: "Top companies hiring",
            },
            {
                label: "Company Reviews",
                href: "/companies/reviews",
                icon: "fa-duotone fa-regular fa-star",
                desc: "Employee feedback",
            },
        ],
    },
];

// ─── Nav Dropdown ───────────────────────────────────────────────────────────

function NavDropdown({
    label,
    items,
    columns,
    activeDropdown,
    onToggle,
}: {
    label: string;
    items: NavSubItem[];
    columns?: boolean;
    activeDropdown: string | null;
    onToggle: (label: string) => void;
}) {
    return (
        <div className="relative">
            <button
                onClick={() => onToggle(label)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-base-content/70 hover:text-base-content transition-colors"
            >
                {label}
                <i
                    className={`fa-solid fa-chevron-down text-[9px] transition-transform ${
                        activeDropdown === label ? "rotate-180" : ""
                    }`}
                />
            </button>

            {activeDropdown === label && (
                <div
                    className={`absolute top-full left-0 mt-1 bg-base-100 border border-base-300 shadow-lg py-2 z-50 ${
                        columns ? "w-80" : "w-64"
                    }`}
                >
                    <div className="px-4 py-2 border-b border-base-300 mb-1">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-base-content/40">
                            {label}
                        </span>
                    </div>
                    <div className={columns ? "grid grid-cols-2 gap-0" : ""}>
                        {items.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => onToggle("")}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-base-content/70 hover:bg-base-200 hover:text-base-content transition-colors"
                            >
                                <div className="w-8 h-8 bg-base-200 flex items-center justify-center flex-shrink-0">
                                    <i
                                        className={`${link.icon} text-primary text-xs`}
                                    />
                                </div>
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Header Component ───────────────────────────────────────────────────────

export default function Header({ navItems }: { navItems?: NavItem[] }) {
    const { isSignedIn } = useAuth();
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const items = navItems ?? DEFAULT_NAV_ITEMS;

    const toggleDropdown = (label: string) => {
        setActiveDropdown(activeDropdown === label ? null : label);
    };

    return (
        <BaselHeader
            logo={
                <Link href="/" className="flex-shrink-0">
                    <Image
                        src="/logo.png"
                        alt="Applicant Network"
                        width={140}
                        height={48}
                        className="h-10 w-auto"
                    />
                </Link>
            }
            nav={
                <>
                    {items.map((item) =>
                        item.subItems?.length ? (
                            <NavDropdown
                                key={item.label}
                                label={item.label}
                                items={item.subItems}
                                columns={item.subItems.length > 3}
                                activeDropdown={activeDropdown}
                                onToggle={toggleDropdown}
                            />
                        ) : (
                            <Link
                                key={item.label}
                                href={item.href || "#"}
                                className="px-3 py-2 text-sm font-semibold text-base-content/70 hover:text-base-content transition-colors"
                            >
                                {item.label}
                            </Link>
                        ),
                    )}
                </>
            }
            actions={
                <>
                    {/* Theme toggle */}
                    <ThemeToggle />

                    {isSignedIn ? (
                        <>
                            <Link
                                href="/portal/dashboard"
                                className="hidden md:flex btn btn-ghost btn-sm"
                            >
                                <i className="fa-duotone fa-regular fa-gauge-high" />
                                Dashboard
                            </Link>
                            <NotificationBell />
                            <UserDropdown />
                        </>
                    ) : (
                        <>
                            <Link
                                href="/sign-in"
                                className="hidden md:flex btn btn-ghost btn-sm"
                            >
                                <i className="fa-duotone fa-regular fa-arrow-right-to-bracket" />
                                Sign In
                            </Link>
                            <Link
                                href="/sign-up"
                                className="hidden md:flex btn btn-primary btn-sm"
                            >
                                <i className="fa-duotone fa-regular fa-bolt" />
                                Get Started
                            </Link>
                        </>
                    )}
                </>
            }
            mobileMenu={
                <>
                    <nav className="space-y-1">
                        {items
                            .filter((item) => !item.subItems?.length)
                            .map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href || "#"}
                                    className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-base-content/70 hover:bg-base-200 transition-colors"
                                >
                                    {item.icon && (
                                        <i
                                            className={`${item.icon} text-xs text-primary`}
                                        />
                                    )}
                                    {item.label}
                                </Link>
                            ))}

                        {isSignedIn && (
                            <>
                                <div className="border-t border-base-300 my-3" />
                                <Link
                                    href="/portal/dashboard"
                                    className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-base-content/70 hover:bg-base-200 transition-colors"
                                >
                                    <i className="fa-duotone fa-regular fa-gauge text-xs text-primary" />
                                    Dashboard
                                </Link>
                                <Link
                                    href="/portal/applications"
                                    className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-base-content/70 hover:bg-base-200 transition-colors"
                                >
                                    <i className="fa-duotone fa-regular fa-file-lines text-xs text-primary" />
                                    Applications
                                </Link>
                            </>
                        )}
                    </nav>

                    {!isSignedIn && (
                        <div className="space-y-2 pt-4 border-t border-base-300 mt-4">
                            <Link
                                href="/sign-up"
                                className="btn btn-primary btn-sm w-full"
                            >
                                <i className="fa-duotone fa-regular fa-bolt" />
                                Get Started
                            </Link>
                            <Link
                                href="/sign-in"
                                className="btn btn-ghost btn-sm w-full"
                            >
                                <i className="fa-duotone fa-regular fa-arrow-right-to-bracket" />
                                Sign In
                            </Link>
                        </div>
                    )}
                </>
            }
        />
    );
}
