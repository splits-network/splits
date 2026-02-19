"use client";

import { BaselModal } from "./basel-modal";
import { BaselModalHeader } from "./basel-modal-header";
import { BaselModalBody } from "./basel-modal-body";
import { BaselModalFooter } from "./basel-modal-footer";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface BaselWizardStep {
    /** Step label displayed in the progress bar and subtitle */
    label: string;
}

export interface BaselWizardModalProps {
    /** Whether the modal is currently visible */
    isOpen: boolean;
    /** Called when the user requests to close the modal */
    onClose: () => void;
    /** Modal title */
    title: string;
    /** FontAwesome icon class for the header icon */
    icon?: string;
    /** DaisyUI semantic color for the icon container and progress bar (default: "primary") */
    accentColor?:
        | "primary"
        | "secondary"
        | "accent"
        | "info"
        | "success"
        | "warning";
    /** Array of wizard step definitions */
    steps: BaselWizardStep[];
    /** Currently active step index (0-based) — controlled by the consumer */
    currentStep: number;
    /** Called when the user clicks Next */
    onNext?: () => void;
    /** Called when the user clicks Back */
    onBack?: () => void;
    /** Called when the user clicks Submit on the last step */
    onSubmit?: () => void;
    /** Whether the submit/next action is in progress */
    submitting?: boolean;
    /** Whether the Next button should be disabled (for step validation) */
    nextDisabled?: boolean;
    /** Label for the Next button (default: "Next") */
    nextLabel?: string;
    /** Label for the Back button (default: "Back") */
    backLabel?: string;
    /** Label for the Submit button on the final step (default: "Submit") */
    submitLabel?: string;
    /** Loading text for the Submit button */
    submittingLabel?: string;
    /** Cancel button label (default: "Cancel") */
    cancelLabel?: string;
    /** Step content for the current step */
    children: React.ReactNode;
    /** Maximum width class (default: "max-w-2xl") */
    maxWidth?: string;
    /** Additional className */
    className?: string;
    /** Ref forwarded to the modal-box div */
    containerRef?: React.RefObject<HTMLDivElement | null>;
    /** Ref forwarded to the backdrop div */
    backdropRef?: React.RefObject<HTMLDivElement | null>;
    /** Ref forwarded to the step content container for GSAP step transitions */
    stepContentRef?: React.RefObject<HTMLDivElement | null>;
    /** Optional custom footer content — overrides default back/next/submit buttons */
    footer?: React.ReactNode;
}

/* ─── Constants ──────────────────────────────────────────────────────────── */

const ACCENT_BG_MAP: Record<string, string> = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    accent: "bg-accent",
    info: "bg-info",
    success: "bg-success",
    warning: "bg-warning",
};

const ACCENT_BTN_MAP: Record<string, string> = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    accent: "btn-accent",
    info: "btn-info",
    success: "btn-success",
    warning: "btn-warning",
};

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Basel wizard modal — multi-step modal with segmented progress bar, controlled
 * step navigation, and back/next/submit footer. Step state is controlled by the
 * consumer for maximum flexibility over validation and async operations.
 *
 * CSS hooks: `.wizard-progress`, `.wizard-progress-segment`, `.wizard-step-content`
 */
export function BaselWizardModal({
    isOpen,
    onClose,
    title,
    icon,
    accentColor = "primary",
    steps,
    currentStep,
    onNext,
    onBack,
    onSubmit,
    submitting = false,
    nextDisabled = false,
    nextLabel = "Next",
    backLabel = "Back",
    submitLabel = "Submit",
    submittingLabel,
    cancelLabel = "Cancel",
    children,
    maxWidth = "max-w-2xl",
    className,
    containerRef,
    backdropRef,
    stepContentRef,
    footer,
}: BaselWizardModalProps) {
    const isLastStep = currentStep >= steps.length - 1;
    const isFirstStep = currentStep === 0;
    const activeBg = ACCENT_BG_MAP[accentColor] || "bg-primary";

    return (
        <BaselModal
            isOpen={isOpen}
            onClose={onClose}
            maxWidth={maxWidth}
            className={className}
            containerRef={containerRef}
            backdropRef={backdropRef}
            closeOnBackdropClick={!submitting}
        >
            {/* Header with progress bar */}
            <BaselModalHeader
                title={title}
                subtitle={`Step ${currentStep + 1} of ${steps.length} \u2014 ${steps[currentStep]?.label || ""}`}
                icon={icon}
                iconColor={accentColor}
                onClose={onClose}
                closeDisabled={submitting}
            >
                {/* Progress bar segments */}
                <div className="wizard-progress flex gap-2 mt-5">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`wizard-progress-segment h-1 flex-1 transition-colors duration-300 ${
                                i <= currentStep
                                    ? activeBg
                                    : "bg-neutral-content/20"
                            }`}
                        />
                    ))}
                </div>
            </BaselModalHeader>

            {/* Step content */}
            <BaselModalBody>
                <div
                    ref={stepContentRef}
                    className="wizard-step-content min-h-[280px]"
                >
                    {children}
                </div>
            </BaselModalBody>

            {/* Footer navigation */}
            <BaselModalFooter align="between">
                {footer || (
                    <>
                        <div>
                            {!isFirstStep && (
                                <button
                                    onClick={onBack}
                                    className="btn btn-ghost"
                                    disabled={submitting}
                                >
                                    <i className="fa-duotone fa-regular fa-arrow-left" />
                                    {backLabel}
                                </button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="btn btn-ghost"
                                disabled={submitting}
                            >
                                {cancelLabel}
                            </button>
                            {!isLastStep ? (
                                <button
                                    onClick={onNext}
                                    className={`btn ${ACCENT_BTN_MAP[accentColor]}`}
                                    disabled={nextDisabled || submitting}
                                >
                                    {nextLabel}
                                    <i className="fa-duotone fa-regular fa-arrow-right" />
                                </button>
                            ) : (
                                <button
                                    onClick={onSubmit}
                                    className="btn btn-primary"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm" />
                                            {submittingLabel || submitLabel}
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-duotone fa-regular fa-paper-plane" />
                                            {submitLabel}
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </BaselModalFooter>
        </BaselModal>
    );
}
