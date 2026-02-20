"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { docsNavSections } from "./docs-nav";

export function DocsSidebar() {
    const pathname = usePathname();

    return (
        <nav className="space-y-6">
            {docsNavSections.map((section) => (
                <div key={section.title}>
                    <div className="text-xs font-semibold uppercase tracking-wider text-base-content/50 mb-2">
                        {section.title}
                    </div>
                    <ul className="space-y-1">
                        {section.items.map((item) => {
                            const isActive = pathname === item.href;
                            const isDisabled = item.comingSoon;
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        aria-disabled={isDisabled}
                                        className={
                                            "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors " +
                                            (isActive
                                                ? "bg-primary/10 text-primary"
                                                : "hover:bg-base-200 text-base-content/80") +
                                            (isDisabled
                                                ? " pointer-events-none opacity-60"
                                                : "")
                                        }
                                    >
                                        <span>{item.title}</span>
                                        {item.comingSoon && (
                                            <span className="badge badge-outline badge-xs">
                                                Coming soon
                                            </span>
                                        )}
                                    </Link>
                                    {item.description && (
                                        <div className="px-3 pb-2 text-xs text-base-content/50">
                                            {item.description}
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ))}
        </nav>
    );
}
