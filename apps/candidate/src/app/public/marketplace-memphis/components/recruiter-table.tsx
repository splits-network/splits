"use client";

import Link from "next/link";
import ReputationBadgeMemphis from "./reputation-badge-memphis";
import type { Recruiter } from "../marketplace-memphis-client";

interface RecruiterTableProps {
    recruiters: Recruiter[];
    selectedRecruiter: Recruiter | null;
    onSelect: (recruiter: Recruiter) => void;
}

const ACCENT_COLORS = ["coral", "teal", "mint"] as const;

export default function RecruiterTable({
    recruiters,
    selectedRecruiter,
    onSelect,
}: RecruiterTableProps) {
    return (
        <div className="border-4 border-dark bg-white overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="bg-dark">
                        <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-[0.2em] text-coral">
                            Recruiter
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.2em] text-teal hidden md:table-cell">
                            Location
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.2em] text-mint hidden lg:table-cell">
                            Specialization
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.2em] text-coral hidden lg:table-cell">
                            Rating
                        </th>
                        <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-[0.2em] text-teal">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {recruiters.map((recruiter, index) => {
                        const accentColor = ACCENT_COLORS[index % ACCENT_COLORS.length];
                        const isSelected = selectedRecruiter?.id === recruiter.id;
                        const name = recruiter.users?.name || recruiter.name || "Recruiter";
                        const initials = name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase();

                        return (
                            <tr
                                key={recruiter.id}
                                className={`recruiter-card border-b-2 border-cream cursor-pointer transition-colors hover:bg-cream/50 opacity-0 ${
                                    isSelected ? "bg-cream" : ""
                                }`}
                                onClick={() => onSelect(recruiter)}
                            >
                                {/* Name Column */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-12 h-12 rounded-full border-4 border-${accentColor} bg-cream flex items-center justify-center flex-shrink-0`}
                                        >
                                            <span className={`text-sm font-black text-${accentColor}`}>
                                                {initials}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-black text-sm text-dark">
                                                {name}
                                            </p>
                                            {recruiter.tagline && (
                                                <p className="text-xs text-dark/60 mt-0.5">
                                                    {recruiter.tagline}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </td>

                                {/* Location Column */}
                                <td className="px-4 py-4 hidden md:table-cell">
                                    <div className="flex items-center gap-2 text-sm text-dark/70">
                                        <i className="fa-duotone fa-regular fa-location-dot"></i>
                                        {recruiter.location || "N/A"}
                                    </div>
                                    {recruiter.years_experience != null && (
                                        <div className="flex items-center gap-2 text-xs text-dark/50 mt-1">
                                            <i className="fa-duotone fa-regular fa-briefcase"></i>
                                            {recruiter.years_experience} years
                                        </div>
                                    )}
                                </td>

                                {/* Specialization Column */}
                                <td className="px-4 py-4 hidden lg:table-cell">
                                    <p className="text-sm text-dark/70">
                                        {recruiter.specialization || "General"}
                                    </p>
                                </td>

                                {/* Rating Column */}
                                <td className="px-4 py-4 hidden lg:table-cell">
                                    <div className="flex items-center gap-2">
                                        <i className={`fa-duotone fa-regular fa-star text-${accentColor}`}></i>
                                        <span className={`text-sm font-black text-${accentColor}`}>
                                            {(recruiter.reputation_score ?? 0).toFixed(1)}
                                        </span>
                                        <span className="text-xs text-dark/40">
                                            ({recruiter.total_placements ?? 0} placements)
                                        </span>
                                    </div>
                                </td>

                                {/* Actions Column */}
                                <td className="px-4 py-4 text-right">
                                    <Link
                                        href={`/public/marketplace-memphis/${recruiter.id}`}
                                        className={`inline-block px-4 py-2 text-xs font-black uppercase tracking-wider bg-${accentColor} text-dark border-3 border-${accentColor} transition-transform hover:-translate-y-0.5`}
                                        onClick={(e) => e.stopPropagation()}
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
