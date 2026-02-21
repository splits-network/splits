"use client";

import Link from "next/link";
import Image from "next/image";
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
            className="px-4"
            logo={
                <Link
                    href="/"
                    className="flex-shrink-0 flex items-center gap-3 mx-4"
                >
                    <Image
                        src="/logo.png"
                        alt="Splits Network"
                        width={160}
                        height={54}
                        className="h-10 w-auto py-0.5"
                        priority
                    />
                    <span className="text-lg font-black tracking-tight text-primary">
                        Status
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
                        Splits Network
                    </a>
                </div>
            }
        />
    );
}
