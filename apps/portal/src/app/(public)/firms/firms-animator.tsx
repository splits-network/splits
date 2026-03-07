"use client";

import { useRef, type ReactNode } from "react";
import { useScrollReveal } from "@splits-network/basel-ui";

interface FirmsAnimatorProps {
    children: ReactNode;
    contentRef: React.RefObject<HTMLDivElement | null>;
}

export function FirmsAnimator({ children }: FirmsAnimatorProps) {
    const mainRef = useRef<HTMLElement>(null);
    useScrollReveal(mainRef);

    return (
        <main ref={mainRef} className="hero-entrance">
            {children}
        </main>
    );
}
