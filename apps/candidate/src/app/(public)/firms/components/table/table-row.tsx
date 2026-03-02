"use client";

import { Fragment } from "react";
import type { PublicFirm } from "../../types";
import { firmLocation } from "../../types";
import { FirmDetailPanel } from "../shared/firm-detail-panel";

interface TableRowProps {
    firm: PublicFirm;
    idx: number;
    isSelected: boolean;
    colSpan: number;
    onSelect: () => void;
}

export function TableRow({
    firm,
    idx,
    isSelected,
    colSpan,
    onSelect,
}: TableRowProps) {
    const location = firmLocation(firm);
    const rowBase = isSelected
        ? "bg-primary/5 border-l-4 border-l-primary"
        : `border-l-4 border-l-transparent ${idx % 2 === 0 ? "bg-base-100" : "bg-base-200/30"}`;

    return (
        <Fragment>
            <tr
                onClick={onSelect}
                className={`cursor-pointer transition-colors ${rowBase}`}
            >
                {/* Chevron */}
                <td className="px-4 py-3 w-8">
                    <i
                        className={`fa-duotone fa-regular ${
                            isSelected ? "fa-chevron-down" : "fa-chevron-right"
                        } text-sm transition-transform ${
                            isSelected ? "text-primary" : "text-base-content/30"
                        }`}
                    />
                </td>

                {/* Name */}
                <td className="px-4 py-3">
                    <span className="font-bold text-sm text-base-content">
                        {firm.name}
                    </span>
                </td>

                {/* Location */}
                <td className="px-4 py-3 text-sm text-base-content/60 hidden md:table-cell">
                    {location || "\u2014"}
                </td>

                {/* Industries */}
                <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                        {firm.industries.slice(0, 2).map((industry) => (
                            <span
                                key={industry}
                                className="text-sm uppercase tracking-wider bg-base-200 text-base-content/50 px-2 py-0.5"
                            >
                                {industry}
                            </span>
                        ))}
                    </div>
                </td>

                {/* Partnership */}
                <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                        {firm.seeking_split_partners && (
                            <span className="text-sm bg-accent/15 text-accent px-2 py-0.5 font-semibold">
                                Partners
                            </span>
                        )}
                        {firm.accepts_candidate_submissions && (
                            <span className="text-sm bg-secondary/15 text-secondary px-2 py-0.5 font-semibold">
                                Candidates
                            </span>
                        )}
                    </div>
                </td>

                {/* Founded */}
                <td className="px-4 py-3 text-sm text-base-content/50 hidden xl:table-cell">
                    {firm.founded_year || "\u2014"}
                </td>
            </tr>

            {/* Expanded detail */}
            {isSelected && (
                <tr>
                    <td
                        colSpan={colSpan}
                        className="p-0 bg-base-100 border-t-2 border-b-2 border-primary"
                    >
                        <FirmDetailPanel firm={firm} onClose={onSelect} />
                    </td>
                </tr>
            )}
        </Fragment>
    );
}
