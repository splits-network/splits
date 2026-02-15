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

const M = {
    coral: '#FF6B6B',
    teal: '#4ECDC4',
    yellow: '#FFE66D',
    purple: '#A78BFA',
};

const PALETTE = [M.coral, M.teal, M.yellow, M.purple];

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
                            className="text-[10px] font-bold uppercase tracking-[0.15em]"
                            style={{ color: 'rgba(255,255,255,0.25)' }}
                        >
                            &copy; {displayYear} {companyName}
                        </span>
                        <div className="flex items-center gap-1">
                            {PALETTE.map((c, i) => (
                                <div
                                    key={i}
                                    style={{
                                        width: 8,
                                        height: 8,
                                        backgroundColor: c,
                                    }}
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
                                    className="text-[10px] font-bold uppercase tracking-[0.15em] transition-colors hover:text-white"
                                    style={{ color: 'rgba(255,255,255,0.3)' }}
                                >
                                    {link.label}
                                </LinkTag>
                            ))}
                        </div>
                    )}

                    {/* Status indicator */}
                    {showStatus && (
                        <div className="flex items-center gap-2">
                            <div
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: M.teal,
                                }}
                            />
                            <span
                                className="text-[9px] font-bold uppercase tracking-[0.2em]"
                                style={{ color: M.teal }}
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
