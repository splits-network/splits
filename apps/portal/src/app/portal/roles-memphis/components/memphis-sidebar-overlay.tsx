"use client";

import { useEffect, useCallback } from "react";

interface MemphisSidebarOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    /** Header actions rendered between title and close button */
    headerActions?: React.ReactNode;
    children: React.ReactNode;
}

/**
 * Memphis-styled slide-out sidebar overlay.
 * Replaces DaisyUI's `drawer drawer-end` pattern with Memphis theme classes.
 */
export function MemphisSidebarOverlay({
    isOpen,
    onClose,
    title,
    subtitle,
    headerActions,
    children,
}: MemphisSidebarOverlayProps) {
    // Close on Escape key
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        },
        [onClose],
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Overlay backdrop */}
            <div
                className="absolute inset-0 bg-dark/50"
                onClick={onClose}
                aria-label="Close sidebar"
            />

            {/* Sidebar panel */}
            <div className="relative w-full md:w-2/3 lg:w-1/2 xl:w-2/5 bg-white border-l-4 border-dark flex flex-col">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-dark px-4 py-3 flex items-center justify-between">
                    <div className="min-w-0">
                        <h2 className="text-sm font-black uppercase tracking-wider text-cream truncate">
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="text-[10px] font-semibold text-cream/50 truncate">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {headerActions}
                        <button
                            onClick={onClose}
                            className="memphis-btn memphis-btn-sm btn-coral"
                            aria-label="Close"
                        >
                            <i className="fa-solid fa-xmark" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
