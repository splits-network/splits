import React from "react";

export interface FooterLinkData {
    label: string;
    icon: string;
    href?: string;
}

export interface FooterLinkColumnProps {
    title: string;
    icon: string;
    color: string;
    links: FooterLinkData[];
    /** Custom link component for SPA navigation (e.g., Next.js Link). Defaults to <a>. */
    linkComponent?: React.ElementType;
}

/**
 * Memphis footer link column with colored icon header and link list.
 * Each link has hover:translate-x-1 and color highlight on hover.
 */
export function FooterLinkColumn({
    title,
    icon,
    color,
    links,
    linkComponent,
}: FooterLinkColumnProps) {
    const isYellow = color === "#FFE66D";

    return (
        <div>
            {/* Section header */}
            <div className="flex items-center gap-2 mb-5">
                <div
                    className="w-7 h-7 flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: color }}
                >
                    <i
                        className={`${icon} text-sm ${isYellow ? "text-dark" : "text-white"}`}
                    />
                </div>
                <span
                    className="text-sm font-black uppercase tracking-wider"
                    style={{ color }}
                >
                    {title}
                </span>
            </div>

            {/* Links */}
            <ul className="space-y-2">
                {links.map((link, i) => (
                    <FooterLink
                        key={i}
                        link={link}
                        sectionColor={color}
                        linkComponent={linkComponent}
                    />
                ))}
            </ul>
        </div>
    );
}

function FooterLink({
    link,
    sectionColor,
    linkComponent,
}: {
    link: FooterLinkData;
    sectionColor: string;
    linkComponent?: React.ElementType;
}) {
    const LinkTag = link.href ? linkComponent || "a" : "span";

    return (
        <li>
            <LinkTag
                {...(link.href ? { href: link.href } : {})}
                className="group flex items-center gap-2 transition-all hover:translate-x-1 cursor-pointer text-white/60"
            >
                <i
                    className={`${link.icon} text-sm transition-colors`}
                    style={{ color: `${sectionColor}88` }}
                />
                <span className="text-sm font-bold uppercase tracking-wider transition-colors group-hover:text-white">
                    {link.label}
                </span>
            </LinkTag>
        </li>
    );
}
