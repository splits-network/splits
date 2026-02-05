import { Application } from "./types";
import { getApplicationStageBadge } from "@/lib/utils/badge-styles";

interface ApplicationListItemProps {
    item: Application;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

export default function ApplicationListItem({
    item,
    isSelected,
    onSelect,
}: ApplicationListItemProps) {
    const stageBadge = getApplicationStageBadge(item.stage);

    return (
        <div
            onClick={() => onSelect(item.id)}
            className={`
                group relative p-3 sm:p-4 border-b border-base-300 cursor-pointer transition-all duration-200
                hover:bg-base-100
                ${
                    isSelected
                        ? "bg-base-100 border-l-4 border-l-primary shadow-sm z-10"
                        : "border-l-4 border-l-transparent"
                }
            `}
        >
            <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-base-content line-clamp-1 group-hover:text-primary transition-colors">
                    {item.candidate?.full_name || "Unnamed Candidate"}
                </h3>
                <span
                    className={`badge badge-xs sm:badge-sm ${stageBadge.className}`}
                >
                    {stageBadge.label}
                </span>
            </div>

            <div className="text-sm text-base-content/70 mb-2 line-clamp-1">
                {item.job?.title} •{" "}
                {item.job?.company?.name || "Confidential Company"}
            </div>

            <div className="flex items-center justify-between text-xs text-base-content/60 mt-2">
                <div className="flex items-center gap-3">
                    {item.recruiter?.name && (
                        <div className="flex items-center gap-1">
                            <i className="fa-duotone fa-user-tie" />
                            <span className="line-clamp-1 max-w-[100px]">
                                {item.recruiter.name}
                            </span>
                        </div>
                    )}
                    {item.ai_review?.fit_score != null && (
                        <div className="flex items-center gap-1">
                            <i className="fa-duotone fa-brain" />
                            <span>
                                {Math.round(item.ai_review.fit_score)}%
                                fit
                            </span>
                        </div>
                    )}
                </div>
                <div className="text-base-content/60">
                    {item.created_at
                        ? new Date(item.created_at).toLocaleDateString()
                        : "Unknown date"}
                </div>
            </div>
        </div>
    );
}
