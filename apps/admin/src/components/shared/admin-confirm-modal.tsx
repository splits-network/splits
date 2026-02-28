'use client';

import { useEffect, useRef } from 'react';

type ConfirmVariant = 'error' | 'warning' | 'primary';

type AdminConfirmModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    confirmVariant?: ConfirmVariant;
    loading?: boolean;
};

const VARIANT_BUTTON: Record<ConfirmVariant, string> = {
    error: 'btn-error',
    warning: 'btn-warning',
    primary: 'btn-primary',
};

export function AdminConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirm',
    confirmVariant = 'primary',
    loading = false,
}: AdminConfirmModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (isOpen) {
            dialog.showModal();
        } else {
            dialog.close();
        }
    }, [isOpen]);

    return (
        <dialog ref={dialogRef} className="modal" onClose={onClose}>
            <div className="modal-box">
                <h3 className="font-black text-lg">{title}</h3>
                <p className="py-4 text-sm text-base-content/70">{message}</p>
                <div className="modal-action">
                    <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className={`btn btn-sm ${VARIANT_BUTTON[confirmVariant]}`}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading && <span className="loading loading-spinner loading-xs" />}
                        {confirmLabel}
                    </button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button type="submit">close</button>
            </form>
        </dialog>
    );
}
