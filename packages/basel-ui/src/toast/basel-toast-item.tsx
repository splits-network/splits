"use client";

import { useEffect, useState } from "react";

export type BaselToastType = "success" | "error" | "warning" | "info";

export interface BaselToastAction {
    label: string;
    onClick: () => void;
}

export interface BaselToastData {
    id: string;
    message: string;
    type: BaselToastType;
    duration: number;
    action?: BaselToastAction;
}

interface BaselToastItemProps {
    toast: BaselToastData;
    onDismiss: (id: string) => void;
}

const ICON_MAP: Record<BaselToastType, string> = {
    success: "fa-duotone fa-regular fa-circle-check",
    error: "fa-duotone fa-regular fa-circle-exclamation",
    warning: "fa-duotone fa-regular fa-triangle-exclamation",
    info: "fa-duotone fa-regular fa-circle-info",
};

const COLOR_MAP: Record<BaselToastType, { border: string; iconBg: string; iconText: string; progress: string }> = {
    success: {
        border: "border-l-success",
        iconBg: "bg-success/10",
        iconText: "text-success",
        progress: "bg-success",
    },
    error: {
        border: "border-l-error",
        iconBg: "bg-error/10",
        iconText: "text-error",
        progress: "bg-error",
    },
    warning: {
        border: "border-l-warning",
        iconBg: "bg-warning/10",
        iconText: "text-warning",
        progress: "bg-warning",
    },
    info: {
        border: "border-l-info",
        iconBg: "bg-info/10",
        iconText: "text-info",
        progress: "bg-info",
    },
};

export function BaselToastItem({ toast, onDismiss }: BaselToastItemProps) {
    const [exiting, setExiting] = useState(false);
    const colors = COLOR_MAP[toast.type];

    const handleDismiss = () => {
        setExiting(true);
        setTimeout(() => onDismiss(toast.id), 200);
    };

    useEffect(() => {
        if (toast.duration <= 0) return;

        const timer = setTimeout(() => {
            handleDismiss();
        }, toast.duration);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toast.id, toast.duration]);

    return (
        <div
            className={`relative flex items-center gap-3 border-l-4 ${colors.border} bg-base-100 shadow-lg p-3 w-full sm:w-96`}
            style={{
                animation: exiting
                    ? "toast-exit 200ms ease-in forwards"
                    : "toast-enter 300ms ease-out forwards",
            }}
            role="alert"
        >
            {/* Icon pill */}
            <div
                className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${colors.iconBg}`}
            >
                <i className={`${ICON_MAP[toast.type]} ${colors.iconText}`} />
            </div>

            {/* Message */}
            <span className="flex-1 text-sm font-semibold text-base-content">
                {toast.message}
            </span>

            {/* Action button */}
            {toast.action && (
                <button
                    onClick={toast.action.onClick}
                    className="text-sm font-semibold text-primary hover:underline flex-shrink-0"
                >
                    {toast.action.label}
                </button>
            )}

            {/* Dismiss button */}
            <button
                onClick={handleDismiss}
                className="btn btn-ghost btn-xs btn-square flex-shrink-0"
                aria-label="Dismiss notification"
            >
                <i className="fa-duotone fa-regular fa-xmark" />
            </button>

            {/* Progress bar */}
            {toast.duration > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden">
                    <div
                        className={`h-full ${colors.progress}`}
                        style={{
                            animation: `toast-progress ${toast.duration}ms linear forwards`,
                        }}
                    />
                </div>
            )}
        </div>
    );
}
