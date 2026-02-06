"use client";

import { RecruiterDetailProps } from "./types";

export default function RecruiterDetailExperience({
    recruiter,
}: RecruiterDetailProps) {
    const yearsExperience = recruiter.years_experience;

    if (!yearsExperience) return null;

    return (
        <section className="card bg-base-100 border border-base-200 shadow-sm">
            <div className="card-body p-4">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 rounded-full p-3">
                        <i className="fa-duotone fa-regular fa-calendar-clock text-primary text-xl"></i>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-base-content">
                            {yearsExperience}+
                        </div>
                        <div className="text-sm text-base-content/60">
                            Years in Recruitment
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
