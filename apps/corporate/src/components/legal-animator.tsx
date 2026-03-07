"use client";

import { useRef, type ReactNode } from "react";
import { useScrollReveal } from "@splits-network/basel-ui";

export function LegalBaselAnimator({ children }: { children: ReactNode }) {
    const mainRef = useRef<HTMLDivElement>(null);
    useScrollReveal(mainRef);

    return (
        <div ref={mainRef} className="hero-entrance">
            {children}
        </div>
    );
}
