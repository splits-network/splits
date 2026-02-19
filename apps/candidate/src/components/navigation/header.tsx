"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { BaselHeader, ThemeToggle } from "@splits-network/basel-ui";
import UserDropdown from "./user-dropdown";
import NotificationBell from "./notification-bell";
import Image from "next/image";

// ─── Nav Data ───────────────────────────────────────────────────────────────

const RESOURCE_LINKS = [
    {
        name: "Career Guides",
        href: "/public/resources/career-guides",
        icon: "fa-duotone fa-regular fa-book",
    },
    {
        name: "Salary Insights",
        href: "/public/resources/salary-insights",
        icon: "fa-duotone fa-regular fa-chart-line",
    },
    {
        name: "Interview Prep",
        href: "/public/resources/interview-prep",
        icon: "fa-duotone fa-regular fa-user-tie",
    },
    {
        name: "Success Stories",
        href: "/public/resources/success-stories",
        icon: "fa-duotone fa-regular fa-star",
    },
    {
        name: "Resume Tips",
        href: "/public/resources/resume-tips",
        icon: "fa-duotone fa-regular fa-file-alt",
    },
    {
        name: "Industry Trends",
        href: "/public/resources/industry-trends",
        icon: "fa-duotone fa-regular fa-display-chart-up",
    },
];

const COMPANY_LINKS = [
    {
        name: "Browse All Companies",
        href: "/public/companies",
        icon: "fa-duotone fa-regular fa-building",
    },
    {
        name: "Featured Employers",
        href: "/public/companies/featured",
        icon: "fa-duotone fa-regular fa-crown",
    },
    {
        name: "Company Reviews",
        href: "/public/companies/reviews",
        icon: "fa-duotone fa-regular fa-star",
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
    items: { name: string; href: string; icon: string }[];
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
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Header Component ───────────────────────────────────────────────────────

export default function Header() {
    const { isSignedIn } = useAuth();
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

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
                    <Link
                        href="/public/how-it-works"
                        className="px-3 py-2 font-semibold text-base-content/70 hover:text-base-content transition-colors"
                    >
                        How It Works
                    </Link>

                    <Link
                        href="/public/jobs"
                        className="px-3 py-2 text-sm font-semibold text-base-content/70 hover:text-base-content transition-colors"
                    >
                        Find Jobs
                    </Link>

                    <NavDropdown
                        label="Resources"
                        items={RESOURCE_LINKS}
                        columns
                        activeDropdown={activeDropdown}
                        onToggle={toggleDropdown}
                    />

                    <Link
                        href="/public/marketplace"
                        className="px-3 py-2 text-sm font-semibold text-base-content/70 hover:text-base-content transition-colors"
                    >
                        Find a Recruiter
                    </Link>

                    <NavDropdown
                        label="Companies"
                        items={COMPANY_LINKS}
                        activeDropdown={activeDropdown}
                        onToggle={toggleDropdown}
                    />
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
                        <Link
                            href="/public/how-it-works"
                            className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-base-content/70 hover:bg-base-200 transition-colors"
                        >
                            <i className="fa-duotone fa-regular fa-circle-info text-xs text-primary" />
                            How It Works
                        </Link>

                        <Link
                            href="/public/jobs"
                            className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-base-content/70 hover:bg-base-200 transition-colors"
                        >
                            <i className="fa-duotone fa-regular fa-briefcase text-xs text-primary" />
                            Find Jobs
                        </Link>

                        <Link
                            href="/public/marketplace"
                            className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-base-content/70 hover:bg-base-200 transition-colors"
                        >
                            <i className="fa-duotone fa-regular fa-users text-xs text-primary" />
                            Find a Recruiter
                        </Link>

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
