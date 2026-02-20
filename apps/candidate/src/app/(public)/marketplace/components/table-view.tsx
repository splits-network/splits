"use client";

import Link from "next/link";
import type { Recruiter } from "../marketplace-client";
import { getInitials, reputationColor } from "./status-color";

interface TableViewProps {
    recruiters: Recruiter[];
    selectedRecruiter: Recruiter | null;
    onSelect: (recruiter: Recruiter) => void;
}

export default function TableView({
    recruiters,
    selectedRecruiter,
    onSelect,
}: TableViewProps) {
    return (
        <div className="overflow-x-auto border-2 border-base-300">
            <table className="table w-full">
                <thead>
                    <tr className="bg-base-200 border-b-2 border-base-300">
                        <th className="text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40 py-3 px-6">
                            Recruiter
                        </th>
                        <th className="text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40 py-3 px-6 hidden md:table-cell">
                            Location
                        </th>
                        <th className="text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40 py-3 px-6 hidden lg:table-cell">
                            Experience
                        </th>
                        <th className="text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40 py-3 px-6 hidden lg:table-cell">
                            Rating
                        </th>
                        <th className="text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40 py-3 px-6 hidden xl:table-cell">
                            Placements
                        </th>
                        <th className="text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40 py-3 px-6">
                            Action
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {recruiters.map((recruiter) => {
                        const name =
                            recruiter.users?.name ||
                            recruiter.name ||
                            "Unknown";
                        const initials = getInitials(name);
                        const isSelected =
                            selectedRecruiter?.id === recruiter.id;

                        return (
                            <tr
                                key={recruiter.id}
                                onClick={() => onSelect(recruiter)}
                                className={`cursor-pointer border-b border-base-200 hover:bg-base-200/50 transition-colors ${
                                    isSelected
                                        ? "bg-primary/5 border-l-4 border-l-primary"
                                        : ""
                                }`}
                            >
                                {/* Recruiter: avatar + name + tagline */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 flex items-center justify-center bg-primary/10 text-primary font-bold text-xs flex-shrink-0">
                                            {initials}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-sm truncate">
                                                {name}
                                            </p>
                                            {recruiter.tagline && (
                                                <div className="flex gap-1 mt-0.5">
                                                    <span className="text-[9px] uppercase tracking-wider bg-base-200 text-base-content/40 px-1.5 py-0.5 truncate max-w-[200px]">
                                                        {recruiter.tagline}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>

                                {/* Location */}
                                <td className="px-6 py-4 hidden md:table-cell">
                                    <span className="text-sm text-base-content/60">
                                        {recruiter.location || "—"}
                                    </span>
                                </td>

                                {/* Experience */}
                                <td className="px-6 py-4 hidden lg:table-cell">
                                    <span className="text-sm font-bold">
                                        {recruiter.years_experience
                                            ? `${recruiter.years_experience} yrs`
                                            : "—"}
                                    </span>
                                </td>

                                {/* Rating */}
                                <td className="px-6 py-4 hidden lg:table-cell">
                                    {recruiter.reputation_score ? (
                                        <span
                                            className={`text-[10px] uppercase font-bold px-2 py-1 ${reputationColor(recruiter.reputation_score)}`}
                                        >
                                            <i className="fa-duotone fa-regular fa-star mr-1" />
                                            {recruiter.reputation_score.toFixed(
                                                1,
                                            )}
                                        </span>
                                    ) : (
                                        <span className="text-sm text-base-content/30">
                                            —
                                        </span>
                                    )}
                                </td>

                                {/* Placements */}
                                <td className="px-6 py-4 hidden xl:table-cell">
                                    <span className="text-sm font-bold">
                                        {recruiter.total_placements ?? 0}
                                    </span>
                                </td>

                                {/* Action */}
                                <td className="px-6 py-4">
                                    <Link
                                        href={`/marketplace/${recruiter.id}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="btn btn-sm btn-primary"
                                        style={{ borderRadius: 0 }}
                                    >
                                        View
                                    </Link>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
