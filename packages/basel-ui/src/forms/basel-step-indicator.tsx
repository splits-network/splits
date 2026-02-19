"use client";

import { useRef, useCallback } from "react";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface BaselStepDef {
    /** Step number label (e.g. "01") */
    num: string;
    /** Step name displayed next to the number */
    label: string;
    /** FontAwesome icon class (optional, not currently rendered but reserved) */
    icon?: string;
}

export interface BaselStepIndicatorProps {
    /** Array of step definitions */
    steps: BaselStepDef[];
    /** Currently active step index (0-based) */
    currentStep: number;
    /** Called when the user clicks a completed step to navigate back (optional) */
    onStepClick?: (stepIndex: number) => void;
    /** Additional className on the container */
    className?: string;
    /** Ref forwarded to the container for GSAP targeting */
    containerRef?: React.RefObject<HTMLElement | null>;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Basel step indicator — horizontal step navigation bar with numbered/checked
 * squares. Completed steps show a green check and are clickable. Current step
 * is highlighted with primary color. Future steps are dimmed.
 *
 * CSS hook: `.step-ind` (each step button)
 */
export function BaselStepIndicator({
    steps,
    currentStep,
    onStepClick,
    className,
    containerRef: externalRef,
}: BaselStepIndicatorProps) {
    const internalRef = useRef<HTMLElement>(null);
    const ref = externalRef || internalRef;

    const handleClick = useCallback(
        (index: number) => {
            if (index < currentStep && onStepClick) {
                onStepClick(index);
            }
        },
        [currentStep, onStepClick],
    );

    return (
        <section
            ref={ref}
            className={`bg-base-200 border-b border-base-300 ${className || ""}`}
        >
            <div className="container mx-auto px-6 lg:px-12">
                <div className="flex overflow-x-auto">
                    {steps.map((step, i) => (
                        <button
                            key={step.num}
                            type="button"
                            onClick={() => handleClick(i)}
                            className={`step-ind flex items-center gap-3 px-6 py-4 border-b-2 transition-all text-sm font-semibold whitespace-nowrap ${
                                i === currentStep
                                    ? "border-primary text-primary"
                                    : i < currentStep
                                      ? "border-success text-success cursor-pointer"
                                      : "border-transparent text-base-content/30"
                            }`}
                            disabled={i > currentStep}
                        >
                            <span
                                className={`w-7 h-7 flex items-center justify-center text-xs font-bold ${
                                    i === currentStep
                                        ? "bg-primary text-primary-content"
                                        : i < currentStep
                                          ? "bg-success text-success-content"
                                          : "bg-base-300 text-base-content/40"
                                }`}
                            >
                                {i < currentStep ? (
                                    <i className="fa-duotone fa-regular fa-check text-[10px]" />
                                ) : (
                                    step.num
                                )}
                            </span>
                            <span className="hidden sm:inline">
                                {step.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
