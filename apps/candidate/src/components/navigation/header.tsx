"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useRef, useEffect } from "react";
import { BaselHeader, ThemeToggle } from "@splits-network/basel-ui";
import { useChatSidebarOptional } from "@splits-network/chat-ui";
import type { NavItem } from "@splits-network/shared-types";
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
        label: "Firms",
        href: "/firms",
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

// ─── Chat Trigger ────────────────────────────────────────────────────────────

function ChatTrigger() {
    const sidebar = useChatSidebarOptional();
    const router = useRouter();
    if (!sidebar) return null;

    const handleClick = () => {
        // On mobile, navigate to full messages page instead of opening sidebar widget
        if (window.innerWidth < 768) {
            router.push("/portal/messages");
        } else {
            sidebar.openToList();
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className="btn btn-ghost btn-sm relative"
            aria-label="Open messages"
        >
            <i className="fa-duotone fa-regular fa-messages text-lg" />
            {sidebar.unreadTotalCount > 0 && (
                <span className="badge badge-primary badge-sm absolute -top-1 -right-1 rounded-full">
                    {sidebar.unreadTotalCount > 99
                        ? "99+"
                        : sidebar.unreadTotalCount}
                </span>
            )}
        </button>
    );
}

// ─── Header Component ───────────────────────────────────────────────────────

export default function Header({ navItems }: { navItems?: NavItem[] }) {
    const { isSignedIn } = useAuth();
    const containerRef = useRef<HTMLDivElement>(null);

    const items = navItems ?? DEFAULT_NAV_ITEMS;

    // Publish header height as CSS variable for banner/sidebar positioning
    useEffect(() => {
        if (!containerRef.current) {
            document.documentElement.style.setProperty("--header-h", "0px");
            return;
        }
        const el = containerRef.current;
        const update = () => {
            document.documentElement.style.setProperty(
                "--header-h",
                `${el.offsetHeight}px`,
            );
        };
        update();
        const observer = new ResizeObserver(update);
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <BaselHeader
            containerRef={containerRef}
            position="sticky"
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
                            <div key={item.label} className="dropdown">
                                <div
                                    tabIndex={0}
                                    role="button"
                                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-base-content/70 hover:text-base-content transition-colors"
                                >
                                    {item.label}
                                    <i className="fa-solid fa-chevron-down text-sm" />
                                </div>
                                <div
                                    tabIndex={0}
                                    className={`dropdown-content bg-base-100 border border-base-300 shadow-lg py-2 ${
                                        item.subItems.length > 3
                                            ? "w-80"
                                            : "w-64"
                                    }`}
                                >
                                    <div className="px-4 py-2 border-b border-base-300 mb-1">
                                        <span className="menu-title text-sm font-semibold uppercase tracking-widest text-base-content/40">
                                            {item.label}
                                        </span>
                                    </div>
                                    <ul
                                        className={`menu w-full p-0 ${
                                            item.subItems.length > 3
                                                ? "grid grid-cols-2"
                                                : ""
                                        }`}
                                    >
                                        {item.subItems.map((link) => (
                                            <li key={link.href}>
                                                <Link
                                                    href={link.href}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-base-content/70 hover:bg-base-200 hover:text-base-content"
                                                >
                                                    <div className="w-8 h-8 bg-base-200 flex items-center justify-center flex-shrink-0">
                                                        <i
                                                            className={`${link.icon} text-primary text-sm`}
                                                        />
                                                    </div>
                                                    {link.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
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
                            <ChatTrigger />
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
                    <ul className="menu p-0">
                        {items
                            .filter((item) => !item.subItems?.length)
                            .map((item) => (
                                <li key={item.label}>
                                    <Link
                                        href={item.href || "#"}
                                        className="text-sm font-semibold text-base-content/70"
                                    >
                                        {item.icon && (
                                            <i
                                                className={`${item.icon} text-sm text-primary`}
                                            />
                                        )}
                                        {item.label}
                                    </Link>
                                </li>
                            ))}

                        {isSignedIn && (
                            <>
                                <li className="menu-title border-t border-base-300 mt-3 pt-3">
                                    Portal
                                </li>
                                <li>
                                    <Link
                                        href="/portal/dashboard"
                                        className="text-sm font-semibold text-base-content/70"
                                    >
                                        <i className="fa-duotone fa-regular fa-gauge text-sm text-primary" />
                                        Dashboard
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/portal/search"
                                        className="text-sm font-semibold text-base-content/70"
                                    >
                                        <i className="fa-duotone fa-regular fa-magnifying-glass text-sm text-primary" />
                                        Search
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/portal/applications"
                                        className="text-sm font-semibold text-base-content/70"
                                    >
                                        <i className="fa-duotone fa-regular fa-file-lines text-sm text-primary" />
                                        Applications
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/portal/jobs/saved"
                                        className="text-sm font-semibold text-base-content/70"
                                    >
                                        <i className="fa-duotone fa-regular fa-bookmark text-sm text-primary" />
                                        Saved Jobs
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>

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
