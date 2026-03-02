"use client";

import type { PublicFirm } from "../../types";
import { firmLocation, firmInitials } from "../../types";

interface SplitItemProps {
    firm: PublicFirm;
    isSelected: boolean;
    onSelect: () => void;
}

export function SplitItem({ firm, isSelected, onSelect }: SplitItemProps) {
    const location = firmLocation(firm);
    const initials = firmInitials(firm.name);

    return (
        <div
            onClick={onSelect}
            className={`cursor-pointer px-6 py-4 border-b border-base-200 hover:bg-base-200/50 transition-colors border-l-4 ${
                isSelected
                    ? "bg-primary/5 border-l-primary"
                    : "bg-base-100 border-transparent"
            }`}
        >
            {/* Logo + Name */}
            <div className="flex items-center gap-3 mb-1">
                {firm.logo_url ? (
                    <img
                        src={firm.logo_url}
                        alt={firm.name}
                        className="w-8 h-8 object-cover flex-shrink-0"
                        style={{ borderRadius: 0 }}
                    />
                ) : (
                    <div
                        className="w-8 h-8 bg-primary text-primary-content flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ borderRadius: 0 }}
                    >
                        {initials}
                    </div>
                )}
                <h4 className="font-bold text-sm tracking-tight truncate text-base-content">
                    {firm.name}
                </h4>
            </div>

            {/* Tagline */}
            {firm.tagline && (
                <p className="text-sm text-base-content/50 truncate mb-1 ml-11">
                    {firm.tagline}
                </p>
            )}

            {/* Location + badges */}
            <div className="flex items-center justify-between gap-2 ml-11">
                <div className="text-sm text-base-content/40 truncate">
                    {location && (
                        <>
                            <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                            {location}
                        </>
                    )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                    {firm.seeking_split_partners && (
                        <span className="text-xs bg-accent/15 text-accent px-1.5 py-0.5 font-semibold">
                            Partners
                        </span>
                    )}
                    {firm.accepts_candidate_submissions && (
                        <span className="text-xs bg-secondary/15 text-secondary px-1.5 py-0.5 font-semibold">
                            Candidates
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
