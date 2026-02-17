"use client";

import Link from "next/link";
import { Badge } from "@splits-network/memphis-ui";
import ReputationBadgeMemphis from "./reputation-badge-memphis";
import type { Recruiter } from "../marketplace-memphis-client";

interface RecruiterCardMemphisProps {
    recruiter: Recruiter;
    isSelected: boolean;
    onClick: () => void;
    index: number;
}

const ACCENT_COLORS = ["coral", "teal", "mint"] as const;

export default function RecruiterCardMemphis({
    recruiter,
    isSelected,
    onClick,
    index,
}: RecruiterCardMemphisProps) {
    const accentColor = ACCENT_COLORS[index % ACCENT_COLORS.length];
    const name = recruiter.users?.name || recruiter.name || "Recruiter";
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

    const industries = recruiter.specialization
        ? recruiter.specialization.split(",").map((s) => s.trim()).slice(0, 3)
        : [];

    return (
        <div
            className={`recruiter-card border-4 bg-white transition-all hover:-translate-y-1 cursor-pointer opacity-0 ${
                isSelected ? `border-${accentColor}` : "border-dark"
            }`}
            onClick={onClick}
        >
            {/* Card Header */}
            <div className={`bg-${accentColor} p-6 text-center`}>
                {/* Avatar Circle */}
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full border-4 border-dark bg-cream flex items-center justify-center`}>
                    <span className="text-2xl font-black text-dark">
                        {initials}
                    </span>
                </div>

                <h3 className="text-lg font-black uppercase tracking-tight mb-1 text-dark">
                    {name}
                </h3>

                {recruiter.tagline && (
                    <p className="text-sm font-semibold text-dark/70">
                        {recruiter.tagline}
                    </p>
                )}
            </div>

            {/* Card Body */}
            <div className="p-6">
                {/* Bio */}
                {recruiter.bio && (
                    <p className="text-sm text-dark/70 leading-relaxed mb-4 line-clamp-3">
                        {recruiter.bio}
                    </p>
                )}

                {/* Location + Experience */}
                <div className="flex flex-wrap gap-3 text-sm text-dark/60 mb-4">
                    {recruiter.location && (
                        <span>
                            <i className="fa-duotone fa-regular fa-location-dot mr-1"></i>
                            {recruiter.location}
                        </span>
                    )}
                    {recruiter.years_experience != null && (
                        <span>
                            <i className="fa-duotone fa-regular fa-briefcase mr-1"></i>
                            {recruiter.years_experience} years
                        </span>
                    )}
                </div>

                {/* Industries */}
                {industries.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {industries.map((industry, i) => (
                            <Badge
                                key={i}
                                className={`bg-${accentColor} text-dark border-2 border-dark`}
                            >
                                {industry}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Reputation */}
                <div className="mb-4">
                    <ReputationBadgeMemphis
                        score={recruiter.reputation_score}
                        placements={recruiter.total_placements}
                        accent={accentColor}
                    />
                </div>
            </div>

            {/* Card Footer */}
            <div className="p-6 pt-0">
                <Link
                    href={`/public/marketplace-memphis/${recruiter.id}`}
                    className={`block w-full py-3 text-center text-sm font-black uppercase tracking-wider bg-dark text-cream border-4 border-dark transition-transform hover:-translate-y-0.5`}
                    onClick={(e) => e.stopPropagation()}
                >
                    View Profile
                </Link>
            </div>
        </div>
    );
}
