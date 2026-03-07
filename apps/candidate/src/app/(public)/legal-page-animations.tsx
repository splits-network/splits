"use client";

import { useRef } from "react";
import { useScrollReveal } from "@splits-network/basel-ui";

export default function LegalPageAnimations({ children }: { children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    useScrollReveal(ref);

    return <div ref={ref}>{children}</div>;
}
