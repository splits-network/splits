"use client";

import { useRef, type ReactNode } from "react";
import { useScrollReveal } from "@splits-network/basel-ui";

export function RecruitersAnimator({ children }: { children: ReactNode }) {
    const mainRef = useRef<HTMLElement>(null);
    useScrollReveal(mainRef);

    return (
        <main ref={mainRef} className="hero-entrance">
            {children}
        </main>
    );
}
