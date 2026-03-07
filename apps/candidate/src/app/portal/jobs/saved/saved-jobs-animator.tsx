"use client";

import { type RefObject } from "react";
import { useScrollReveal } from "@splits-network/basel-ui";

interface SavedJobsAnimatorProps {
    containerRef: RefObject<HTMLDivElement | null>;
    loading: boolean;
}

export default function SavedJobsAnimator({
    containerRef,
    loading,
}: SavedJobsAnimatorProps) {
    useScrollReveal(containerRef);

    return null;
}
