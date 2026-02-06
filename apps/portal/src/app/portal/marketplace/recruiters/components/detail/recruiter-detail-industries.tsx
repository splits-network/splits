"use client";

import { RecruiterDetailProps } from "./types";

export default function RecruiterDetailIndustries({
    recruiter,
}: RecruiterDetailProps) {
    const industries = recruiter.industries || [];

    if (industries.length === 0) return null;

    return (
        <section className="card bg-base-100 border border-base-200 shadow-sm">
            <div className="p-4 border-b border-base-200 bg-base-200/30">
                <h3 className="font-semibold flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-industry text-secondary"></i>
                    Industries
                </h3>
            </div>
            <div className="p-4 flex flex-wrap gap-2">
                {industries.map((industry, i) => (
                    <span
                        key={`industry-${i}`}
                        className="badge badge-lg bg-secondary/10 text-secondary border-secondary/20 p-3"
                    >
                        {industry}
                    </span>
                ))}
            </div>
        </section>
    );
}
