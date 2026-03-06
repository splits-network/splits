"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface DockItem {
    href: string;
    label: string;
    icon: string;
    children?: { href: string }[];
}

interface MobileDockProps {
    items: DockItem[];
    moreItems: DockItem[];
}

export function MobileDock({ items, moreItems }: MobileDockProps) {
    const pathname = usePathname();

    const isActive = (item: DockItem) =>
        pathname === item.href ||
        pathname.startsWith(item.href + "/") ||
        (item.children?.some(
            (c) => pathname === c.href || pathname.startsWith(c.href + "/"),
        ) ?? false);

    return (
        <div className="lg:hidden fixed inset-x-0 bottom-0 bg-neutral border-t border-neutral-content/10">
            <div className="flex items-center justify-around px-1 py-2">
                {items.map((item) => {
                    const active = isActive(item);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center gap-1 px-2 py-1 transition-colors"
                            title={item.label}
                        >
                            <div
                                className={`w-8 h-8 flex items-center justify-center ${
                                    active
                                        ? "bg-primary text-primary-content"
                                        : "text-neutral-content/40"
                                }`}
                            >
                                <i className={`${item.icon} text-sm`} />
                            </div>
                            <span
                                className={`text-[8px] font-black uppercase tracking-wider ${
                                    active
                                        ? "text-neutral-content"
                                        : "text-neutral-content/40"
                                }`}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}

                {/* More overflow menu */}
                <div className="dropdown dropdown-top dropdown-center">
                    <div
                        tabIndex={0}
                        role="button"
                        className="flex flex-col items-center gap-1 px-2 py-1 cursor-pointer"
                        title="More options"
                    >
                        <div className="w-8 h-8 flex items-center justify-center text-neutral-content/40">
                            <i className="fa-duotone fa-regular fa-ellipsis text-lg" />
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-wider text-neutral-content/40">
                            More
                        </span>
                    </div>
                    <ul
                        tabIndex={0}
                        className="dropdown-content menu mb-2 p-2 w-52 bg-neutral border border-neutral-content/10 shadow-lg"
                    >
                        {moreItems.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={
                                        pathname === item.href ||
                                        pathname.startsWith(item.href)
                                            ? "active"
                                            : ""
                                    }
                                >
                                    <i className={`${item.icon} text-sm`} />
                                    <span className="text-xs font-bold uppercase tracking-wider">
                                        {item.label}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
