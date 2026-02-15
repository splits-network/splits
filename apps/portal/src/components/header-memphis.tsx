"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import type { MobileNavItemData } from "@splits-network/memphis-ui";
import { UserDropdownMemphis } from "./user-dropdown-memphis";
import NotificationBellMemphis from "./notification-bell-memphis";

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

// ─── Nav Data ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
    {
        label: "Platform",
        icon: "fa-duotone fa-regular fa-grid-2",
        color: ACCENT_HEX.coral,
        hasDropdown: true,
        subItems: [
            { icon: "fa-duotone fa-regular fa-briefcase", label: "ATS", desc: "Track every candidate", color: ACCENT_HEX.coral },
            { icon: "fa-duotone fa-regular fa-handshake", label: "Split Fees", desc: "Fair, transparent splits", color: ACCENT_HEX.teal },
            { icon: "fa-duotone fa-regular fa-chart-mixed", label: "Analytics", desc: "Real-time insights", color: ACCENT_HEX.yellow },
            { icon: "fa-duotone fa-regular fa-messages", label: "Messaging", desc: "Built-in communication", color: ACCENT_HEX.purple },
            { icon: "fa-duotone fa-regular fa-robot", label: "AI Matching", desc: "Smart candidate pairing", color: ACCENT_HEX.coral },
            { icon: "fa-duotone fa-regular fa-file-invoice-dollar", label: "Billing", desc: "Automated payouts", color: ACCENT_HEX.teal },
        ],
    },
    {
        label: "Network",
        icon: "fa-duotone fa-regular fa-circle-nodes",
        color: ACCENT_HEX.teal,
        hasDropdown: true,
        subItems: [
            { icon: "fa-duotone fa-regular fa-user-tie", label: "For Recruiters", desc: "Grow your business", color: ACCENT_HEX.teal, href: "/public/for-recruiters" },
            { icon: "fa-duotone fa-regular fa-building", label: "For Companies", desc: "Find top talent", color: ACCENT_HEX.coral, href: "/public/for-companies" },
            { icon: "fa-duotone fa-regular fa-address-book", label: "Directory", desc: "Browse the network", color: ACCENT_HEX.purple },
        ],
    },
    {
        label: "Pricing",
        icon: "fa-duotone fa-regular fa-tag",
        color: ACCENT_HEX.yellow,
        hasDropdown: false,
        href: "/public/pricing",
    },
    {
        label: "Resources",
        icon: "fa-duotone fa-regular fa-books",
        color: ACCENT_HEX.purple,
        hasDropdown: true,
        subItems: [
            { icon: "fa-duotone fa-regular fa-gears", label: "How It Works", desc: "See the platform in action", color: ACCENT_HEX.purple, href: "/public/how-it-works" },
            { icon: "fa-duotone fa-regular fa-life-ring", label: "Help Center", desc: "Get support", color: ACCENT_HEX.teal },
            { icon: "fa-duotone fa-regular fa-newspaper", label: "Blog", desc: "Latest industry insights", color: ACCENT_HEX.coral },
        ],
    },
    {
        label: "Company",
        icon: "fa-duotone fa-regular fa-building-columns",
        color: ACCENT_HEX.coral,
        hasDropdown: true,
        subItems: [
            { icon: "fa-duotone fa-regular fa-users", label: "About", desc: "Our story & mission", color: ACCENT_HEX.coral },
            { icon: "fa-duotone fa-regular fa-envelope", label: "Contact", desc: "Get in touch", color: ACCENT_HEX.teal },
        ],
    },
];

// Build mobile nav items from NAV_ITEMS
const MOBILE_NAV_ITEMS: MobileNavItemData[] = NAV_ITEMS.map((item) => ({
    label: item.label,
    icon: item.icon,
    color: item.color,
    hasDropdown: item.hasDropdown,
    href: item.href,
    subItems: item.subItems?.map((sub) => ({
        icon: sub.icon,
        label: sub.label,
        color: sub.color,
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
    const { isSignedIn } = useAuth();
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [searchOpen, setSearchOpen] = useState(false);

    return (
        <header className="desktop-header relative hidden lg:block bg-dark border-b-4 border-coral">
            <HeaderDecorations variant="desktop" />

            <div className="relative z-10">
                {/* Top utility bar */}
                <div className="flex items-center justify-between px-6 xl:px-10 border-b-4 border-dark-gray">
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
                        <a
                            href="#"
                            className="text-[9px] font-bold uppercase tracking-[0.2em] transition-colors hover:opacity-80 text-white/40"
                        >
                            Help Center
                        </a>
                        <span className="text-[9px] text-white/15">|</span>
                        <a
                            href="#"
                            className="text-[9px] font-bold uppercase tracking-[0.2em] transition-colors hover:opacity-80 text-white/40"
                        >
                            Contact
                        </a>
                    </div>
                </div>

                {/* Main nav bar */}
                <div className="flex items-center justify-between px-6 xl:px-10 py-3.5">
                    {/* Logo */}
                    <Link href="/" className="nav-logo">
                        <HeaderLogo brand="splits" size="md" />
                    </Link>

                    {/* Nav items */}
                    <nav className="flex items-center gap-1">
                        {NAV_ITEMS.map((item) => (
                            <div
                                key={item.label}
                                className="relative"
                                onMouseEnter={() => item.hasDropdown ? setActiveDropdown(item.label) : null}
                                onMouseLeave={() => setActiveDropdown(null)}
                            >
                                {item.href && !item.hasDropdown ? (
                                    <Link href={item.href}>
                                        <NavItem
                                            label={item.label}
                                            icon={item.icon}
                                            color={item.color}
                                            isActive={activeDropdown === item.label}
                                            hasDropdown={false}
                                        />
                                    </Link>
                                ) : (
                                    <NavItem
                                        label={item.label}
                                        icon={item.icon}
                                        color={item.color}
                                        isActive={activeDropdown === item.label}
                                        hasDropdown={item.hasDropdown}
                                    />
                                )}

                                {item.hasDropdown && activeDropdown === item.label && item.subItems && (
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
                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <HeaderSearchToggle isOpen={searchOpen} onToggle={() => setSearchOpen(!searchOpen)} />

                        {isSignedIn ? (
                            <>
                                {/* Dashboard link */}
                                <Link
                                    href="/portal/dashboard"
                                    className="nav-action w-10 h-10 flex items-center justify-center border-interactive border-dark-gray text-white/50 transition-all hover:-translate-y-0.5"
                                    title="Dashboard"
                                >
                                    <i className="fa-duotone fa-regular fa-gauge text-sm" />
                                </Link>
                                <NotificationBellMemphis />
                                <div className="nav-user flex items-center gap-2 pl-3 ml-1 border-l-4 border-dark-gray">
                                    <UserDropdownMemphis />
                                </div>
                            </>
                        ) : (
                            <>
                                <HeaderCta
                                    label="Sign In"
                                    icon="fa-duotone fa-regular fa-arrow-right-to-bracket"
                                    color={ACCENT_HEX.purple}
                                    variant="secondary"
                                    href="/sign-in"
                                    className="nav-cta-secondary hidden xl:flex"
                                />
                                <HeaderCta
                                    label="Get Started"
                                    icon="fa-duotone fa-regular fa-rocket"
                                    color={ACCENT_HEX.coral}
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
    const { isSignedIn } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="mobile-header relative lg:hidden bg-dark border-b-4 border-teal">
            <HeaderDecorations variant="mobile" />

            <div className="relative z-10">
                <div className="flex items-center justify-between px-4 py-3">
                    {/* Logo */}
                    <Link href="/">
                        <HeaderLogo brand="splits" size="sm" />
                    </Link>

                    {/* Right side */}
                    <div className="flex items-center gap-2">
                        {isSignedIn && <NotificationBellMemphis />}

                        <MobileMenuToggle isOpen={menuOpen} onToggle={() => setMenuOpen(!menuOpen)} />
                    </div>
                </div>

                {/* Expandable menu */}
                {menuOpen && (
                    <div className="px-4 pb-4 border-t-4 border-dark-gray">
                        <MobileAccordionNav items={MOBILE_NAV_ITEMS} />

                        {/* CTAs */}
                        <div className="space-y-2 pt-3 border-t-4 border-dark-gray">
                            {isSignedIn ? (
                                <HeaderCta
                                    label="Dashboard"
                                    icon="fa-duotone fa-regular fa-gauge"
                                    color={ACCENT_HEX.coral}
                                    variant="primary"
                                    href="/portal/dashboard"
                                    className="w-full py-3"
                                />
                            ) : (
                                <>
                                    <HeaderCta
                                        label="Get Started Free"
                                        icon="fa-duotone fa-regular fa-rocket"
                                        color={ACCENT_HEX.coral}
                                        variant="primary"
                                        href="/sign-up"
                                        className="w-full py-3"
                                    />
                                    <HeaderCta
                                        label="Sign In"
                                        icon="fa-duotone fa-regular fa-arrow-right-to-bracket"
                                        color={ACCENT_HEX.purple}
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
export function HeaderMemphis() {
    const pathname = usePathname();
    const containerRef = useRef<HTMLDivElement>(null);

    // Don't show header on auth pages
    const isAuthPage =
        pathname?.startsWith("/sign-in") ||
        pathname?.startsWith("/sign-up") ||
        pathname?.startsWith("/sso-callback");

    // Publish header height as CSS variable for sidebar positioning
    useEffect(() => {
        if (!containerRef.current || isAuthPage) {
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
    }, [isAuthPage]);

    // GSAP entrance animations
    useGSAP(
        () => {
            if (!containerRef.current || isAuthPage) return;
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
                tl.fromTo($1(".nav-cta-secondary"), { x: 20, opacity: 0 }, { x: 0, opacity: 1, duration: D.fast, ease: E.snappy }, "-=0.2");
                tl.fromTo($1(".nav-cta-primary"), { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: D.normal, ease: E.bounce }, "-=0.2");
                tl.fromTo($1(".nav-user"), { x: 15, opacity: 0 }, { x: 0, opacity: 1, duration: D.fast }, "-=0.2");
            }

            // Mobile header entrance
            const mobile = $1(".mobile-header");
            if (mobile) {
                gsap.fromTo(mobile, { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: D.slow, ease: E.bounce, delay: 0.2 });
            }
        },
        { scope: containerRef, dependencies: [isAuthPage] },
    );

    if (isAuthPage) return null;

    return (
        <div ref={containerRef} className="sticky top-0 z-50">
            <DesktopNav />
            <MobileNav />
        </div>
    );
}
