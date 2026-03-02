"use client";

import { BadgeProgressItem } from "../types";

interface BadgeProgressCardProps {
    progress: BadgeProgressItem;
}

export function BadgeProgressCard({ progress }: BadgeProgressCardProps) {
    const { badge_definition, current_value, target_value, percentage } = progress;

    return (
        <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center bg-base-300 rounded">
                <i className={`${badge_definition.icon} ${badge_definition.color} text-base`} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-base-content truncate">
                        {badge_definition.name}
                    </span>
                    <span className="text-xs font-bold text-base-content/50 ml-2 flex-shrink-0">
                        {Math.round(current_value)}/{Math.round(target_value)}
                    </span>
                </div>
                <div className="w-full bg-base-300 h-1.5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
