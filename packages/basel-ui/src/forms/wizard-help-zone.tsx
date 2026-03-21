"use client";

import { useCallback } from "react";
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
 * Help content is "sticky" — it stays visible until another zone is
 * activated via hover (mouseenter) or keyboard focus (focusCapture).
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

    const activate = useCallback(() => {
        // Spread into a fresh object so React sees a new reference and re-renders
        setActiveHelp({ title, description, icon, tips });
    }, [setActiveHelp, title, description, icon, tips]);

    return (
        <div
            className={className}
            onMouseEnter={activate}
            onFocusCapture={activate}
        >
            {children}
        </div>
    );
}
