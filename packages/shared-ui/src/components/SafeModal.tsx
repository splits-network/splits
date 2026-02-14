import { ReactNode } from 'react';

export interface SafeModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    showBackdrop?: boolean;
}

/**
 * SafeModal - React 19 compatible modal component
 *
 * ✅ Fixes React 19 insertBefore errors by:
 * - Using conditional rendering instead of `open` attribute
 * - Adding `modal-open` class for DaisyUI styling
 * - Preventing DOM conflicts during animations
 *
 * @example
 * ```tsx
 * <SafeModal isOpen={showModal} onClose={() => setShowModal(false)}>
 *     <h3 className="font-bold text-lg">Modal Title</h3>
 *     <p>Modal content goes here</p>
 * </SafeModal>
 * ```
 */
export function SafeModal({
    isOpen,
    onClose,
    children,
    className = '',
    size = 'md',
    showBackdrop = true,
}: SafeModalProps) {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        full: 'max-w-full',
    };

    return (
        <dialog className="modal modal-open">
            <div className={`modal-box ${sizeClasses[size]} ${className}`}>
                {children}
            </div>
            {showBackdrop && (
                <form method="dialog" className="modal-backdrop">
                    <button onClick={onClose}>close</button>
                </form>
            )}
        </dialog>
    );
}

/**
 * SafeModalHeader - Styled modal header with optional close button
 */
export function SafeModalHeader({
    title,
    onClose,
    showCloseButton = true,
}: {
    title: string;
    onClose?: () => void;
    showCloseButton?: boolean;
}) {
    return (
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">{title}</h3>
            {showCloseButton && onClose && (
                <button
                    onClick={onClose}
                    className="btn btn-sm btn-circle btn-ghost"
                    aria-label="Close modal"
                >
                    <i className="fa-duotone fa-regular fa-xmark"></i>
                </button>
            )}
        </div>
    );
}

/**
 * SafeModalActions - Styled modal footer with action buttons
 */
export function SafeModalActions({ children }: { children: ReactNode }) {
    return <div className="modal-action">{children}</div>;
}
