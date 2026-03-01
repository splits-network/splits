"use client";

import { useState, useEffect, useRef } from "react";
import { BaselModal } from "./basel-modal";
import { BaselModalHeader } from "./basel-modal-header";
import { BaselModalBody } from "./basel-modal-body";
import { BaselModalFooter } from "./basel-modal-footer";

/* ── Types ───────────────────────────────────────────────────────────────── */

export interface BaselPromptModalProps {
    /** Whether the modal is currently visible */
    isOpen: boolean;
    /** Called when the user cancels or closes the modal */
    onClose: () => void;
    /** Called when the user submits (receives the input value) */
    onSubmit: (value: string) => void;
    /** Modal title (e.g. "Rejection Reason") */
    title: string;
    /** Subtitle text (default: "Input Required") */
    subtitle?: string;
    /** FontAwesome icon class for the header (default: "fa-keyboard") */
    icon?: string;
    /** DaisyUI semantic color for the icon (default: "primary") */
    iconColor?: "primary" | "secondary" | "accent" | "neutral" | "info" | "success" | "warning" | "error";
    /** Label text above the input */
    label?: string;
    /** Placeholder text for the input */
    placeholder?: string;
    /** Default value pre-filled in the input */
    defaultValue?: string;
    /** Whether the input is required (disables submit when empty, default: true) */
    required?: boolean;
    /** Use textarea instead of single-line input (default: false) */
    multiline?: boolean;
    /** Submit button label (default: "Submit") */
    submitLabel?: string;
    /** Cancel button label (default: "Cancel") */
    cancelLabel?: string;
    /** DaisyUI button class for the submit button (default: "btn-primary") */
    submitColor?: string;
    /** Whether the submit action is in progress */
    submitting?: boolean;
    /** Loading text for the submit button */
    submittingLabel?: string;
    /** Maximum width class (default: "max-w-md") */
    maxWidth?: string;
    /** Additional className on the modal-box */
    className?: string;
    /** Ref forwarded to the modal-box div for GSAP animations */
    containerRef?: React.RefObject<HTMLDivElement | null>;
    /** Ref forwarded to the backdrop div for GSAP animations */
    backdropRef?: React.RefObject<HTMLDivElement | null>;
}

/* ── Component ───────────────────────────────────────────────────────────── */

/**
 * Basel prompt modal — pre-composed input dialog for collecting a single
 * text value from the user. Replaces native `window.prompt()` with a
 * proper Basel-styled modal.
 */
export function BaselPromptModal({
    isOpen,
    onClose,
    onSubmit,
    title,
    subtitle = "Input Required",
    icon = "fa-keyboard",
    iconColor = "primary",
    label,
    placeholder,
    defaultValue = "",
    required = true,
    multiline = false,
    submitLabel = "Submit",
    cancelLabel = "Cancel",
    submitColor = "btn-primary",
    submitting = false,
    submittingLabel,
    maxWidth = "max-w-md",
    className,
    containerRef,
    backdropRef,
}: BaselPromptModalProps) {
    const [value, setValue] = useState(defaultValue);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    // Reset value when modal opens
    useEffect(() => {
        if (isOpen) {
            setValue(defaultValue);
            // Auto-focus the input after a tick (modal needs to render first)
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen, defaultValue]);

    const canSubmit = !submitting && (!required || value.trim().length > 0);

    const handleSubmit = () => {
        if (!canSubmit) return;
        onSubmit(value.trim());
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !multiline && canSubmit) {
            e.preventDefault();
            handleSubmit();
        }
    };

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
            <BaselModalHeader
                title={title}
                subtitle={subtitle}
                icon={icon}
                iconColor={iconColor}
                onClose={onClose}
                closeDisabled={submitting}
            />
            <BaselModalBody>
                {label && (
                    <label className="label text-sm font-semibold text-base-content mb-2">
                        {label}
                    </label>
                )}
                {multiline ? (
                    <textarea
                        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                        className="textarea textarea-bordered w-full min-h-24 text-sm"
                        style={{ borderRadius: 0 }}
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        disabled={submitting}
                    />
                ) : (
                    <input
                        ref={inputRef as React.RefObject<HTMLInputElement>}
                        type="text"
                        className="input input-bordered w-full text-sm"
                        style={{ borderRadius: 0 }}
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={submitting}
                    />
                )}
            </BaselModalBody>
            <BaselModalFooter>
                <button
                    onClick={onClose}
                    className="btn btn-ghost flex-1"
                    disabled={submitting}
                >
                    {cancelLabel}
                </button>
                <button
                    onClick={handleSubmit}
                    className={`btn ${submitColor} flex-1`}
                    disabled={!canSubmit}
                >
                    {submitting ? (
                        <>
                            <span className="loading loading-spinner loading-sm" />
                            {submittingLabel || submitLabel}
                        </>
                    ) : (
                        submitLabel
                    )}
                </button>
            </BaselModalFooter>
        </BaselModal>
    );
}
