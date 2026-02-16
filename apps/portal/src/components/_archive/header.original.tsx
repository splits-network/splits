"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import {
    ACCENT_HEX,
    HeaderLogo,
    HeaderCta,
    HeaderDecorations,
    MobileMenuToggle,
    MobileAccordionNav,
} from "@splits-network/memphis-ui";
import type { AccentColor, MobileNavItemData } from "@splits-network/memphis-ui";
import { UserDropdownMemphis } from "./user-dropdown-memphis";
import NotificationBellMemphis from "./notification-bell-memphis";

// ─── Nav Data ───────────────────────────────────────────────────────────────
const landingNavLinks: { label: string; href: string; icon: string; dockLabel: string; color: AccentColor }[] = [
    { label: "For Recruiters", href: "/public/for-recruiters", icon: "fa-duotone fa-regular fa-user-tie", dockLabel: "Recruiters", color: "teal" },
    { label: "For Companies", href: "/public/for-companies", icon: "fa-duotone fa-regular fa-building", dockLabel: "Companies", color: "coral" },
    { label: "How It Works", href: "/public/how-it-works", icon: "fa-duotone fa-regular fa-gears", dockLabel: "How It Works", color: "purple" },
    { label: "Pricing", href: "/public/pricing", icon: "fa-duotone fa-regular fa-tag", dockLabel: "Pricing", color: "yellow" },
];

// Build mobile nav items — mobile components still use hex strings
const MOBILE_NAV_ITEMS: MobileNavItemData[] = landingNavLinks.map((link) => ({
    label: link.label,
    icon: link.icon,
    color: ACCENT_HEX[link.color],
    hasDropdown: false,
    href: link.href,
}));

export function Header() {
    const pathname = usePathname();
    const { isSignedIn } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isPortalPage = pathname?.startsWith("/portal");

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
            {/* ─── Desktop Header ──────────────────────────────────────────── */}
            <header className="hidden lg:block bg-dark border-b-4 border-coral sticky top-0 z-50 relative">
                <HeaderDecorations variant="desktop" />

                <div className="relative z-10">
                    <div className="flex items-center justify-between px-6 xl:px-10 py-3.5">
                        {/* Logo */}
                        <Link href="/" className="nav-logo">
                            <HeaderLogo brand="splits" size="md" />
                        </Link>

                        {/* Center: Nav Links (landing page only) */}
                        {!isPortalPage && (
                            <nav className="flex items-center gap-1">
                                {landingNavLinks.map((link) =>
                                    link.href.startsWith("#") ? (
                                        <a
                                            key={link.href}
                                            href={link.href}
                                            onClick={(e) =>
                                                handleSmoothScroll(e, link.href)
                                            }
                                            className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] border-4 border-transparent transition-colors text-cream/70 hover:text-cream hover:border-dark-gray"
                                        >
                                            <i className={`${link.icon} text-[10px]`} />
                                            {link.label}
                                        </a>
                                    ) : (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] border-4 transition-colors ${
                                                pathname === link.href || pathname?.startsWith(link.href + "/")
                                                    ? "border-coral text-cream"
                                                    : "border-transparent text-cream/70 hover:text-cream hover:border-dark-gray"
                                            }`}
                                        >
                                            <i className={`${link.icon} text-[10px]`} />
                                            {link.label}
                                        </Link>
                                    ),
                                )}
                            </nav>
                        )}

                        {/* Right: Actions */}
                        <div className="flex items-center gap-3">
                            {isSignedIn ? (
                                <>
                                    {/* Dashboard link */}
                                    <Link
                                        href="/portal/dashboard"
                                        className="nav-action w-10 h-10 flex items-center justify-center border-interactive border-dark-gray text-cream/50 transition-colors hover:text-cream"
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
                                        color="purple"
                                        variant="secondary"
                                        href="/sign-in"
                                        className="nav-cta-secondary"
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

            {/* ─── Mobile Header ────────────────────────────────────────────── */}
            <header className="lg:hidden bg-dark border-b-4 border-teal sticky top-0 z-50 relative">
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
                            {!isPortalPage && (
                                <MobileMenuToggle
                                    isOpen={mobileMenuOpen}
                                    onToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
                                />
                            )}
                        </div>
                    </div>

                    {/* Expandable mobile menu */}
                    {!isPortalPage && mobileMenuOpen && (
                        <div className="px-4 pb-4 border-t-4 border-dark-gray">
                            <MobileAccordionNav items={MOBILE_NAV_ITEMS} />

                            {/* CTAs */}
                            <div className="space-y-2 pt-3 border-t-4 border-dark-gray">
                                {isSignedIn ? (
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

            {/* ─── Mobile Bottom Dock (public/landing pages only) ───────────── */}
            {!isPortalPage && (
                <div className="lg:hidden fixed inset-x-0 bottom-0 z-50">
                    <div className="flex items-center justify-around bg-dark border-t-4 border-dark-gray py-2">
                        {landingNavLinks.map((link) => {
                            const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex flex-col items-center gap-1 px-3 py-1 transition-all ${
                                        isActive ? "text-coral" : "text-cream/40 hover:text-cream/70"
                                    }`}
                                    title={link.label}
                                >
                                    <i className={`${link.icon} text-base`} />
                                    <span className="text-[9px] font-bold uppercase tracking-wider">
                                        {link.dockLabel}
                                    </span>
                                    {isActive && (
                                        <div className="w-4 h-1 bg-coral" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </>
    );
}