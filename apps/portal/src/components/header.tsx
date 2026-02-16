"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
    ACCENT_HEX,
    HeaderLogo,
    NavItem,
    NavDropdown,
    NavDropdownItem,
    HeaderSearchToggle,
    HeaderCta,
    MobileMenuToggle,
    MobileAccordionNav,
    HeaderDecorations,
} from "@splits-network/memphis-ui";
import type { AccentColor, MobileNavItemData } from "@splits-network/memphis-ui";
import { UserDropdown } from "./user-dropdown";
import NotificationBell from "./notification-bell";

// ─── Animation constants ────────────────────────────────────────────────────
const D = { fast: 0.25, normal: 0.4, slow: 0.6 };
const E = {
    smooth: "power2.out",
    bounce: "back.out(1.7)",
    elastic: "elastic.out(1, 0.5)",
    pop: "back.out(2.0)",
    snappy: "power3.out",
};
const S = { tight: 0.04 };

// ─── Nav Data (uses AccentColor names, not hex) ─────────────────────────────
interface NavSubItem {
    icon: string;
    label: string;
    desc: string;
    color: AccentColor;
    href?: string;
}

interface NavItemDef {
    label: string;
    icon: string;
    color: AccentColor;
    hasDropdown: boolean;
    href?: string;
    subItems?: NavSubItem[];
}

const NAV_ITEMS: NavItemDef[] = [
    {
        label: "Platform",
        icon: "fa-duotone fa-regular fa-grid-2",
        color: "coral",
        hasDropdown: true,
        subItems: [
            { icon: "fa-duotone fa-regular fa-briefcase", label: "ATS", desc: "Track every candidate", color: "coral" },
            { icon: "fa-duotone fa-regular fa-handshake", label: "Split Fees", desc: "Fair, transparent splits", color: "teal" },
            { icon: "fa-duotone fa-regular fa-chart-mixed", label: "Analytics", desc: "Real-time insights", color: "yellow" },
            { icon: "fa-duotone fa-regular fa-messages", label: "Messaging", desc: "Built-in communication", color: "purple" },
            { icon: "fa-duotone fa-regular fa-robot", label: "AI Matching", desc: "Smart candidate pairing", color: "coral" },
            { icon: "fa-duotone fa-regular fa-file-invoice-dollar", label: "Billing", desc: "Automated payouts", color: "teal" },
        ],
    },
    {
        label: "Network",
        icon: "fa-duotone fa-regular fa-circle-nodes",
        color: "teal",
        hasDropdown: true,
        subItems: [
            { icon: "fa-duotone fa-regular fa-user-tie", label: "For Recruiters", desc: "Grow your business", color: "teal", href: "/public/for-recruiters" },
            { icon: "fa-duotone fa-regular fa-building", label: "For Companies", desc: "Find top talent", color: "coral", href: "/public/for-companies" },
            { icon: "fa-duotone fa-regular fa-address-book", label: "Directory", desc: "Browse the network", color: "purple" },
        ],
    },
    {
        label: "Pricing",
        icon: "fa-duotone fa-regular fa-tag",
        color: "yellow",
        hasDropdown: false,
        href: "/public/pricing",
    },
    {
        label: "Resources",
        icon: "fa-duotone fa-regular fa-books",
        color: "purple",
        hasDropdown: true,
        subItems: [
            { icon: "fa-duotone fa-regular fa-gears", label: "How It Works", desc: "See the platform in action", color: "purple", href: "/public/how-it-works" },
            { icon: "fa-duotone fa-regular fa-life-ring", label: "Help Center", desc: "Get support", color: "teal" },
            { icon: "fa-duotone fa-regular fa-newspaper", label: "Blog", desc: "Latest industry insights", color: "coral" },
        ],
    },
    {
        label: "Company",
        icon: "fa-duotone fa-regular fa-building-columns",
        color: "coral",
        hasDropdown: true,
        subItems: [
            { icon: "fa-duotone fa-regular fa-users", label: "About", desc: "Our story & mission", color: "coral" },
            { icon: "fa-duotone fa-regular fa-envelope", label: "Contact", desc: "Get in touch", color: "teal" },
        ],
    },
];

// Build mobile nav items — mobile components still use hex strings
const MOBILE_NAV_ITEMS: MobileNavItemData[] = NAV_ITEMS.map((item) => ({
    label: item.label,
    icon: item.icon,
    color: ACCENT_HEX[item.color],
    hasDropdown: item.hasDropdown,
    href: item.href,
    subItems: item.subItems?.map((sub) => ({
        icon: sub.icon,
        label: sub.label,
        color: ACCENT_HEX[sub.color],
        href: sub.href,
    })),
}));

// ─── Utility Bar Items ──────────────────────────────────────────────────────
const UTILITY_ITEMS = [
    { text: "Recruiters: Join Free", colorClass: "text-coral", icon: "fa-duotone fa-regular fa-arrow-right" },
    { text: "Split-Fee Marketplace", colorClass: "text-teal", icon: "fa-duotone fa-regular fa-handshake" },
];

// ─── Desktop Header ─────────────────────────────────────────────────────────
function DesktopNav() {
    const { isSignedIn, isLoaded } = useAuth();
    const [searchOpen, setSearchOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const showSignedIn = mounted && isLoaded && isSignedIn;

    return (
        <header className="desktop-header relative hidden lg:block bg-dark border-b-[5px] border-coral">
            <HeaderDecorations variant="desktop" />

            <div className="relative z-10">
                {/* Top utility bar */}
                <div className="header-utility-bar xl:px-10">
                    <div className="flex items-center gap-2 py-1.5">
                        {UTILITY_ITEMS.map((item, i) => (
                            <span
                                key={i}
                                className={`top-bar-item flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] px-2 py-1 ${item.colorClass}`}
                            >
                                <i className={`${item.icon} text-[8px]`} />
                                {item.text}
                            </span>
                        ))}
                    </div>
                    <div className="flex items-center gap-3 py-1.5">
                        <a href="#" className="text-[9px] font-bold uppercase tracking-[0.2em] transition-colors hover:opacity-80 text-white/40">
                            Help Center
                        </a>
                        <span className="text-[9px] text-white/15">|</span>
                        <a href="#" className="text-[9px] font-bold uppercase tracking-[0.2em] transition-colors hover:opacity-80 text-white/40">
                            Contact
                        </a>
                    </div>
                </div>

                {/* Main nav bar */}
                <div className="navbar px-6 xl:px-10 py-3.5">
                    {/* Logo */}
                    <div className="navbar-start">
                        <Link href="/" className="nav-logo">
                            <HeaderLogo brand="splits" size="md" />
                        </Link>
                    </div>

                    {/* Nav items — CSS-only hover dropdowns via .dropdown-hover */}
                    <nav className="navbar-center gap-1">
                        {NAV_ITEMS.map((item) => (
                            <div
                                key={item.label}
                                className={item.hasDropdown
                                    ? "dropdown dropdown-hover dropdown-bottom dropdown-start"
                                    : "relative"
                                }
                            >
                                {item.href && !item.hasDropdown ? (
                                    <Link href={item.href}>
                                        <NavItem
                                            label={item.label}
                                            icon={item.icon}
                                            color={item.color}
                                            hasDropdown={false}
                                        />
                                    </Link>
                                ) : (
                                    <NavItem
                                        label={item.label}
                                        icon={item.icon}
                                        color={item.color}
                                        hasDropdown={item.hasDropdown}
                                    />
                                )}

                                {item.hasDropdown && item.subItems && (
                                    <NavDropdown accentColor={item.color} title={`${item.label} Tools`}>
                                        {item.subItems.map((sub, i) => (
                                            <NavDropdownItem
                                                key={i}
                                                icon={sub.icon}
                                                label={sub.label}
                                                desc={sub.desc}
                                                color={sub.color}
                                                href={sub.href}
                                            />
                                        ))}
                                    </NavDropdown>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* Right actions */}
                    <div className="navbar-end gap-3">
                        {/* Search */}
                        <HeaderSearchToggle isOpen={searchOpen} onToggle={() => setSearchOpen(!searchOpen)} />

                        {showSignedIn ? (
                            <>
                                {/* Dashboard link */}
                                <Link
                                    href="/portal/dashboard"
                                    className="nav-action"
                                    title="Dashboard"
                                >
                                    <i className="fa-duotone fa-regular fa-gauge text-sm" />
                                </Link>
                                <NotificationBell />
                                <div className="nav-user flex items-center gap-2 pl-3 ml-1 border-l-[3px] border-dark-gray">
                                    <UserDropdown />
                                </div>
                            </>
                        ) : (
                            <>
                                <HeaderCta
                                    label="Sign In"
                                    icon="fa-duotone fa-regular fa-arrow-right-to-bracket"
                                    color="purple"
                                    variant="secondary"
                                    href="/sign-in"
                                    className="nav-cta-secondary hidden xl:flex"
                                />
                                <HeaderCta
                                    label="Get Started"
                                    icon="fa-duotone fa-regular fa-rocket"
                                    color="coral"
                                    variant="primary"
                                    href="/sign-up"
                                    className="nav-cta-primary"
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

// ─── Mobile Header ──────────────────────────────────────────────────────────
function MobileNav() {
    const { isSignedIn, isLoaded } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const showSignedIn = mounted && isLoaded && isSignedIn;

    return (
        <header className="mobile-header relative lg:hidden bg-dark border-b-[5px] border-teal">
            <HeaderDecorations variant="mobile" />

            <div className="relative z-10">
                <div className="navbar px-4 py-3">
                    {/* Logo */}
                    <div className="navbar-start">
                        <Link href="/">
                            <HeaderLogo brand="splits" size="sm" />
                        </Link>
                    </div>

                    {/* Right side */}
                    <div className="navbar-end gap-2">
                        {showSignedIn && <NotificationBell />}
                        <MobileMenuToggle isOpen={menuOpen} onToggle={() => setMenuOpen(!menuOpen)} />
                    </div>
                </div>

                {/* Expandable menu */}
                {menuOpen && (
                    <div className="px-4 pb-4 border-t-[3px] border-dark-gray">
                        <MobileAccordionNav items={MOBILE_NAV_ITEMS} />

                        {/* CTAs */}
                        <div className="space-y-2 pt-3 border-t-[3px] border-dark-gray">
                            {showSignedIn ? (
                                <HeaderCta
                                    label="Dashboard"
                                    icon="fa-duotone fa-regular fa-gauge"
                                    color="coral"
                                    variant="primary"
                                    href="/portal/dashboard"
                                    className="w-full py-3"
                                />
                            ) : (
                                <>
                                    <HeaderCta
                                        label="Get Started Free"
                                        icon="fa-duotone fa-regular fa-rocket"
                                        color="coral"
                                        variant="primary"
                                        href="/sign-up"
                                        className="w-full py-3"
                                    />
                                    <HeaderCta
                                        label="Sign In"
                                        icon="fa-duotone fa-regular fa-arrow-right-to-bracket"
                                        color="purple"
                                        variant="secondary"
                                        href="/sign-in"
                                        className="w-full py-3"
                                    />
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}

// ─── Main Header Component ──────────────────────────────────────────────────
export function Header() {
    const containerRef = useRef<HTMLDivElement>(null);

    // Publish header height as CSS variable for sidebar positioning
    useEffect(() => {
        if (!containerRef.current) {
            document.documentElement.style.setProperty("--header-h", "0px");
            return;
        }
        const el = containerRef.current;
        const update = () => {
            document.documentElement.style.setProperty("--header-h", `${el.offsetHeight}px`);
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
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

            const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => containerRef.current!.querySelector(sel);

            // Desktop header entrance
            const desktop = $1(".desktop-header");
            if (desktop) {
                const tl = gsap.timeline({ defaults: { ease: E.smooth } });
                tl.fromTo(desktop, { y: -60, opacity: 0 }, { y: 0, opacity: 1, duration: D.slow, ease: E.bounce });
                tl.fromTo($(".top-bar-item"), { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: D.fast, stagger: S.tight }, "-=0.3");
                tl.fromTo($1(".nav-logo"), { x: -30, opacity: 0, scale: 0.8 }, { x: 0, opacity: 1, scale: 1, duration: D.normal, ease: E.pop }, "-=0.3");
                tl.fromTo($(".nav-action"), { scale: 0, rotation: -15 }, { scale: 1, rotation: 0, duration: D.fast, stagger: S.tight, ease: E.elastic }, "-=0.2");
                const ctaSecondary = $1(".nav-cta-secondary");
                if (ctaSecondary) tl.fromTo(ctaSecondary, { x: 20, opacity: 0 }, { x: 0, opacity: 1, duration: D.fast, ease: E.snappy }, "-=0.2");
                const ctaPrimary = $1(".nav-cta-primary");
                if (ctaPrimary) tl.fromTo(ctaPrimary, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: D.normal, ease: E.bounce }, "-=0.2");
                const navUser = $1(".nav-user");
                if (navUser) tl.fromTo(navUser, { x: 15, opacity: 0 }, { x: 0, opacity: 1, duration: D.fast }, "-=0.2");
            }

            // Mobile header entrance
            const mobile = $1(".mobile-header");
            if (mobile) {
                gsap.fromTo(mobile, { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: D.slow, ease: E.bounce, delay: 0.2 });
            }
        },
        { scope: containerRef },
    );

    return (
        <div ref={containerRef} className="sticky top-0 z-50">
            <DesktopNav />
            <MobileNav />
        </div>
    );
}
