"use client";

import { useState } from "react";
import { useWizardHelp } from "./wizard-help-context";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface WizardHelpMobileBarProps {
    /** Fallback text when no field is active (current step description) */
    fallbackDescription?: string;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Mobile-only help bar that shows contextual field help at the bottom of the
 * wizard body. Mirrors the desktop sidebar content using the same context.
 * Visible below `lg` breakpoint, hidden when the sidebar is showing.
 */
export function WizardHelpMobileBar({
    fallbackDescription,
}: WizardHelpMobileBarProps) {
    const { activeHelp } = useWizardHelp();
    const [expanded, setExpanded] = useState(false);

    const content = activeHelp;
    const hasTips = content?.tips && content.tips.length > 0;
    const showBar = content || fallbackDescription;

    if (!showBar) return null;

    return (
        <div className="lg:hidden border-t border-base-300 bg-base-200">
            {/* onMouseDown preventDefault keeps focus on the active form field */}
            <div
                role="button"
                tabIndex={-1}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-left cursor-pointer select-none"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => hasTips && setExpanded((v) => !v)}
            >
                {content?.icon && (
                    <i className={`fa-duotone fa-regular ${content.icon} text-primary shrink-0`} />
                )}
                {!content?.icon && (
                    <i className="fa-duotone fa-regular fa-circle-info text-primary shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                    {content ? (
                        <span className="text-sm text-base-content/70 line-clamp-2 block">
                            {content.description}
                        </span>
                    ) : (
                        <span className="text-sm text-base-content/70 line-clamp-2 block">
                            {fallbackDescription}
                        </span>
                    )}
                </div>
                {hasTips && (
                    <i
                        className={`fa-duotone fa-regular fa-chevron-up text-base-content/40 text-xs transition-transform duration-200 shrink-0 ${
                            expanded ? "" : "rotate-180"
                        }`}
                    />
                )}
            </div>

            {/* Expanded tips */}
            {expanded && hasTips && (
                <div className="px-4 pb-3 border-t border-base-300">
                    <ul className="space-y-1.5 pt-2">
                        {content!.tips!.map((tip, i) => (
                            <li key={i} className="text-xs text-base-content/60 flex gap-2">
                                <i className="fa-duotone fa-regular fa-lightbulb text-warning mt-0.5 shrink-0" />
                                <span>{tip}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
