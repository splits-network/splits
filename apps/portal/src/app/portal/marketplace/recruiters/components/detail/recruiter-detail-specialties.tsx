"use client";

import { RecruiterDetailProps } from "./types";

export default function RecruiterDetailSpecialties({
    recruiter,
}: RecruiterDetailProps) {
    const specialties = recruiter.specialties || [];

    if (specialties.length === 0) return null;

    return (
        <section className="card bg-base-100 border border-base-200 shadow-sm">
            <div className="p-4 border-b border-base-200 bg-base-200/30">
                <h3 className="font-semibold flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-briefcase text-primary"></i>
                    Specialties
                </h3>
            </div>
            <div className="p-4 flex flex-wrap gap-2">
                {specialties.map((specialty, i) => (
                    <span
                        key={`specialty-${i}`}
                        className="badge badge-lg bg-primary/10 text-primary border-primary/20 p-3"
                    >
                        {specialty}
                    </span>
                ))}
            </div>
        </section>
    );
}
