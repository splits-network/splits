"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface MobileDetailOverlayProps {
    isOpen: boolean;
    children: ReactNode;
    className?: string;
}

/**
 * Wrapper that makes detail panels responsive on mobile.
 * - Mobile (< md): full-page modal portaled to document.body
 * - Desktop (>= md): static positioned, inherits parent layout
 */
export function MobileDetailOverlay({
    isOpen,
    children,
    className = "",
}: MobileDetailOverlayProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Mobile full-page modal (portaled to body so it covers everything)
    const mobileOverlay =
        isOpen && mounted
            ? createPortal(
                  <div className="fixed inset-0 z-[999] flex flex-col bg-white md:hidden">
                      <div className="flex-1 overflow-y-auto">{children}</div>
                  </div>,
                  document.body,
              )
            : null;

    // Desktop inline layout (hidden on mobile)
    return (
        <>
            {mobileOverlay}
            <div
                className={`hidden md:flex md:flex-col ${className}`}
            >
                <div className="flex-1 overflow-y-auto">{children}</div>
            </div>
        </>
    );
}
