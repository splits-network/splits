import { Job } from "./types";

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
                    {item.title}
                </h3>
                {item.status && (
                    <span
                        className={`badge badge-xs sm:badge-sm ${
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

            <div className="text-sm text-base-content/70 mb-2 line-clamp-1">
                {item.company?.name || "Confidential Company"}
            </div>

            <div className="flex items-center justify-between text-base-content/60 mt-2">
                <div className="flex items-center gap-3">
                    {item.location && (
                        <div className="flex items-center gap-1">
                            <i className="fa-duotone fa-location-dot" />
                            <span className="line-clamp-1 max-w-[100px]">
                                {item.location}
                            </span>
                        </div>
                    )}
                </div>
                <div>
                    {/** TODO: let's do the calculation for max placement fee or potential commission like we do in hte rolecard here with the fee percentage*/}
                    {(item.fee_percentage || 0) > 0 && (
                        <div className="font-medium text-base-content/80">
                            {item.fee_percentage}% Fee
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
