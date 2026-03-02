"use client";

import { RecruiterCardData } from "./data";

export function Card01({ recruiter }: { recruiter: RecruiterCardData }) {
    const firstTwoStats = recruiter.stats.slice(0, 4);

    return (
        <article className="bg-base-100 border border-base-300 border-l-4 border-l-primary w-full max-w-md">
            {/* Header Band */}
            <div className="bg-base-300 border-b border-base-300 px-6 pt-6 pb-5">
                {/* Kicker row: firm + status indicators */}
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/40">
                        {recruiter.firm}
                    </p>
                    <div className="flex items-center gap-3">
                        {recruiter.verified && (
                            <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-secondary">
                                <i className="fa-duotone fa-regular fa-badge-check text-sm" />
                                Verified
                            </span>
                        )}
                        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                            <span
                                className={`inline-block w-2 h-2 ${
                                    recruiter.online
                                        ? "bg-success"
                                        : "bg-base-300"
                                }`}
                            />
                            <span
                                className={
                                    recruiter.online
                                        ? "text-success"
                                        : "text-base-content/30"
                                }
                            >
                                {recruiter.online ? "Online" : "Away"}
                            </span>
                        </span>
                    </div>
                </div>

                {/* Avatar + Name block */}
                <div className="flex items-end gap-4">
                    <div className="relative shrink-0">
                        <div className="w-16 h-16 bg-primary text-primary-content flex items-center justify-center text-xl font-black tracking-tight select-none">
                            {recruiter.initials}
                        </div>
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-0.5">
                            {recruiter.title}
                        </p>
                        <h2 className="text-3xl font-black tracking-tight leading-none text-base-content truncate">
                            {recruiter.name}
                        </h2>
                    </div>
                </div>

                {/* Location + member since */}
                <div className="flex items-center gap-4 mt-3 text-sm text-base-content/40">
                    <span className="flex items-center gap-1.5">
                        <i className="fa-duotone fa-regular fa-location-dot text-xs" />
                        {recruiter.location}
                    </span>
                    <span className="text-base-content/20">|</span>
                    <span className="flex items-center gap-1.5">
                        <i className="fa-duotone fa-regular fa-calendar text-xs" />
                        Member since {recruiter.memberSince}
                    </span>
                </div>
            </div>

            {/* Bio */}
            <div className="px-6 py-5 border-b border-base-300">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-2">
                    About
                </p>
                <p className="text-sm text-base-content/70 leading-relaxed line-clamp-2">
                    {recruiter.bio}
                </p>
            </div>

            {/* Stats Row */}
            <div className="border-b border-base-300">
                <div className="grid grid-cols-4 divide-x divide-base-300">
                    {firstTwoStats.map((stat) => (
                        <div
                            key={stat.label}
                            className="flex flex-col items-center justify-center px-2 py-4 gap-1 text-center"
                        >
                            <i
                                className={`${stat.icon} text-primary text-base`}
                            />
                            <span className="text-xl font-black text-base-content leading-none">
                                {stat.value}
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-wider text-base-content/30 leading-none">
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Specializations */}
            <div className="px-6 py-5 border-b border-base-300">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-3">
                    Specializations
                </p>
                <div className="flex flex-wrap gap-1.5">
                    {recruiter.specializations.map((spec) => (
                        <span
                            key={spec}
                            className="px-2.5 py-1 bg-base-200 border border-base-300 text-xs font-bold uppercase tracking-wider text-base-content/60"
                        >
                            {spec}
                        </span>
                    ))}
                </div>
            </div>

            {/* Partnership Badges */}
            <div className="px-6 py-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-3">
                    Partnership
                </p>
                <div className="flex flex-wrap gap-2">
                    <span
                        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${recruiter.seekingSplits ? "bg-primary text-primary-content" : "bg-base-200 border border-base-300 text-base-content/30"}`}
                    >
                        <i className="fa-duotone fa-regular fa-handshake text-sm" />
                        Seeking Splits
                    </span>
                    <span
                        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${recruiter.acceptsCandidates ? "bg-secondary text-secondary-content" : "bg-base-200 border border-base-300 text-base-content/30"}`}
                    >
                        <i className="fa-duotone fa-regular fa-user-plus text-sm" />
                        Accepts Candidates
                    </span>
                </div>
            </div>
        </article>
    );
}
