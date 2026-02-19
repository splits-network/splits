"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { BaselHeader, ThemeToggle } from "@splits-network/basel-ui";
import { UserDropdown } from "./user-dropdown";
import NotificationBell from "./notification-bell";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* ─── Navigation Data ────────────────────────────────────────────────────── */

interface NavSubItem {
    icon: string;
    label: string;
    desc: string;
    href?: string;
}

interface NavItemDef {
    label: string;
    icon: string;
    hasDropdown: boolean;
    href?: string;
    subItems?: NavSubItem[];
}

const NAV_ITEMS: NavItemDef[] = [
    {
        label: "Platform",
        icon: "fa-duotone fa-regular fa-grid-2",
        hasDropdown: true,
        subItems: [
            {
                icon: "fa-duotone fa-regular fa-briefcase",
                label: "ATS",
                desc: "Track every candidate",
                href: "/public/platform/ats",
            },
            {
                icon: "fa-duotone fa-regular fa-handshake",
                label: "Split Fees",
                desc: "Fair, transparent splits",
                href: "/public/platform/split-fees",
            },
            {
                icon: "fa-duotone fa-regular fa-chart-mixed",
                label: "Analytics",
                desc: "Real-time insights",
                href: "/public/platform/analytics",
            },
            {
                icon: "fa-duotone fa-regular fa-messages",
                label: "Messaging",
                desc: "Built-in communication",
                href: "/public/platform/messaging",
            },
            {
                icon: "fa-duotone fa-regular fa-robot",
                label: "AI Matching",
                desc: "Smart candidate pairing",
                href: "/public/platform/ai-matching",
            },
            {
                icon: "fa-duotone fa-regular fa-file-invoice-dollar",
                label: "Billing",
                desc: "Automated payouts",
                href: "/public/platform/billing",
            },
        ],
    },
    {
        label: "Network",
        icon: "fa-duotone fa-regular fa-circle-nodes",
        hasDropdown: true,
        subItems: [
            {
                icon: "fa-duotone fa-regular fa-user-tie",
                label: "For Recruiters",
                desc: "Grow your business",
                href: "/public/for-recruiters",
            },
            {
                icon: "fa-duotone fa-regular fa-building",
                label: "For Companies",
                desc: "Find top talent",
                href: "/public/for-companies",
            },
            {
                icon: "fa-duotone fa-regular fa-address-book",
                label: "Directory",
                desc: "Browse the network",
            },
        ],
    },
    {
        label: "Pricing",
        icon: "fa-duotone fa-regular fa-tag",
        hasDropdown: false,
        href: "/public/pricing",
    },
    {
        label: "Resources",
        icon: "fa-duotone fa-regular fa-books",
        hasDropdown: true,
        subItems: [
            {
                icon: "fa-duotone fa-regular fa-gears",
                label: "How It Works",
                desc: "See the platform in action",
                href: "/public/how-it-works",
            },
            {
                icon: "fa-duotone fa-regular fa-life-ring",
                label: "Help Center",
                desc: "Get support",
            },
            {
                icon: "fa-duotone fa-regular fa-newspaper",
                label: "Blog",
                desc: "Latest industry insights",
            },
        ],
    },
    {
        label: "Company",
        icon: "fa-duotone fa-regular fa-building-columns",
        hasDropdown: true,
        subItems: [
            {
                icon: "fa-duotone fa-regular fa-users",
                label: "About",
                desc: "Our story & mission",
            },
            {
                icon: "fa-duotone fa-regular fa-envelope",
                label: "Contact",
                desc: "Get in touch",
            },
        ],
    },
];

/* ─── Desktop Nav Content ────────────────────────────────────────────────── */

function DesktopNavContent() {
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const navRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside the nav
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(e.target as Node)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const toggleDropdown = (label: string) => {
        setActiveDropdown(activeDropdown === label ? null : label);
    };

    return (
        <div ref={navRef} className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
                <div key={item.label} className="relative">
                    {item.href && !item.hasDropdown ? (
                        <Link
                            href={item.href}
                            className="nav-link-item opacity-0 px-3 py-2 text-md font-semibold text-base-content/70 hover:text-base-content transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <button
                            onClick={() =>
                                item.hasDropdown && toggleDropdown(item.label)
                            }
                            className="nav-link-item opacity-0 flex items-center gap-1.5 px-3 py-2 text-md font-semibold text-base-content/70 hover:text-base-content transition-colors"
                        >
                            {item.label}
                            {item.hasDropdown && (
                                <i
                                    className={`fa-solid fa-chevron-down text-sm transition-transform ${
                                        activeDropdown === item.label
                                            ? "rotate-180"
                                            : ""
                                    }`}
                                />
                            )}
                        </button>
                    )}

                    {/* Dropdown */}
                    {item.hasDropdown &&
                        item.subItems &&
                        activeDropdown === item.label && (
                            <div
                                className="absolute top-full left-0 mt-1 bg-base-100 border border-base-300 shadow-lg py-2 z-50"
                                style={{
                                    width:
                                        item.subItems.length > 3
                                            ? "520px"
                                            : "300px",
                                }}
                            >
                                <div className="px-4 py-2 border-b border-base-300 mb-1">
                                    <span className="text-sm font-semibold uppercase tracking-widest text-base-content/40">
                                        {item.label}
                                    </span>
                                </div>
                                <div
                                    className={
                                        item.subItems.length > 3
                                            ? "grid grid-cols-2 gap-0.5"
                                            : ""
                                    }
                                >
                                    {item.subItems.map((sub, i) => (
                                        <Link
                                            key={i}
                                            href={sub.href || "#"}
                                            onClick={() =>
                                                setActiveDropdown(null)
                                            }
                                            className="flex items-center gap-3 px-4 py-2.5 text-md text-base-content/70 hover:bg-base-200 hover:text-base-content transition-colors"
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
                                    ))}
                                </div>
                            </div>
                        )}
                </div>
            ))}
        </div>
    );
}

/* ─── Search Panel ───────────────────────────────────────────────────────── */

function SearchPanel() {
    const [searchOpen, setSearchOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (searchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [searchOpen]);

    return (
        <div className="header-right-item opacity-0 relative">
            <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="btn btn-ghost btn-sm btn-square"
            >
                <i className="fa-duotone fa-regular fa-magnifying-glass text-base-content/60" />
            </button>

            {searchOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-base-100 border border-base-300 shadow-lg p-3 z-50">
                    <div className="relative">
                        <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 text-md" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search jobs, candidates, companies..."
                            className="input input-sm w-full pl-9 bg-base-200 border-base-300 focus:border-primary focus:outline-none"
                        />
                    </div>
                    <div className="mt-2 pt-2 border-t border-base-300">
                        <p className="text-[10px] uppercase tracking-widest text-base-content/30 mb-2">
                            Quick Actions
                        </p>
                        {[
                            {
                                label: "Browse open jobs",
                                icon: "fa-duotone fa-regular fa-briefcase",
                            },
                            {
                                label: "View my candidates",
                                icon: "fa-duotone fa-regular fa-users",
                            },
                            {
                                label: "Check placements",
                                icon: "fa-duotone fa-regular fa-trophy",
                            },
                        ].map((action) => (
                            <a
                                key={action.label}
                                href="#"
                                className="flex items-center gap-2 px-2 py-1.5 text-xs text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors"
                            >
                                <i className={`${action.icon} text-primary`} />
                                {action.label}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── Mobile Menu Content ────────────────────────────────────────────────── */

function MobileMenuContent({ isSignedIn }: { isSignedIn: boolean }) {
    const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

    return (
        <>
            {/* Search */}
            <div className="relative mb-4">
                <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 text-md" />
                <input
                    type="text"
                    placeholder="Search..."
                    className="input input-sm w-full pl-9 bg-base-200 border-base-300"
                />
            </div>

            {/* Accordion navigation */}
            <nav className="space-y-1 mb-4">
                {NAV_ITEMS.map((item) => (
                    <div key={item.label}>
                        {item.subItems ? (
                            <div>
                                <button
                                    onClick={() =>
                                        setActiveAccordion(
                                            activeAccordion === item.label
                                                ? null
                                                : item.label,
                                        )
                                    }
                                    className="flex items-center justify-between w-full px-3 py-2.5 text-md font-semibold text-base-content/70 hover:bg-base-200 transition-colors"
                                >
                                    <span className="flex items-center gap-2">
                                        <i
                                            className={`${item.icon} text-primary text-xs`}
                                        />
                                        {item.label}
                                    </span>
                                    <i
                                        className={`fa-solid fa-chevron-down text-[9px] transition-transform ${
                                            activeAccordion === item.label
                                                ? "rotate-180"
                                                : ""
                                        }`}
                                    />
                                </button>
                                {activeAccordion === item.label && (
                                    <div className="pl-6 space-y-1 mb-2">
                                        {item.subItems.map((sub) => (
                                            <Link
                                                key={sub.label}
                                                href={sub.href || "#"}
                                                className="flex items-center gap-2 px-3 py-2 text-md text-base-content/60 hover:text-base-content"
                                            >
                                                <i
                                                    className={`${sub.icon} text-xs text-primary`}
                                                />
                                                {sub.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                href={item.href || "#"}
                                className="flex items-center gap-2 px-3 py-2.5 text-md font-semibold text-base-content/70 hover:bg-base-200 transition-colors"
                            >
                                <i
                                    className={`${item.icon} text-primary text-xs`}
                                />
                                {item.label}
                            </Link>
                        )}
                    </div>
                ))}
            </nav>

            {/* CTAs */}
            <div className="border-t border-base-300 pt-4 space-y-3">
                {isSignedIn ? (
                    <Link
                        href="/portal/dashboard"
                        className="btn btn-primary btn-sm w-full"
                    >
                        <i className="fa-duotone fa-regular fa-gauge" />
                        Dashboard
                    </Link>
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

/* ─── Main Header Component ──────────────────────────────────────────────── */

export function Header() {
    const { isSignedIn, isLoaded } = useAuth();
    const containerRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

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
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                containerRef.current
                    .querySelectorAll("[class*='opacity-0']")
                    .forEach((el) => {
                        gsap.set(el, { opacity: 1 });
                    });
                return;
            }

            const $ = (sel: string) =>
                containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) =>
                containerRef.current!.querySelector(sel);

            // Logo
            const logo = $1(".header-logo");
            if (logo) {
                gsap.fromTo(
                    logo,
                    { opacity: 0, x: -20 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.5,
                        ease: "power2.out",
                        delay: 0.2,
                    },
                );
            }

            // Nav links stagger
            gsap.fromTo(
                $(".nav-link-item"),
                { opacity: 0, y: -10 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    stagger: 0.06,
                    ease: "power2.out",
                    delay: 0.3,
                },
            );

            // Right side items
            gsap.fromTo(
                $(".header-right-item"),
                { opacity: 0, x: 20 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.4,
                    stagger: 0.08,
                    ease: "power2.out",
                    delay: 0.4,
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
                <Link
                    href="/"
                    className="header-logo flex items-center opacity-0"
                >
                    <Image
                        src="/logo.svg"
                        alt="Splits Network"
                        width={140}
                        height={48}
                        className="h-10 w-auto"
                        priority
                    />
                </Link>
            }
            nav={<DesktopNavContent />}
            actions={
                <>
                    {/* Search */}
                    <div className="hidden lg:block">
                        <SearchPanel />
                    </div>

                    {/* Theme toggle */}
                    <ThemeToggle className="header-right-item opacity-0" />

                    {showSignedIn ? (
                        <>
                            {/* Dashboard link */}
                            <Link
                                href="/portal/dashboard"
                                className="hidden lg:flex btn btn-ghost btn-sm btn-square"
                                title="Dashboard"
                            >
                                <i className="fa-duotone fa-regular fa-gauge text-base-content/60" />
                            </Link>

                            {/* Notifications */}
                            <div>
                                <NotificationBell />
                            </div>

                            {/* User */}
                            <div className="pl-3 ml-1 border-l border-base-300">
                                <UserDropdown />
                            </div>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/sign-in"
                                className="header-right-item opacity-0 btn btn-ghost btn-sm hidden xl:flex"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/sign-up"
                                className="header-right-item opacity-0 btn btn-primary btn-sm"
                            >
                                <i className="fa-duotone fa-regular fa-rocket" />
                                Get Started
                            </Link>
                        </>
                    )}
                </>
            }
            mobileMenu={<MobileMenuContent isSignedIn={!!showSignedIn} />}
        />
    );
}
