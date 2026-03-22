"use client";

import { createContext, useContext, useState } from "react";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface WizardHelpContent {
    /** Field or section title */
    title: string;
    /** Contextual description of the field */
    description: string;
    /** FontAwesome icon class (optional) */
    icon?: string;
    /** Helpful tips displayed as a bulleted list */
    tips?: string[];
}

interface WizardHelpContextValue {
    activeHelp: WizardHelpContent | null;
    setActiveHelp: (content: WizardHelpContent | null) => void;
}

/* ─── Context ────────────────────────────────────────────────────────────── */

const WizardHelpContext = createContext<WizardHelpContextValue | null>(null);

/* ─── Provider ───────────────────────────────────────────────────────────── */

export function WizardHelpProvider({ children }: { children: React.ReactNode }) {
    const [activeHelp, setActiveHelp] = useState<WizardHelpContent | null>(null);

    return (
        <WizardHelpContext.Provider value={{ activeHelp, setActiveHelp }}>
            {children}
        </WizardHelpContext.Provider>
    );
}

/* ─── Hook ───────────────────────────────────────────────────────────────── */

export function useWizardHelp(): WizardHelpContextValue {
    const ctx = useContext(WizardHelpContext);
    if (!ctx) {
        // Return a no-op when used outside a provider (backward compat)
        return { activeHelp: null, setActiveHelp: () => {} };
    }
    return ctx;
}
