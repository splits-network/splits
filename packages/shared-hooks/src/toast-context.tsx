"use client";

import {
    createContext,
    useContext,
    type ReactNode,
} from "react";
import {
    BaselToastProvider,
    useBaselToast,
    type BaselToastType,
} from "@splits-network/basel-ui";

export type ToastType = BaselToastType;

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextValue {
    toasts: Toast[];
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    hideToast: (id: string) => void;
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

function ToastBridge({ children }: { children: ReactNode }) {
    const baselToast = useBaselToast();

    const value: ToastContextValue = {
        toasts: baselToast.toasts.map((t) => ({
            id: t.id,
            message: t.message,
            type: t.type,
            duration: t.duration,
        })),
        showToast: (message: string, type: ToastType = "info", duration?: number) => {
            baselToast.show({ message, type, duration });
        },
        hideToast: (id: string) => {
            baselToast.dismiss(id);
        },
        success: baselToast.success,
        error: baselToast.error,
        warning: baselToast.warning,
        info: baselToast.info,
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
        </ToastContext.Provider>
    );
}

export function ToastProvider({ children }: { children: ReactNode }) {
    return (
        <BaselToastProvider>
            <ToastBridge>{children}</ToastBridge>
        </BaselToastProvider>
    );
}

export function useToast(): ToastContextValue {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
