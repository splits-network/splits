"use client";

import { useRef, type ReactNode } from "react";
import { useScrollReveal } from "@splits-network/basel-ui";

interface ScrollAnimatorProps {
    children: ReactNode;
}

export function ScrollAnimator({ children }: ScrollAnimatorProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    useScrollReveal(containerRef);
    return <div ref={containerRef}>{children}</div>;
}
