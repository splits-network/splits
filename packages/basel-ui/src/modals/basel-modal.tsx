"use client";

import { useRef, useEffect, useCallback } from "react";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface BaselModalProps {
    /** Whether the modal is currently visible */
    isOpen: boolean;
    /** Called when the user requests to close the modal (backdrop click, Escape) */
    onClose: () => void;
    /** Maximum width class for the modal box (default: "max-w-2xl") */
    maxWidth?: string;
    /** Modal content (typically BaselModalHeader + BaselModalBody + BaselModalFooter) */
    children: React.ReactNode;
    /** Ref forwarded to the modal-box div for GSAP entrance/exit animations */
    containerRef?: React.RefObject<HTMLDivElement | null>;
    /** Ref forwarded to the backdrop div for GSAP backdrop fade */
    backdropRef?: React.RefObject<HTMLDivElement | null>;
    /** Whether clicking the backdrop should close the modal (default: true) */
    closeOnBackdropClick?: boolean;
    /** Whether the modal content should scroll when exceeding viewport height (default: true) */
    scrollable?: boolean;
    /** Additional className on the modal-box div */
    className?: string;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Basel modal — base wrapper providing the dialog backdrop and modal-box shell.
 * Compose with BaselModalHeader, BaselModalBody, and BaselModalFooter for
 * full modal layouts. Exposes refs for GSAP animation targeting.
 *
 * CSS hooks: `.modal-backdrop` (backdrop element), `.modal-box` (box element)
 */
export function BaselModal({
    isOpen,
    onClose,
    maxWidth = "max-w-2xl",
    children,
    containerRef: externalContainerRef,
    backdropRef: externalBackdropRef,
    closeOnBackdropClick = true,
    scrollable = true,
    className,
}: BaselModalProps) {
    const internalContainerRef = useRef<HTMLDivElement>(null);
    const internalBackdropRef = useRef<HTMLDivElement>(null);
    const containerRef = externalContainerRef || internalContainerRef;
    const backdropRef = externalBackdropRef || internalBackdropRef;

    const handleEscape = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        },
        [onClose],
    );

    useEffect(() => {
        if (!isOpen) return;
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, handleEscape]);

    if (!isOpen) return null;

    return (
        <div className="modal modal-open" role="dialog">
            {/* Backdrop — separate div for GSAP targeting */}
            <div
                ref={backdropRef}
                className="modal-backdrop bg-neutral/60"
                onClick={closeOnBackdropClick ? onClose : undefined}
            />
            {/* Modal box */}
            <div
                ref={containerRef}
                className={`modal-box ${maxWidth} bg-base-100 p-0 overflow-hidden ${
                    scrollable ? "max-h-[90vh] flex flex-col" : ""
                } ${className || ""}`}
                style={{ borderRadius: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}
