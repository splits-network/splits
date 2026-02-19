"use client";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface BaselFooterProps {
    /** CTA band above the main footer (bg-primary) — pass null to omit */
    cta?: React.ReactNode;
    /** Left column of the split-screen section (newsletter form, etc.) */
    newsletter?: React.ReactNode;
    /** Right column of the split-screen section (logo, tagline, social) */
    brand?: React.ReactNode;
    /** Navigation columns content — rendered inside a 4-col grid */
    columns?: React.ReactNode;
    /** Trust/stats section — rendered inside a 4-col grid */
    stats?: React.ReactNode;
    /** Bottom bar content (copyright, legal links, compliance badges) */
    bottomBar?: React.ReactNode;
    /** Additional className on the outermost container */
    className?: string;
    /** Ref forwarded to the outermost container (for GSAP, etc.) */
    containerRef?: React.RefObject<HTMLElement | null>;
}

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * Basel Design System — Footer Shell
 *
 * Provides the editorial 5-section footer structure from showcase/footers/one:
 *   1. CTA band (bg-primary)
 *   2. Newsletter + Brand split-screen (3/2 grid)
 *   3. Navigation columns (4-col grid)
 *   4. Trust stats bar (4-col grid)
 *   5. Bottom bar (copyright + legal)
 *
 * Content is injected via composition slots. Each app provides its own
 * links, CTA copy, newsletter form, etc.
 *
 * CSS class hooks for GSAP targeting:
 *   .footer-cta-band, .footer-newsletter, .footer-columns,
 *   .footer-col, .footer-stats-bar, .footer-stat, .footer-bottom
 */
export function BaselFooter({
    cta,
    newsletter,
    brand,
    columns,
    stats,
    bottomBar,
    className,
    containerRef,
}: BaselFooterProps) {
    return (
        <div
            ref={containerRef as React.RefObject<HTMLDivElement>}
            className={className}
        >
            {/* ── 1. CTA Band ─────────────────────────────────────── */}
            {cta && (
                <section className="footer-cta-band bg-primary text-primary-content py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-12">
                        {cta}
                    </div>
                </section>
            )}

            {/* ── 2–5. Footer ─────────────────────────────────────── */}
            <footer className="bg-neutral text-neutral-content">
                {/* ── Newsletter + Brand (split-screen) ────────────── */}
                {(newsletter || brand) && (
                    <div className="container mx-auto px-4 sm:px-6 lg:px-12">
                        <div className="grid lg:grid-cols-5 gap-0 py-16 border-b border-neutral-content/10">
                            {newsletter && (
                                <div className="footer-newsletter lg:col-span-3 lg:pr-16 lg:border-r lg:border-neutral-content/10 mb-10 lg:mb-0">
                                    {newsletter}
                                </div>
                            )}
                            {brand && (
                                <div className="lg:col-span-2 lg:pl-16 flex flex-col justify-center">
                                    {brand}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Navigation Columns ───────────────────────────── */}
                {columns && (
                    <div className="container mx-auto px-4 sm:px-6 lg:px-12">
                        <div className="footer-columns grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-neutral-content/10">
                            {columns}
                        </div>
                    </div>
                )}

                {/* ── Trust Stats Bar ──────────────────────────────── */}
                {stats && (
                    <div className="container mx-auto px-4 sm:px-6 lg:px-12">
                        <div className="footer-stats-bar grid grid-cols-2 md:grid-cols-4 gap-6 py-10 border-b border-neutral-content/10">
                            {stats}
                        </div>
                    </div>
                )}

                {/* ── Bottom Bar ───────────────────────────────────── */}
                {bottomBar && (
                    <div className="container mx-auto px-4 sm:px-6 lg:px-12">
                        <div className="footer-bottom py-6">{bottomBar}</div>
                    </div>
                )}

                {/* Bottom accent line */}
                <div className="h-1 bg-primary w-full" />
                <div className="flex items-center justify-between">
                    <div className="text-sm text-neutral-content/50">
                        &copy; {new Date().getFullYear()} Splits Network. All
                        rights reserved.
                    </div>
                    <div className="flex items-center gap-4">
                        <a
                            href="/privacy"
                            className="text-sm text-neutral-content/50 hover:text-neutral-content transition-colors"
                        >
                            Privacy Policy
                        </a>
                        <a
                            href="/terms"
                            className="text-sm text-neutral-content/50 hover:text-neutral-content transition-colors"
                        >
                            Terms of Service
                        </a>
                    </div>
                    <div className="flex items-center gap-2 text-xs opacity-30">
                        <div className="flex items-center gap-1">
                            <i className="fa-duotone fa-regular fa-shield-check" />
                            SOC 2 Type II Compliant
                        </div>
                        <div className="flex items-center gap-1">
                            <i className="fa-duotone fa-regular fa-lock" />
                            256-bit Encryption
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
