import { Job, formatCommuteTypes, formatJobLevel } from "./types";

interface RoleListItemProps {
    item: Job;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

export default function RoleListItem({
    item,
    isSelected,
    onSelect,
}: RoleListItemProps) {
    return (
        <div
            onClick={() => onSelect(item.id)}
            className={`
                group relative px-3 pt-2 pb-4 border-b border-base-300 cursor-pointer transition-all duration-200
                hover:bg-base-100
                ${
                    isSelected
                        ? "bg-base-100 border-l-4 border-l-primary shadow-sm z-10"
                        : "border-l-4 border-l-transparent"
                }
            `}
        >
            <div className="flex justify-between items-start gap-2">
                <h3 className="font-semibold text-sm text-base-content line-clamp-1 group-hover:text-primary transition-colors">
                    {item.title}
                </h3>
                {item.status && (
                    <span
                        className={`badge badge-xs shrink-0 ${
                            item.status === "active"
                                ? "badge-success text-success-content"
                                : item.status === "closed"
                                  ? "badge-neutral"
                                  : "badge-ghost"
                        }`}
                    >
                        {item.status}
                    </span>
                )}
            </div>

            <div className="flex items-center justify-between text-xs text-base-content/60 mt-1">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="line-clamp-1">
                        {item.company?.name || "Confidential"}
                    </span>
                    {item.location && (
                        <>
                            <span className="text-base-content/30">•</span>
                            <span className="line-clamp-1 shrink-0">
                                {item.location}
                            </span>
                        </>
                    )}
                </div>
                {(item.fee_percentage || 0) > 0 && (
                    <span className="font-medium text-base-content/70 shrink-0 ml-2">
                        {item.fee_percentage}%
                    </span>
                )}
            </div>
            {(formatCommuteTypes(item.commute_types) || formatJobLevel(item.job_level)) && (
                <div className="flex items-center gap-1.5 text-xs text-base-content/50 mt-0.5">
                    {formatCommuteTypes(item.commute_types) && (
                        <span className="truncate">{formatCommuteTypes(item.commute_types)}</span>
                    )}
                    {formatCommuteTypes(item.commute_types) && formatJobLevel(item.job_level) && (
                        <span className="text-base-content/30">·</span>
                    )}
                    {formatJobLevel(item.job_level) && (
                        <span className="shrink-0">{formatJobLevel(item.job_level)}</span>
                    )}
                </div>
            )}
        </div>
    );
}
