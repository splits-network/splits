"use client";

import Link from "next/link";

interface PlacementConfirmedProps {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    salary: number;
    placementFee: number;
    startDate: string;
    guaranteeDays: number;
    guaranteeExpiresAt: string;
    applicationId: string;
    placementId?: string;
}

export default function PlacementConfirmed({
    candidateName,
    jobTitle,
    companyName,
    salary,
    placementFee,
    startDate,
    guaranteeDays,
    guaranteeExpiresAt,
    applicationId,
    placementId,
}: PlacementConfirmedProps) {
    const formattedStartDate = startDate
        ? new Date(startDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
          })
        : "Not set";

    const placementsUrl = placementId
        ? `/portal/placements?placementId=${placementId}`
        : "/portal/placements";

    return (
        <main className="min-h-[70vh]">
            {/* Hero Section */}
            <section className="relative bg-neutral text-neutral-content py-16 lg:py-24">
                <div
                    className="absolute top-0 right-0 w-1/3 h-full bg-success/10"
                    style={{
                        clipPath: "polygon(20% 0,100% 0,100% 100%,0% 100%)",
                    }}
                />
                <div className="relative container mx-auto px-6 lg:px-12 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-success text-success-content mb-6">
                        <i className="fa-duotone fa-regular fa-circle-check text-4xl" />
                    </div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.92] tracking-tight mb-4">
                        Placement Confirmed
                    </h1>

                    {/* Hero Placement Fee */}
                    <p className="text-6xl md:text-7xl font-black text-success mb-4">
                        ${placementFee.toLocaleString()}
                    </p>

                    <p className="text-base text-neutral-content/60 max-w-xl mx-auto">
                        {candidateName} has been hired as {jobTitle} at {companyName}
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="container mx-auto px-6 lg:px-12 py-10 lg:py-14">
                <div className="max-w-2xl mx-auto space-y-8">
                    {/* Placement Details Card */}
                    <div className="bg-base-200 border-t-4 border-success p-6">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-4">
                            Placement Details
                        </p>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-base-content/50">Salary</p>
                                <p className="text-lg font-black">
                                    ${salary.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-base-content/50">Placement Fee</p>
                                <p className="text-lg font-black text-success">
                                    ${placementFee.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-base-content/50">Start Date</p>
                                <p className="text-lg font-black">{formattedStartDate}</p>
                            </div>
                            <div>
                                <p className="text-sm text-base-content/50">Guarantee Period</p>
                                <p className="text-lg font-black">{guaranteeDays} days</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-sm text-base-content/50">Guarantee Expires</p>
                                <p className="text-lg font-black">{guaranteeExpiresAt}</p>
                            </div>
                        </div>
                    </div>

                    {/* What Was Triggered Card */}
                    <div className="bg-base-200 border-t-4 border-info p-6">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-4">
                            What Was Triggered
                        </p>
                        <div className="space-y-4">
                            {[
                                {
                                    icon: "fa-file-circle-plus",
                                    text: "A placement record has been created",
                                },
                                {
                                    icon: "fa-user-check",
                                    text: "The candidate has been notified of their hire",
                                },
                                {
                                    icon: "fa-coins",
                                    text: "The recruiter has been notified and their fee calculated",
                                },
                                {
                                    icon: "fa-shield-check",
                                    text: "The guarantee period is now active",
                                },
                            ].map((item) => (
                                <div
                                    key={item.icon}
                                    className="flex items-start gap-3 border-l-4 border-base-300 pl-4 py-1"
                                >
                                    <i
                                        className={`fa-duotone fa-regular ${item.icon} text-info mt-0.5`}
                                    />
                                    <span className="text-sm text-base-content/70">
                                        {item.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
                        <Link
                            href={placementsUrl}
                            className="btn btn-primary w-full sm:w-auto gap-2"
                            style={{ borderRadius: 0 }}
                        >
                            <i className="fa-duotone fa-regular fa-file-invoice" />
                            View Placement Record
                        </Link>
                        <Link
                            href="/portal/applications"
                            className="btn btn-ghost w-full sm:w-auto gap-2"
                            style={{ borderRadius: 0 }}
                        >
                            <i className="fa-duotone fa-regular fa-arrow-left" />
                            Back to Applications
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
