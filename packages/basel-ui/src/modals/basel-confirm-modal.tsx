"use client";

import { BaselModal } from "./basel-modal";
import { BaselModalHeader } from "./basel-modal-header";
import { BaselModalBody } from "./basel-modal-body";
import { BaselModalFooter } from "./basel-modal-footer";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface BaselConfirmModalProps {
    /** Whether the modal is currently visible */
    isOpen: boolean;
    /** Called when the user cancels or closes the modal */
    onClose: () => void;
    /** Called when the user confirms the action */
    onConfirm: () => void;
    /** Modal title (e.g. "Delete Job Listing") */
    title: string;
    /** Subtitle text (default: "Destructive Action") */
    subtitle?: string;
    /** FontAwesome icon class for the header (default: "fa-triangle-exclamation") */
    icon?: string;
    /** Description content explaining the consequences */
    children: React.ReactNode;
    /** Confirm button label (default: "Confirm") */
    confirmLabel?: string;
    /** Cancel button label (default: "Cancel") */
    cancelLabel?: string;
    /** DaisyUI button class for the confirm button (default: "btn-error") */
    confirmColor?: string;
    /** Whether the confirm action is in progress */
    confirming?: boolean;
    /** Loading text for the confirm button */
    confirmingLabel?: string;
    /** Maximum width class (default: "max-w-md") */
    maxWidth?: string;
    /** Additional className on the modal-box */
    className?: string;
    /** Ref forwarded to the modal-box div for GSAP animations */
    containerRef?: React.RefObject<HTMLDivElement | null>;
    /** Ref forwarded to the backdrop div for GSAP animations */
    backdropRef?: React.RefObject<HTMLDivElement | null>;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Basel confirm modal — pre-composed confirmation dialog for destructive
 * actions. Combines BaselModal + destructive header + body + footer with
 * cancel/confirm buttons.
 */
export function BaselConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    subtitle = "Destructive Action",
    icon = "fa-triangle-exclamation",
    children,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    confirmColor = "btn-error",
    confirming = false,
    confirmingLabel,
    maxWidth = "max-w-md",
    className,
    containerRef,
    backdropRef,
}: BaselConfirmModalProps) {
    return (
        <BaselModal
            isOpen={isOpen}
            onClose={onClose}
            maxWidth={maxWidth}
            className={className}
            containerRef={containerRef}
            backdropRef={backdropRef}
            closeOnBackdropClick={!confirming}
        >
            <BaselModalHeader
                title={title}
                subtitle={subtitle}
                icon={icon}
                iconColor="error"
                variant="destructive"
                onClose={onClose}
                closeDisabled={confirming}
            />
            <BaselModalBody>{children}</BaselModalBody>
            <BaselModalFooter>
                <button
                    onClick={onClose}
                    className="btn btn-ghost flex-1"
                    disabled={confirming}
                >
                    {cancelLabel}
                </button>
                <button
                    onClick={onConfirm}
                    className={`btn ${confirmColor} flex-1`}
                    disabled={confirming}
                >
                    {confirming ? (
                        <>
                            <span className="loading loading-spinner loading-sm" />
                            {confirmingLabel || confirmLabel}
                        </>
                    ) : (
                        <>
                            <i
                                className={`fa-duotone fa-regular ${icon}`}
                            />
                            {confirmLabel}
                        </>
                    )}
                </button>
            </BaselModalFooter>
        </BaselModal>
    );
}
