"use client";

import Link from "next/link";
import { BaselHeader, ThemeToggle } from "@splits-network/basel-ui";

const NAV_LINKS = [
    { label: "Status", href: "/" },
    { label: "Incidents", href: "#incidents" },
    { label: "Contact", href: "#contact" },
];

export function Header() {
    return (
        <BaselHeader
            position="sticky"
            frosted
            logo={
                <Link
                    href="/"
                    className="flex-shrink-0 flex items-center gap-2"
                >
                    <i className="fa-duotone fa-regular fa-signal-bars text-primary text-lg" />
                    <span className="text-lg font-black tracking-tight">
                        Splits Network{" "}
                        <span className="text-primary">Status</span>
                    </span>
                </Link>
            }
            nav={
                <>
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
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
                        Go to App
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
                                className="block px-4 py-2.5 text-sm font-semibold text-base-content/70 hover:text-primary hover:bg-base-200 transition-colors"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>
                    <div className="border-t border-base-300 pt-4">
                        <a
                            href="https://splits.network"
                            className="btn btn-primary w-full"
                        >
                            Go to App
                        </a>
                    </div>
                </div>
            }
        />
    );
}
