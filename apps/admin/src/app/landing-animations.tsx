"use client";

import { useRef } from "react";
import { useScrollReveal } from "@splits-network/basel-ui";

/**
 * Client-only animation wrapper.
 * Renders children server-side, then enhances with CSS scroll-reveal on hydration.
 */
export function LandingAnimations({ children }: { children: React.ReactNode }) {
    const mainRef = useRef<HTMLDivElement>(null);

    useScrollReveal(mainRef);

    return <div ref={mainRef}>{children}</div>;
}
