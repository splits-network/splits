"use client";

interface LiveIndicatorProps {
    online?: number;
    className?: string;
}

/**
 * Pulsing "Live" badge for real-time WebSocket status.
 */
export function LiveIndicator({ online, className }: LiveIndicatorProps) {
    return (
        <div
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 bg-success/10 ${className || ""}`}
        >
            <span className="w-1.5 h-1.5 bg-success animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-success">
                Live
            </span>
            {online !== undefined && (
                <span className="text-[10px] font-bold text-success/70">
                    {online}
                </span>
            )}
        </div>
    );
}
