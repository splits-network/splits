import React, { useEffect, useRef } from 'react';

export interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    className?: string;
    maxWidth?: string;
}

/**
 * Memphis Modal
 *
 * Sharp corners, thick border, dark overlay.
 * Uses native <dialog> element for accessibility.
 */
export function Modal({
    open,
    onClose,
    title,
    children,
    className = '',
    maxWidth = 'max-w-lg',
}: ModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (open && !dialog.open) {
            dialog.showModal();
        } else if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            className={[
                'border-4 border-dark bg-white p-0',
                'backdrop:bg-dark/50',
                maxWidth,
                'w-full',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            onClose={onClose}
        >
            <div className="p-6">
                {title && (
                    <div className="flex items-center justify-between mb-6 pb-4 border-b-4 border-dark">
                        <h3 className="text-xl font-black uppercase tracking-wider text-dark">
                            {title}
                        </h3>
                        <button
                            onClick={onClose}
                            className="border-4 border-dark bg-white hover:bg-coral hover:text-white p-2 transition-colors font-bold text-dark leading-none"
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
        </dialog>
    );
}
