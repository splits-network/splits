"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface ResizableSplitProps {
    left: React.ReactNode;
    right: React.ReactNode;
    defaultLeftPercent?: number;
    minLeftPercent?: number;
    maxLeftPercent?: number;
    storageKey?: string;
}

export function ResizableSplit({
    left,
    right,
    defaultLeftPercent = 60,
    minLeftPercent = 35,
    maxLeftPercent = 80,
    storageKey = "smart-resume-split",
}: ResizableSplitProps) {
    const [leftPercent, setLeftPercent] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = parseFloat(saved);
                if (!isNaN(parsed) && parsed >= minLeftPercent && parsed <= maxLeftPercent) {
                    return parsed;
                }
            }
        }
        return defaultLeftPercent;
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const dragging = useRef(false);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        dragging.current = true;
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!dragging.current || !containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percent = (x / rect.width) * 100;
            const clamped = Math.min(maxLeftPercent, Math.max(minLeftPercent, percent));
            setLeftPercent(clamped);
        };

        const handleMouseUp = () => {
            if (!dragging.current) return;
            dragging.current = false;
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
            // Persist
            localStorage.setItem(storageKey, String(leftPercent));
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [leftPercent, maxLeftPercent, minLeftPercent, storageKey]);

    return (
        <div ref={containerRef} className="flex h-full min-h-0">
            {/* Left panel */}
            <div
                className="overflow-y-auto min-w-0"
                style={{ width: `${leftPercent}%` }}
            >
                {left}
            </div>

            {/* Drag handle */}
            <div
                className="shrink-0 w-1.5 bg-base-300 hover:bg-primary/30 active:bg-primary/50 cursor-col-resize transition-colors relative group"
                onMouseDown={handleMouseDown}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <i className="fa-solid fa-grip-dots-vertical text-xs text-base-content/30" />
                </div>
            </div>

            {/* Right panel */}
            <div
                className="overflow-y-auto min-w-0 flex-1"
            >
                {right}
            </div>
        </div>
    );
}
