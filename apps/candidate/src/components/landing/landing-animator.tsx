"use client";

import { useRef, type ReactNode } from "react";
import { useScrollReveal } from "@splits-network/basel-ui";

export function LandingAnimator({ children }: { children: ReactNode }) {
    const containerRef = useRef<HTMLDivElement>(null);
    useScrollReveal(containerRef);

    return (
        <div ref={containerRef} className="hero-entrance">
            {children}
        </div>
    );
}
