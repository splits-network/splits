"use client";

import { useWizardHelp } from "./wizard-help-context";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface WizardHelpPanelStep {
    label: string;
    description?: string;
}

export interface WizardHelpPanelProps {
    /** Wizard step definitions */
    steps: WizardHelpPanelStep[];
    /** Currently active step index (0-based) */
    currentStep: number;
    /** Called when user clicks a completed step */
    onStepClick?: (stepIndex: number) => void;
    /** DaisyUI accent color for active step indicator */
    accentColor?: string;
}

/* ─── Accent maps ────────────────────────────────────────────────────────── */

const ACCENT_BG: Record<string, string> = {
    primary: "bg-primary", secondary: "bg-secondary", accent: "bg-accent",
    info: "bg-info", success: "bg-success", warning: "bg-warning",
};

const ACCENT_TEXT: Record<string, string> = {
    primary: "text-primary-content", secondary: "text-secondary-content",
    accent: "text-accent-content", info: "text-info-content",
    success: "text-success-content", warning: "text-warning-content",
};

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Wizard help panel — sidebar with vertical step list and contextual help area.
 * Displays field-level help from WizardHelpContext when a field is hovered/focused,
 * falling back to the current step's description when idle.
 */
export function WizardHelpPanel({
    steps,
    currentStep,
    onStepClick,
    accentColor = "primary",
}: WizardHelpPanelProps) {
    const { activeHelp } = useWizardHelp();

    const totalSteps = steps.length;
    const completionPercent = Math.round(((currentStep + 1) / totalSteps) * 100);
    const activeBg = ACCENT_BG[accentColor] || "bg-primary";
    const activeText = ACCENT_TEXT[accentColor] || "text-primary-content";
    const fallbackDescription = steps[currentStep]?.description || "";

    return (
        <aside className="wizard-help-panel w-64 bg-base-200 border-r border-base-300 flex flex-col hidden lg:flex">
            {/* Step list */}
            <div className="p-5 flex-1">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-base-content/50 mb-4">
                    Steps
                </h4>
                <div className="space-y-1">
                    {steps.map((step, i) => {
                        const isCompleted = i < currentStep;
                        const isActive = i === currentStep;
                        const isFuture = i > currentStep;
                        const clickable = isCompleted && !!onStepClick;

                        return (
                            <button
                                key={i}
                                type="button"
                                onClick={() => clickable && onStepClick!(i)}
                                disabled={!clickable}
                                className={`flex items-center gap-3 w-full px-2 py-2 text-left transition-colors ${
                                    clickable ? "cursor-pointer hover:bg-base-300" : ""
                                } ${isFuture ? "opacity-40" : ""}`}
                            >
                                <span
                                    className={`w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 ${
                                        isCompleted
                                            ? "bg-success text-success-content"
                                            : isActive
                                              ? `${activeBg} ${activeText}`
                                              : "bg-base-300 text-base-content/40"
                                    }`}
                                >
                                    {isCompleted ? (
                                        <i className="fa-duotone fa-regular fa-check text-xs" />
                                    ) : (
                                        String(i + 1).padStart(2, "0")
                                    )}
                                </span>
                                <span
                                    className={`text-sm ${
                                        isActive
                                            ? "font-bold text-base-content"
                                            : isCompleted
                                              ? "font-semibold text-base-content"
                                              : "text-base-content/40"
                                    }`}
                                >
                                    {step.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Contextual help area */}
            <div className="border-t border-base-300 p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-base-content/50 mb-3">
                    {activeHelp ? "Field Guide" : "About This Step"}
                </p>

                {activeHelp ? (
                    <div className="animate-in fade-in duration-200">
                        {activeHelp.icon && (
                            <i className={`fa-duotone fa-regular ${activeHelp.icon} text-primary text-lg mb-2 block`} />
                        )}
                        <h5 className="font-black text-sm text-base-content">
                            {activeHelp.title}
                        </h5>
                        <p className="text-sm text-base-content/70 mt-1">
                            {activeHelp.description}
                        </p>
                        {activeHelp.tips && activeHelp.tips.length > 0 && (
                            <ul className="mt-3 space-y-2">
                                {activeHelp.tips.map((tip, i) => (
                                    <li key={i} className="text-xs text-base-content/60 flex gap-2">
                                        <i className="fa-duotone fa-regular fa-lightbulb text-warning mt-0.5 shrink-0" />
                                        <span>{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ) : fallbackDescription ? (
                    <p className="text-sm text-base-content/70">
                        {fallbackDescription}
                    </p>
                ) : null}
            </div>

            {/* Progress bar */}
            <div className="px-5 pb-5">
                <div className="flex justify-between text-xs text-base-content/50 mb-1">
                    <span>Completion</span>
                    <span>{completionPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-base-300">
                    <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${completionPercent}%` }}
                    />
                </div>
            </div>
        </aside>
    );
}
