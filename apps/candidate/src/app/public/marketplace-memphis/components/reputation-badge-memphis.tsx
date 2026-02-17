"use client";

interface ReputationBadgeMemphisProps {
    score?: number;
    placements?: number;
    accent?: "coral" | "teal" | "mint";
}

export default function ReputationBadgeMemphis({
    score,
    placements,
    accent = "coral",
}: ReputationBadgeMemphisProps) {
    const displayScore = score ?? 0;
    const displayPlacements = placements ?? 0;

    return (
        <div className="flex items-center justify-between border-4 border-cream p-3">
            {/* Reputation Score */}
            <div className="flex items-center gap-2">
                <i className={`fa-duotone fa-regular fa-star text-${accent} text-lg`}></i>
                <div>
                    <div className={`text-lg font-black text-${accent}`}>
                        {displayScore.toFixed(1)}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-dark/40">
                        Rating
                    </div>
                </div>
            </div>

            {/* Placements */}
            <div className="flex items-center gap-2">
                <i className="fa-duotone fa-regular fa-handshake text-dark/60 text-lg"></i>
                <div>
                    <div className="text-lg font-black text-dark">
                        {displayPlacements}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-dark/40">
                        Placements
                    </div>
                </div>
            </div>
        </div>
    );
}
