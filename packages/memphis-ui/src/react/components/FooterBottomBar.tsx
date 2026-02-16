import React from 'react';

export interface FooterBottomBarLegalLink {
    label: string;
    href: string;
}

export interface FooterBottomBarProps {
    companyName?: string;
    year?: number;
    legalLinks?: FooterBottomBarLegalLink[];
    showStatus?: boolean;
    statusText?: string;
    /** Custom link component for SPA navigation (e.g., Next.js Link). Defaults to <a>. */
    linkComponent?: React.ElementType;
}

const PALETTE_CLASSES = ['bg-coral', 'bg-teal', 'bg-yellow', 'bg-purple'];

/**
 * Memphis footer bottom bar with copyright, color palette dots, legal links, and status indicator.
 */
export function FooterBottomBar({
    companyName = 'Employment Networks, Inc.',
    year,
    legalLinks = [],
    showStatus = true,
    statusText = 'All Systems Operational',
    linkComponent,
}: FooterBottomBarProps) {
    const displayYear = year ?? new Date().getFullYear();
    const LinkTag = linkComponent || 'a';

    return (
        <div className="py-5 px-4 md:px-10">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Copyright + palette dots */}
                    <div className="flex items-center gap-4 flex-wrap justify-center">
                        <span
                            className="text-sm font-bold uppercase tracking-wider text-white/25"
                        >
                            &copy; {displayYear} {companyName}
                        </span>
                        <div className="flex items-center gap-1">
                            {PALETTE_CLASSES.map((bgClass, i) => (
                                <div
                                    key={i}
                                    className={`w-2 h-2 ${bgClass}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Legal links */}
                    {legalLinks.length > 0 && (
                        <div className="flex items-center gap-4">
                            {legalLinks.map((link, i) => (
                                <LinkTag
                                    key={i}
                                    href={link.href}
                                    className="text-sm font-bold uppercase tracking-wider transition-colors hover:text-white text-white/30"
                                >
                                    {link.label}
                                </LinkTag>
                            ))}
                        </div>
                    )}

                    {/* Status indicator */}
                    {showStatus && (
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-teal" />
                            <span
                                className="text-sm font-bold uppercase tracking-widest text-teal"
                            >
                                {statusText}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
