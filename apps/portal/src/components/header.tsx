"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { BaselHeader, ThemeToggle } from "@splits-network/basel-ui";
import { useChatSidebarOptional } from "@splits-network/chat-ui";
import type { NavItem } from "@splits-network/shared-types";
import { UserDropdown } from "./user-dropdown";
import NotificationBell from "./notification-bell";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* ─── Default Navigation Data (fallback when CMS is unavailable) ─────────── */

const DEFAULT_NAV_ITEMS: NavItem[] = [
    {
        label: "Platform",
        icon: "fa-duotone fa-regular fa-grid-2",
        subItems: [
            {
                icon: "fa-duotone fa-regular fa-briefcase",
                label: "ATS",
                desc: "Track every candidate",
                href: "/platform/ats",
            },
            {
                icon: "fa-duotone fa-regular fa-handshake",
                label: "Split Fees",
                desc: "Fair, transparent splits",
                href: "/platform/split-fees",
            },
            {
                icon: "fa-duotone fa-regular fa-chart-mixed",
                label: "Analytics",
                desc: "Real-time insights",
                href: "/platform/analytics",
            },
            {
                icon: "fa-duotone fa-regular fa-messages",
                label: "Messaging",
                desc: "Built-in communication",
                href: "/platform/messaging",
            },
            {
                icon: "fa-duotone fa-regular fa-robot",
                label: "AI Matching",
                desc: "Smart candidate pairing",
                href: "/platform/ai-matching",
            },
            {
                icon: "fa-duotone fa-regular fa-file-invoice-dollar",
                label: "Billing",
                desc: "Automated payouts",
                href: "/platform/billing",
            },
        ],
    },
    {
        label: "Network",
        icon: "fa-duotone fa-regular fa-circle-nodes",
        subItems: [
            {
                icon: "fa-duotone fa-regular fa-user-tie",
                label: "For Recruiters",
                desc: "Grow your business",
                href: "/for-recruiters",
            },
            {
                icon: "fa-duotone fa-regular fa-building",
                label: "For Companies",
                desc: "Find top talent",
                href: "/for-companies",
            },
            {
                icon: "fa-duotone fa-regular fa-address-book",
                label: "Directory",
                desc: "Browse the network",
                href: "#",
            },
            {
                icon: "fa-duotone fa-regular fa-building-columns",
                label: "Firms",
                desc: "Explore recruiting firms",
                href: "/firms",
            },
        ],
    },
    {
        label: "Pricing",
        icon: "fa-duotone fa-regular fa-tag",
        href: "/pricing",
    },
    {
        label: "Resources",
        icon: "fa-duotone fa-regular fa-books",
        subItems: [
            {
                icon: "fa-duotone fa-regular fa-gears",
                label: "How It Works",
                desc: "See the platform in action",
                href: "/how-it-works",
            },
            {
                icon: "fa-duotone fa-regular fa-life-ring",
                label: "Help Center",
                desc: "Get support",
                href: "#",
            },
            {
                icon: "fa-duotone fa-regular fa-newspaper",
                label: "Blog",
                desc: "Latest industry insights",
                href: "#",
            },
        ],
    },
    {
        label: "Company",
        icon: "fa-duotone fa-regular fa-building-columns",
        subItems: [
            {
                icon: "fa-duotone fa-regular fa-users",
                label: "About",
                desc: "Our story & mission",
                href: "#",
            },
            {
                icon: "fa-duotone fa-regular fa-envelope",
                label: "Contact",
                desc: "Get in touch",
                href: "#",
            },
        ],
    },
];

/* ─── Desktop Nav Content (DaisyUI dropdown + menu) ──────────────────────── */

function DesktopNavContent({ items }: { items: NavItem[] }) {
    return (
        <div className="flex items-center gap-1">
            {items.map((item) => {
                const hasDropdown = !!item.subItems?.length;

                if (item.href && !hasDropdown) {
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="nav-link-item opacity-0 px-3 py-2 text-md font-semibold text-base-content/70 hover:text-base-content transition-colors"
                        >
                            {item.label}
                        </Link>
                    );
                }

                return (
                    <div key={item.label} className="dropdown">
                        <div
                            tabIndex={0}
                            role="button"
                            className="nav-link-item opacity-0 flex items-center gap-1.5 px-3 py-2 text-md font-semibold text-base-content/70 hover:text-base-content transition-colors"
                        >
                            {item.label}
                            <i className="fa-solid fa-chevron-down text-sm" />
                        </div>
                        {item.subItems && (
                            <div
                                tabIndex={0}
                                className={`dropdown-content bg-base-100 border border-base-300 shadow-lg py-2 ${
                                    item.subItems.length > 3
                                        ? "w-[520px]"
                                        : "w-[300px]"
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
                                            ? "grid grid-cols-2 gap-0.5"
                                            : ""
                                    }`}
                                >
                                    {item.subItems.map((sub, i) => (
                                        <li key={i}>
                                            <Link
                                                href={sub.href || "#"}
                                                className="flex items-center gap-3 px-4 py-2.5 text-md text-base-content/70 hover:bg-base-200 hover:text-base-content"
                                            >
                                                <div className="w-8 h-8 bg-base-200 flex items-center justify-center flex-shrink-0">
                                                    <i
                                                        className={`${sub.icon} text-primary text-sm`}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="text-md font-semibold">
                                                        {sub.label}
                                                    </div>
                                                    <div className="text-sm text-base-content/50">
                                                        {sub.desc}
                                                    </div>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/* ─── Search Panel (DaisyUI dropdown) ────────────────────────────────────── */

function SearchPanel() {
    return (
        <div className="header-right-item opacity-0 dropdown dropdown-end">
            <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-square"
            >
                <i className="fa-duotone fa-regular fa-magnifying-glass text-base-content/60" />
            </div>
            <div
                tabIndex={0}
                className="dropdown-content w-80 bg-base-100 border border-base-300 shadow-lg p-3 mt-2"
            >
                <label className="input input-sm w-full">
                    <i className="fa-duotone fa-regular fa-magnifying-glass opacity-50" />
                    <input
                        type="text"
                        placeholder="Search jobs, candidates, companies..."
                        className="grow"
                    />
                </label>
                <div className="mt-2 pt-2 border-t border-base-300">
                    <p className="text-sm uppercase tracking-widest text-base-content/30 mb-2">
                        Quick Actions
                    </p>
                    <ul className="menu p-0 w-full">
                        {[
                            {
                                label: "Browse roles",
                                icon: "fa-duotone fa-regular fa-briefcase",
                                link: "/portal/roles",
                            },
                            {
                                label: "View my candidates",
                                icon: "fa-duotone fa-regular fa-users",
                                link: "/portal/candidates",
                            },
                            {
                                label: "Check placements",
                                icon: "fa-duotone fa-regular fa-trophy",
                                link: "/portal/placements",
                            },
                        ].map((action) => (
                            <li key={action.label}>
                                <a
                                    href={action.link}
                                    className="text-sm text-base-content/60 hover:text-base-content"
                                >
                                    <i
                                        className={`${action.icon} text-primary`}
                                    />
                                    {action.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

/* ─── Mobile Menu Content (DaisyUI collapse/details) ─────────────────────── */

function MobileMenuContent({
    items,
    isSignedIn,
}: {
    items: NavItem[];
    isSignedIn: boolean;
}) {
    return (
        <>
            {/* Search */}
            <label className="input input-sm w-full mb-4">
                <i className="fa-duotone fa-regular fa-magnifying-glass opacity-50" />
                <input type="text" placeholder="Search..." className="grow" />
            </label>

            {/* Navigation using DaisyUI menu + details for collapsible sub-items */}
            <ul className="menu w-full p-0 mb-4">
                {items.map((item) => (
                    <li key={item.label}>
                        {item.subItems?.length ? (
                            <details>
                                <summary className="text-md font-semibold text-base-content/70">
                                    <i
                                        className={`${item.icon} text-primary text-sm`}
                                    />
                                    {item.label}
                                </summary>
                                <ul>
                                    {item.subItems.map((sub) => (
                                        <li key={sub.label}>
                                            <Link
                                                href={sub.href || "#"}
                                                className="text-md text-base-content/60"
                                            >
                                                <i
                                                    className={`${sub.icon} text-sm text-primary`}
                                                />
                                                {sub.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </details>
                        ) : (
                            <Link
                                href={item.href || "#"}
                                className="text-md font-semibold text-base-content/70"
                            >
                                <i
                                    className={`${item.icon} text-primary text-sm`}
                                />
                                {item.label}
                            </Link>
                        )}
                    </li>
                ))}
            </ul>

            {/* CTAs */}
            <div className="border-t border-base-300 pt-4 space-y-3">
                {isSignedIn ? (
                    <>
                        <Link
                            href="/portal/dashboard"
                            className="btn btn-primary btn-sm w-full"
                        >
                            <i className="fa-duotone fa-regular fa-gauge" />
                            Dashboard
                        </Link>
                        <Link
                            href="/sign-out"
                            className="btn btn-ghost btn-sm w-full border border-base-300"
                        >
                            <i className="fa-duotone fa-regular fa-arrow-right-to-bracket" />
                            Sign Out
                        </Link>
                    </>
                ) : (
                    <>
                        <Link
                            href="/sign-up"
                            className="btn btn-primary btn-sm w-full"
                        >
                            <i className="fa-duotone fa-regular fa-rocket" />
                            Get Started Free
                        </Link>
                        <Link
                            href="/sign-in"
                            className="btn btn-ghost btn-sm w-full border border-base-300"
                        >
                            <i className="fa-duotone fa-regular fa-arrow-right-to-bracket" />
                            Sign In
                        </Link>
                    </>
                )}
            </div>
        </>
    );
}

/* ─── Chat Trigger ──────────────────────────────────────────────────────── */

function ChatTrigger() {
    const sidebar = useChatSidebarOptional();
    if (!sidebar) return null;

    return (
        <button
            type="button"
            onClick={sidebar.openToList}
            className="btn btn-ghost btn-md btn-square"
            aria-label="Open messages"
            title="Messages"
        >
            <span className="relative">
                <i className="fa-duotone fa-regular fa-messages text-base-content/60" />
                {sidebar.unreadTotalCount > 0 && (
                    <span className="badge badge-primary badge-xs absolute -top-2 -right-2.5 rounded-full">
                        {sidebar.unreadTotalCount > 99
                            ? "99+"
                            : sidebar.unreadTotalCount}
                    </span>
                )}
            </span>
        </button>
    );
}

/* ─── Main Header Component ──────────────────────────────────────────────── */

export function Header({ navItems }: { navItems?: NavItem[] }) {
    const { isSignedIn, isLoaded } = useAuth();
    const containerRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    const items = navItems ?? DEFAULT_NAV_ITEMS;

    useEffect(() => {
        setMounted(true);
    }, []);

    // Publish header height as CSS variable for sidebar positioning
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

    // GSAP entrance animations
    useGSAP(
        () => {
            if (!containerRef.current) return;

            const clearOpacity = (els: NodeListOf<Element> | null) => {
                els?.forEach((el) => el.classList.remove("opacity-0"));
            };

            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                clearOpacity(
                    containerRef.current.querySelectorAll(
                        "[class*='opacity-0']",
                    ),
                );
                return;
            }

            const $ = (sel: string) =>
                containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) =>
                containerRef.current!.querySelector(sel);

            // Logo
            const logo = $1(".header-logo");
            if (logo) {
                logo.classList.remove("opacity-0");
                gsap.fromTo(
                    logo,
                    { opacity: 0, x: -20 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.5,
                        ease: "power2.out",
                        delay: 0.2,
                        clearProps: "transform",
                    },
                );
            }

            // Nav links stagger
            const navLinks = $(".nav-link-item");
            clearOpacity(navLinks);
            gsap.fromTo(
                navLinks,
                { opacity: 0, y: -10 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    stagger: 0.06,
                    ease: "power2.out",
                    delay: 0.3,
                    clearProps: "transform",
                },
            );

            // Right side items
            const rightItems = $(".header-right-item");
            clearOpacity(rightItems);
            gsap.fromTo(
                rightItems,
                { opacity: 0, x: 20 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.4,
                    stagger: 0.08,
                    ease: "power2.out",
                    delay: 0.4,
                    clearProps: "transform",
                },
            );
        },
        { scope: containerRef },
    );

    const showSignedIn = mounted && isLoaded && isSignedIn;

    return (
        <BaselHeader
            containerRef={containerRef}
            position="sticky"
            frosted
            logo={
                <span className="mx-4">
                    <Link
                        href="/"
                        className="header-logo flex-shrink-0 opacity-0"
                    >
                        <Image
                            src="/logo.svg"
                            alt="Splits Network"
                            width={140}
                            height={48}
                            className="h-10 w-auto py-0.5"
                            priority
                        />
                    </Link>
                </span>
            }
            nav={<DesktopNavContent items={items} />}
            actions={
                <>
                    {/* Search */}
                    <div className="hidden lg:block">
                        <SearchPanel />
                    </div>

                    {/* Theme toggle */}
                    <ThemeToggle className="header-right-item opacity-0" />

                    {/* Auth actions — stable wrapper so GSAP animation
                        persists across Clerk auth state re-renders */}
                    <div className="header-right-item opacity-0 flex items-center gap-2">
                        {showSignedIn ? (
                            <>
                                <Link
                                    href="/portal/dashboard"
                                    className="hidden lg:flex btn btn-ghost btn-md btn-square"
                                    title="Dashboard"
                                >
                                    <i className="fa-duotone fa-regular fa-gauge text-base-content/60" />
                                </Link>
                                <ChatTrigger />
                                <div>
                                    <NotificationBell />
                                </div>
                                <div className="pl-3 ml-1 border-l border-base-300">
                                    <UserDropdown />
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/sign-in"
                                    className="btn btn-ghost hidden xl:flex"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/sign-up"
                                    className="btn btn-primary"
                                >
                                    <i className="fa-duotone fa-regular fa-rocket" />{" "}
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </>
            }
            mobileMenu={
                <MobileMenuContent items={items} isSignedIn={!!showSignedIn} />
            }
        />
    );
}
