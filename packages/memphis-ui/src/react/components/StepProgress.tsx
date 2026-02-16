import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export interface Step {
    /** Step label */
    label: string;
    /** FontAwesome icon class */
    icon: string;
    /** Accent color for this step */
    accent: AccentColor;
}

export interface StepProgressProps {
    /** Steps to display */
    steps: Step[];
    /** Current step index (0-based) */
    currentStep: number;
    /** When true, all steps appear completed (teal with checks). Default: false */
    completed?: boolean;
    /** Custom class name */
    className?: string;
}

/** Maps AccentColor to CSS variable references for --step-bg and --step-fg */
const STEP_VARS: Record<AccentColor, { bg: string; fg: string }> = {
    coral: { bg: 'var(--color-coral)', fg: 'var(--color-neutral-content)' },
    teal: { bg: 'var(--color-teal)', fg: 'var(--color-base-content)' },
    yellow: { bg: 'var(--color-yellow)', fg: 'var(--color-base-content)' },
    purple: { bg: 'var(--color-purple)', fg: 'var(--color-neutral-content)' },
};

/**
 * StepProgress - Multi-step progress indicator
 *
 * Uses the .steps / .step / .step-icon CSS classes from steps.css.
 * Per-step accent colors are applied via inline CSS variable overrides
 * (--step-bg, --step-fg, --step-border, --step-line).
 *
 * Completed steps show check icons, current step is filled, future steps are outlined.
 * When completed=true, all steps render as teal with check icons.
 */
export function StepProgress({
    steps,
    currentStep,
    completed = false,
    className = '',
}: StepProgressProps) {
    return (
        <ul
            className={['steps steps-horizontal w-full', className]
                .filter(Boolean)
                .join(' ')}
        >
            {steps.map((step, i) => {
                const isCompleted = completed || i < currentStep;
                const isActive = completed || i <= currentStep;
                const vars = STEP_VARS[step.accent];
                const accentBg = completed ? 'var(--color-teal)' : vars.bg;
                const accentFg = completed ? 'var(--color-neutral-content)' : vars.fg;

                const style: React.CSSProperties = isActive
                    ? ({
                          '--step-bg': accentBg,
                          '--step-fg': accentFg,
                          '--step-border': accentBg,
                          '--step-line': accentBg,
                      } as React.CSSProperties)
                    : ({
                          '--step-bg': 'var(--color-cream)',
                          '--step-fg': vars.bg,
                          '--step-border': vars.bg,
                          '--step-line': 'var(--color-base-300)',
                      } as React.CSSProperties);

                return (
                    <li key={i} className="step" style={style}>
                        <span className="step-icon">
                            {isCompleted ? (
                                <i className="fa-solid fa-check" />
                            ) : (
                                <i className={step.icon} />
                            )}
                        </span>
                        <span className="hidden sm:block">{step.label}</span>
                    </li>
                );
            })}
        </ul>
    );
}
