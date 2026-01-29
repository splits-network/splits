"use client";

import { Candidate } from "./types";

export default function DetailSkills({ candidate }: { candidate: Candidate }) {
    // Parse legacy skills string
    const legacySkills = candidate.skills
        ? candidate.skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
        : [];

    // Get structured specialties from marketplace profile
    const specialties = candidate.marketplace_profile?.specialties || [];

    // Combine and deduplicate
    const allSkills = Array.from(new Set([...legacySkills, ...specialties]));

    if (allSkills.length === 0) return null;

    return (
        <section className="card bg-base-100 border border-base-200 shadow-sm">
            <div className="p-4 border-b border-base-200 bg-base-200/30">
                <h3 className="font-semibold flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-laptop-code text-secondary"></i>
                    Skills & Specialties
                </h3>
            </div>
            <div className="p-4 flex flex-wrap gap-2">
                {allSkills.map((skill, i) => (
                    <span
                        key={i}
                        className="badge badge-lg bg-base-200 border-base-300 p-3"
                    >
                        {skill}
                    </span>
                ))}
            </div>
        </section>
    );
}
