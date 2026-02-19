"use client";

import Link from "next/link";
import Image from "next/image";
import { BaselHeader, ThemeToggle } from "@splits-network/basel-ui";

// ─── Nav Links Data ─────────────────────────────────────────────────────────

const NAV_LINKS = [
    { label: "For Recruiters", href: "#for-recruiters" },
    { label: "For Candidates", href: "#for-candidates" },
    { label: "For Companies", href: "#for-companies" },
    { label: "Contact", href: "/contact" },
];

// ─── Smooth Scroll Helper ───────────────────────────────────────────────────

function handleSmoothScroll(
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
) {
    if (href.startsWith("#")) {
        e.preventDefault();
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }
}

// ─── Header Component ───────────────────────────────────────────────────────

export function Header() {
    return (
        <BaselHeader
            position="sticky"
            frosted
            logo={
                <Link href="/" className="flex-shrink-0">
                    <Image
                        src="/logo.png"
                        alt="Employment Networks"
                        width={160}
                        height={54}
                        className="h-10 w-auto"
                        priority
                    />
                </Link>
            }
            nav={
                <>
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            onClick={(e) => handleSmoothScroll(e, link.href)}
                            className="px-3 py-2 text-md font-semibold uppercase tracking-wider text-base-content/70 hover:text-primary transition-colors"
                        >
                            {link.label}
                        </a>
                    ))}
                </>
            }
            actions={
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <a
                        href="https://splits.network"
                        className="hidden md:inline-flex btn btn-ghost text-md font-semibold uppercase tracking-wider"
                    >
                        Sign In
                    </a>
                    <a
                        href="https://applicant.network"
                        className="hidden md:inline-flex btn btn-primary text-md font-semibold uppercase tracking-wider"
                    >
                        Find Jobs
                    </a>
                </div>
            }
            mobileMenu={
                <div className="space-y-4">
                    <nav className="space-y-1">
                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={(e) =>
                                    handleSmoothScroll(e, link.href)
                                }
                                className="block px-4 py-2.5 text-sm font-semibold text-base-content/70 hover:text-primary hover:bg-base-200 transition-colors"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>
                    <div className="border-t border-base-300 pt-4 flex flex-col gap-2">
                        <a
                            href="https://applicant.network"
                            className="btn btn-primary w-full"
                        >
                            Find Jobs
                        </a>
                        <a
                            href="https://splits.network"
                            className="btn btn-ghost w-full"
                        >
                            Sign In
                        </a>
                    </div>
                </div>
            }
        />
    );
}
