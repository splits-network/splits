"use client";

import { formatDate } from "@/lib/utils";
import { type Application, getStatusColor, formatStage } from "../../types";

interface ListItemProps {
    item: Application;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

export default function ListItem({
    item,
    isSelected,
    onSelect,
}: ListItemProps) {
    const companyInitial = (item.job?.company?.name || "C")[0].toUpperCase();

    return (
        <div
            className={`flex items-center gap-3 p-3 cursor-pointer border-b border-base-300 transition-colors hover:bg-base-300/50 ${
                isSelected ? "bg-primary/10 border-l-4 border-l-primary" : ""
            }`}
            onClick={() => onSelect(item.id)}
        >
            {/* Company Avatar */}
            <div className="avatar avatar-placeholder shrink-0">
                <div className="bg-primary/10 text-primary rounded-full w-10 flex items-center justify-center font-bold text-sm">
                    {item.job?.company?.logo_url ? (
                        <img
                            src={item.job.company.logo_url}
                            alt={`${item.job?.company.name} logo`}
                            className="w-full h-full object-contain rounded-full"
                        />
                    ) : (
                        <span>{companyInitial}</span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-sm truncate">
                        {item.job?.title || "Unknown Position"}
                    </h4>
                    <span
                        className={`badge ${getStatusColor(item.stage)} badge-xs font-medium shrink-0`}
                    >
                        {formatStage(item.stage)}
                    </span>
                </div>
                <p className="text-xs text-base-content/60 truncate">
                    {item.job?.company?.name || "Unknown Company"}
                    {item.job?.location && ` - ${item.job.location}`}
                </p>
                <p className="text-xs text-base-content/40 mt-0.5">
                    {formatDate(item.created_at)}
                </p>
            </div>
        </div>
    );
}
