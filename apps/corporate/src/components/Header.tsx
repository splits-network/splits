"use client";

import Link from "next/link";
import Image from "next/image";
import { BaselHeader, ThemeToggle } from "@splits-network/basel-ui";
import type { NavItem } from "@splits-network/shared-types";
import { SupportTrigger } from "@splits-network/support-widget";

// ─── Default Nav Data (fallback when CMS is unavailable) ────────────────────

const DEFAULT_NAV_LINKS: NavItem[] = [
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

export function Header({ navItems }: { navItems?: NavItem[] }) {
    const links = navItems ?? DEFAULT_NAV_LINKS;

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
                    {links.map((link) => (
                        <a
                            key={link.label}
                            href={link.href || "#"}
                            onClick={(e) =>
                                handleSmoothScroll(e, link.href || "#")
                            }
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
                    <SupportTrigger />
                    <a
                        href="https://splits.network"
                        className="hidden md:inline-flex btn btn-ghost text-md font-semibold uppercase tracking-wider"
                    >
                        Post a Job
                    </a>
                    <a
                        href="https://applicant.network"
                        className="hidden md:inline-flex btn btn-primary text-md font-semibold uppercase tracking-wider"
                    >
                        Find Jobs
                    </a>
                </div>
            }
        />
    );
}
