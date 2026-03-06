'use client';

import React, { createContext, useCallback, useState } from 'react';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export type Toast = {
    id: string;
    message: string;
    variant: ToastVariant;
};

export type ToastContextValue = {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    warning: (message: string) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_CLASSES: Record<ToastVariant, string> = {
    success: 'alert-success',
    error: 'alert-error',
    info: 'alert-info',
    warning: 'alert-warning',
};

const VARIANT_ICONS: Record<ToastVariant, string> = {
    success: 'fa-circle-check',
    error: 'fa-circle-xmark',
    info: 'fa-circle-info',
    warning: 'fa-triangle-exclamation',
};

const MAX_TOASTS = 5;
const DISMISS_DELAY_MS = 5000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, variant: ToastVariant) => {
        const id = `${Date.now()}-${Math.random()}`;
        setToasts((prev) => {
            const next = [...prev, { id, message, variant }];
            return next.slice(-MAX_TOASTS);
        });
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, DISMISS_DELAY_MS);
    }, []);

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const ctx: ToastContextValue = {
        success: (msg) => addToast(msg, 'success'),
        error: (msg) => addToast(msg, 'error'),
        info: (msg) => addToast(msg, 'info'),
        warning: (msg) => addToast(msg, 'warning'),
    };

    return (
        <ToastContext.Provider value={ctx}>
            {children}
            {toasts.length > 0 && (
                <div className="toast toast-end toast-bottom">
                    {toasts.map((toast) => (
                        <div
                            key={toast.id}
                            className={`alert ${VARIANT_CLASSES[toast.variant]} shadow-lg max-w-sm`}
                        >
                            <i className={`fa-duotone fa-regular ${VARIANT_ICONS[toast.variant]} flex-shrink-0`} />
                            <span className="text-sm flex-1">{toast.message}</span>
                            <button
                                type="button"
                                onClick={() => dismiss(toast.id)}
                                className="btn btn-ghost btn-xs"
                                aria-label="Dismiss"
                            >
                                <i className="fa-duotone fa-regular fa-xmark" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </ToastContext.Provider>
    );
}
