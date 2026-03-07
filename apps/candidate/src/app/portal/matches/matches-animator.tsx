"use client";

import { type RefObject } from "react";
import { useScrollReveal } from "@splits-network/basel-ui";

interface MatchesAnimatorProps {
    containerRef: RefObject<HTMLDivElement | null>;
    loading: boolean;
}

export default function MatchesAnimator({
    containerRef,
    loading,
}: MatchesAnimatorProps) {
    useScrollReveal(containerRef);

    return null;
}
