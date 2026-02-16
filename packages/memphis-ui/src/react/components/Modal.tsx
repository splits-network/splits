"use client";

import React, { useEffect, useRef, useCallback } from 'react';

export interface ModalProps {
    open: boolean;
    onClose: () => void;
    /** Simple title — renders a header with close button. For custom headers, use padding={false} and build your own. */
    title?: string;
    children: React.ReactNode;
    className?: string;
    maxWidth?: string;
    /** When true, clicking backdrop or pressing Escape will close the modal. Default: false */
    closeOnBackdrop?: boolean;
    /** When false, no padding wrapper — children control their own layout. Default: true */
    padding?: boolean;
}

/**
 * Memphis Modal
 *
 * Uses `.modal` + `.modal-box` CSS classes for styling and animation.
 * `.modal-open` toggles visibility. `.modal-action` for footer areas.
 *
 * For wizard modals, use padding={false} for full layout control.
 * Backdrop click/Escape are disabled by default (closeOnBackdrop={false}).
 * Set closeOnBackdrop={true} for simple modals that should dismiss on backdrop click.
 */
export function Modal({
    open,
    onClose,
    title,
    children,
    className = '',
    maxWidth = 'max-w-lg',
    closeOnBackdrop = false,
    padding = true,
}: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Handle Escape key
    useEffect(() => {
        if (!open || !closeOnBackdrop) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, closeOnBackdrop, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    // Handle backdrop click
    const handleBackdropClick = useCallback(() => {
        if (closeOnBackdrop) {
            onClose();
        }
    }, [closeOnBackdrop, onClose]);

    // When title is provided, always wrap in padding
    const usePadding = padding || !!title;

    return (
        <div
            ref={modalRef}
            className={[
                'modal',
                open ? 'modal-open' : '',
            ].filter(Boolean).join(' ')}
            role="dialog"
            aria-modal="true"
        >
            <div
                className={[
                    'modal-box',
                    'overflow-y-auto max-h-[90vh]',
                    maxWidth,
                    className,
                ].filter(Boolean).join(' ')}
            >
                {usePadding ? (
                    <div>
                        {title && (
                            <div className="flex items-center justify-between mb-6 pb-4 border-b-4 border-dark">
                                <h3 className="text-xl font-black uppercase tracking-wider text-dark">
                                    {title}
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="btn btn-sm btn-square btn-outline btn-dark"
                                    aria-label="Close"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="square"
                                    >
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                        )}
                        {children}
                    </div>
                ) : (
                    children
                )}
            </div>
            <div className="modal-backdrop" onClick={handleBackdropClick}>
                <button type="button" tabIndex={-1}>close</button>
            </div>
        </div>
    );
}
