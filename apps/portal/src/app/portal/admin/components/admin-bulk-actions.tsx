"use client";

import { ReactNode } from "react";

interface AdminBulkActionsProps {
    selectedCount: number;
    onClear: () => void;
    children: ReactNode;
    className?: string;
}

export function AdminBulkActions({
    selectedCount,
    onClear,
    children,
    className = "",
}: AdminBulkActionsProps) {
    if (selectedCount === 0) return null;

    return (
        <div
            className={`sticky top-0 z-20 bg-primary/10 border border-primary/20 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 ${className}`}
        >
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <i className="fa-duotone fa-regular fa-check-double text-primary"></i>
                </div>
                <span className="font-medium text-primary">
                    {selectedCount} item{selectedCount !== 1 ? "s" : ""}{" "}
                    selected
                </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                {children}
                <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={onClear}
                >
                    <i className="fa-duotone fa-regular fa-xmark"></i>
                    Clear
                </button>
            </div>
        </div>
    );
}

interface BulkActionButtonProps {
    onClick: () => void;
    icon: string;
    label: string;
    variant?:
        | "primary"
        | "secondary"
        | "accent"
        | "success"
        | "warning"
        | "error"
        | "ghost";
    loading?: boolean;
    disabled?: boolean;
}

export function BulkActionButton({
    onClick,
    icon,
    label,
    variant = "primary",
    loading = false,
    disabled = false,
}: BulkActionButtonProps) {
    const variantClass = variant === "ghost" ? "btn-ghost" : `btn-${variant}`;

    return (
        <button
            type="button"
            className={`btn btn-sm ${variantClass}`}
            onClick={onClick}
            disabled={disabled || loading}
        >
            {loading ? (
                <span className="loading loading-spinner loading-xs"></span>
            ) : (
                <i className={`fa-duotone fa-regular ${icon}`}></i>
            )}
            {label}
        </button>
    );
}
