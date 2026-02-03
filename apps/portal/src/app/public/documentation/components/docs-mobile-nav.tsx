"use client";

import { usePathname, useRouter } from "next/navigation";
import { docsNavSections } from "./docs-nav";

export function DocsMobileNav() {
    const router = useRouter();
    const pathname = usePathname();

    const items = docsNavSections.flatMap((section) =>
        section.items.map((item) => ({
            ...item,
            sectionTitle: section.title,
        })),
    );

    return (
        <div className="lg:hidden">
            <label className="text-xs font-semibold uppercase tracking-wider text-base-content/50">
                Documentation
            </label>
            <select
                className="select select-bordered w-full mt-2"
                value={pathname}
                onChange={(event) => {
                    const value = event.target.value;
                    if (value) {
                        router.push(value);
                    }
                }}
            >
                {items.map((item) => (
                    <option
                        key={item.href}
                        value={item.comingSoon ? "" : item.href}
                        disabled={item.comingSoon}
                    >
                        {item.sectionTitle} · {item.title}
                        {item.comingSoon ? " (Coming soon)" : ""}
                    </option>
                ))}
            </select>
        </div>
    );
}
