"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    type ReactNode,
} from "react";
import { BaselToastItem, type BaselToastData, type BaselToastType, type BaselToastAction } from "./basel-toast-item";

const MAX_VISIBLE_TOASTS = 3;
const DEFAULT_DURATION = 5000;

export interface BaselToastOptions {
    message: string;
    type?: BaselToastType;
    duration?: number;
    action?: BaselToastAction;
}

interface BaselToastContextValue {
    show: (options: BaselToastOptions) => void;
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
    dismiss: (id: string) => void;
    toasts: BaselToastData[];
}

const BaselToastContext = createContext<BaselToastContextValue | undefined>(undefined);

let toastCounter = 0;

function generateToastId(): string {
    toastCounter += 1;
    return `basel-toast-${toastCounter}-${Date.now()}`;
}

export function BaselToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<BaselToastData[]>([]);

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const show = useCallback((options: BaselToastOptions) => {
        const newToast: BaselToastData = {
            id: generateToastId(),
            message: options.message,
            type: options.type ?? "info",
            duration: options.duration ?? DEFAULT_DURATION,
            action: options.action,
        };

        setToasts((prev) => {
            const next = [...prev, newToast];
            // Enforce max visible toasts by removing oldest
            if (next.length > MAX_VISIBLE_TOASTS) {
                return next.slice(next.length - MAX_VISIBLE_TOASTS);
            }
            return next;
        });
    }, []);

    const success = useCallback(
        (message: string, duration?: number) => show({ message, type: "success", duration }),
        [show],
    );

    const error = useCallback(
        (message: string, duration?: number) => show({ message, type: "error", duration }),
        [show],
    );

    const warning = useCallback(
        (message: string, duration?: number) => show({ message, type: "warning", duration }),
        [show],
    );

    const info = useCallback(
        (message: string, duration?: number) => show({ message, type: "info", duration }),
        [show],
    );

    return (
        <BaselToastContext.Provider
            value={{ show, success, error, warning, info, dismiss, toasts }}
        >
            {children}
            <BaselToastContainer toasts={toasts} onDismiss={dismiss} />
        </BaselToastContext.Provider>
    );
}

export function useBaselToast(): BaselToastContextValue {
    const context = useContext(BaselToastContext);
    if (!context) {
        throw new Error("useBaselToast must be used within a BaselToastProvider");
    }
    return context;
}

function BaselToastContainer({
    toasts,
    onDismiss,
}: {
    toasts: BaselToastData[];
    onDismiss: (id: string) => void;
}) {
    if (toasts.length === 0) return null;

    return (
        <div className="toast toast-top toast-end z-[100] gap-2">
            {toasts.map((toast) => (
                <BaselToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
            ))}
        </div>
    );
}
