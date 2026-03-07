"use client";

import { useRef, type ReactNode } from "react";
import { useScrollReveal } from "@splits-network/basel-ui";

export function JobsAnimator({
    children,
}: {
    children: ReactNode;
    contentRef?: React.RefObject<HTMLDivElement | null>;
}) {
    const mainRef = useRef<HTMLElement>(null);
    useScrollReveal(mainRef);

    return (
        <main ref={mainRef} className="hero-entrance">
            {children}
        </main>
    );
}
