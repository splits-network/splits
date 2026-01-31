/**
 * BrowseDetailPanel - Generic detail panel wrapper
 * Provides consistent loading, error, and empty states
 */

"use client";

import { ReactNode } from "react";
import type { BrowseDetailProps } from "./types";

export function BrowseDetailPanel({
    id,
    onClose,
    children,
    loading = false,
    error = null,
    emptyIcon = "fa-inbox",
    emptyMessage = "Select an item to view details",
}: BrowseDetailProps) {
    // Empty state when no ID
    if (!id) {
        return (
            <div className="hidden md:flex flex-1 items-center justify-center text-base-content/30 bg-base-100">
                <div className="text-center">
                    <i
                        className={`fa-duotone ${emptyIcon} text-6xl mb-4 opacity-50`}
                    />
                    <p className="text-lg">{emptyMessage}</p>
                </div>
            </div>
        );
    }

    // Loading state
    if (loading) {
        return (
            <div className="flex-1 flex flex-col bg-base-100">
                {/* Header skeleton */}
                <div className="h-20 border-b border-base-300 animate-pulse bg-base-200/50" />

                {/* Content skeleton */}
                <div className="p-8 space-y-4">
                    <div className="h-8 w-1/3 bg-base-200 rounded animate-pulse" />
                    <div className="h-4 w-full bg-base-200 rounded animate-pulse" />
                    <div className="h-4 w-2/3 bg-base-200 rounded animate-pulse" />
                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="h-32 bg-base-200 rounded animate-pulse" />
                        <div className="h-32 bg-base-200 rounded animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center bg-base-100">
                <div className="text-center max-w-md p-6">
                    <div className="alert alert-error">
                        <i className="fa-duotone fa-regular fa-circle-exclamation" />
                        <span>{error}</span>
                    </div>
                    <button onClick={onClose} className="btn btn-ghost mt-4">
                        <i className="fa-duotone fa-arrow-left mr-2" />
                        Back to List
                    </button>
                </div>
            </div>
        );
    }

    // Success state - render children
    return <div className="flex-1 flex flex-col bg-base-100">{children}</div>;
}
