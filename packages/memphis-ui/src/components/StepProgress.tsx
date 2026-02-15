import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX, ACCENT_TEXT } from '../utils/accent-cycle';

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
    /** Custom class name */
    className?: string;
}

/**
 * StepProgress - Multi-step progress indicator
 *
 * Memphis compliant step progress bar with numbered/icon nodes and connecting lines.
 * Completed steps show check icons, current step is filled, future steps are outlined.
 * Extracted from onboarding-six showcase.
 */
export function StepProgress({
    steps,
    currentStep,
    className = '',
}: StepProgressProps) {
    return (
        <div
            className={['flex items-center gap-1', className]
                .filter(Boolean)
                .join(' ')}
        >
            {steps.map((step, i) => {
                const hex = ACCENT_HEX[step.accent];
                const textHex = ACCENT_TEXT[step.accent];
                const isCompleted = i < currentStep;
                const isCurrent = i === currentStep;
                const isActive = i <= currentStep;

                return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="flex items-center w-full gap-1">
                            <div
                                className="w-8 h-8 flex items-center justify-center text-xs font-black flex-shrink-0 border-3 transition-all"
                                style={{
                                    backgroundColor: isActive ? hex : '#FFFFFF',
                                    borderColor: hex,
                                    color: isActive ? textHex : hex,
                                }}
                            >
                                {isCompleted ? (
                                    <i className="fa-solid fa-check text-xs" />
                                ) : (
                                    <i className={`${step.icon} text-xs`} />
                                )}
                            </div>
                            {i < steps.length - 1 && (
                                <div
                                    className="flex-1 h-1"
                                    style={{
                                        backgroundColor: isCompleted ? hex : '#E0E0E0',
                                    }}
                                />
                            )}
                        </div>
                        <span
                            className="text-[9px] font-bold uppercase tracking-wider hidden sm:block"
                            style={{ color: isActive ? '#1A1A2E' : '#999' }}
                        >
                            {step.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
