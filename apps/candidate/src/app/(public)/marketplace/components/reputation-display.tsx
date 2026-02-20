"use client";

interface ReputationDisplayProps {
    score?: number;
    placements?: number;
    className?: string;
}

export default function ReputationDisplay({
    score,
    placements,
    className = "",
}: ReputationDisplayProps) {
    return (
        <div className={`flex items-center gap-4 ${className}`}>
            <div className="flex items-center gap-1.5">
                <i className="fa-duotone fa-regular fa-star text-primary text-xs" />
                <span className="text-sm font-black tracking-tight">
                    {score ? score.toFixed(1) : "N/A"}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-base-content/40">
                    Rating
                </span>
            </div>
            <div className="w-px h-3 bg-base-300" />
            <div className="flex items-center gap-1.5">
                <i className="fa-duotone fa-regular fa-handshake text-secondary text-xs" />
                <span className="text-sm font-black tracking-tight">
                    {placements ?? 0}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-base-content/40">
                    Placements
                </span>
            </div>
        </div>
    );
}
