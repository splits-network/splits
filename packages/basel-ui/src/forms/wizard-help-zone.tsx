"use client";

import { useRef, useCallback } from "react";
import { useWizardHelp, type WizardHelpContent } from "./wizard-help-context";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface WizardHelpZoneProps {
    /** Field or section title shown in the help panel */
    title: string;
    /** Contextual description of the field */
    description: string;
    /** FontAwesome icon class (optional) */
    icon?: string;
    /** Helpful tips displayed as a bulleted list */
    tips?: string[];
    /** Wrapped form field(s) */
    children: React.ReactNode;
    /** Additional className on the wrapper div */
    className?: string;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Wraps a form field to provide contextual help in the wizard sidebar.
 * Updates the sidebar on hover (mouseenter/mouseleave) and keyboard focus
 * (focusCapture/blurCapture for accessibility).
 */
export function WizardHelpZone({
    title,
    description,
    icon,
    tips,
    children,
    className,
}: WizardHelpZoneProps) {
    const { setActiveHelp } = useWizardHelp();
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Store content in a ref for object stability (avoids re-renders)
    const contentRef = useRef<WizardHelpContent>({ title, description, icon, tips });
    contentRef.current = { title, description, icon, tips };

    const activate = useCallback(() => {
        setActiveHelp(contentRef.current);
    }, [setActiveHelp]);

    const deactivate = useCallback(() => {
        setActiveHelp(null);
    }, [setActiveHelp]);

    // On blur, check if focus moved to another element within this zone.
    // Uses relatedTarget (synchronous) instead of rAF + document.activeElement
    // to avoid a race condition where the deferred null overwrites a newly
    // activated zone's content.
    const handleBlurCapture = useCallback((e: React.FocusEvent) => {
        const relatedTarget = e.relatedTarget as Node | null;
        if (relatedTarget && wrapperRef.current?.contains(relatedTarget)) {
            return;
        }
        deactivate();
    }, [deactivate]);

    return (
        <div
            ref={wrapperRef}
            className={className}
            onMouseEnter={activate}
            onMouseLeave={deactivate}
            onFocusCapture={activate}
            onBlurCapture={handleBlurCapture}
        >
            {children}
        </div>
    );
}
