"use client";

import { useRef } from "react";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface BaselProgressStep {
    /** Step number label (e.g. "01") */
    num: string;
    /** Step name */
    label: string;
}

export interface BaselProgressSidebarProps {
    /** Array of step definitions */
    steps: BaselProgressStep[];
    /** Currently active step index (0-based) */
    currentStep: number;
    /** Additional className on the container */
    className?: string;
    /** Ref forwarded to the container for GSAP targeting */
    containerRef?: React.RefObject<HTMLDivElement | null>;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Basel progress sidebar — step checklist with completion states and a
 * progress bar with percentage. Typically placed alongside a multi-step form.
 *
 * Includes a `border-t-4 border-primary` top accent per Basel editorial style.
 */
export function BaselProgressSidebar({
    steps,
    currentStep,
    className,
    containerRef: externalRef,
}: BaselProgressSidebarProps) {
    const internalRef = useRef<HTMLDivElement>(null);
    const ref = externalRef || internalRef;

    const totalSteps = steps.length;
    const completionPercent = Math.round(((currentStep + 1) / totalSteps) * 100);

    return (
        <div
            ref={ref}
            className={`bg-base-200 border-t-4 border-primary p-6 ${className || ""}`}
        >
            <h3 className="text-sm font-black uppercase tracking-wider mb-4">
                Progress
            </h3>

            {/* Step list */}
            <div className="space-y-3">
                {steps.map((step, i) => (
                    <div key={step.num} className="flex items-center gap-3">
                        <div
                            className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold ${
                                i < currentStep
                                    ? "bg-success text-success-content"
                                    : i === currentStep
                                      ? "bg-primary text-primary-content"
                                      : "bg-base-300 text-base-content/30"
                            }`}
                        >
                            {i < currentStep ? (
                                <i className="fa-solid fa-check" />
                            ) : (
                                step.num
                            )}
                        </div>
                        <span
                            className={`text-sm ${
                                i <= currentStep
                                    ? "font-semibold text-base-content"
                                    : "text-base-content/40"
                            }`}
                        >
                            {step.label}
                        </span>
                    </div>
                ))}
            </div>

            {/* Progress bar */}
            <div className="mt-4 pt-4 border-t border-base-300">
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
        </div>
    );
}
