"use client";

import type { Application } from "../../types";
import { offerSalaryDisplay } from "../../components/shared/helpers";

interface OfferSidebarProps {
    application: Application;
    currentStep: number;
}

export default function OfferSidebar({
    application,
    currentStep,
}: OfferSidebarProps) {
    const salary = offerSalaryDisplay(application);
    const company = application.job?.company;
    const recruiter = application.recruiter;

    return (
        <div className="space-y-6">
            {/* Company card */}
            <div className="bg-base-200 p-6">
                <div className="flex items-center gap-4 mb-4">
                    {company?.logo_url ? (
                        <img
                            src={company.logo_url}
                            alt={company.name || ""}
                            className="w-12 h-12 object-contain"
                        />
                    ) : (
                        <div className="w-12 h-12 flex items-center justify-center border-2 border-base-300 bg-base-100 font-bold text-sm">
                            {(company?.name || "?")
                                .split(/\s+/)
                                .map((w) => w[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                        </div>
                    )}
                    <div>
                        <p className="font-bold">{company?.name || "—"}</p>
                        {company?.industry && (
                            <p className="text-sm text-base-content/50">
                                {company.industry}
                            </p>
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    <div>
                        <p className="text-sm text-base-content/40">Position</p>
                        <p className="font-semibold">
                            {application.job?.title || "—"}
                        </p>
                    </div>
                    {salary && (
                        <div>
                            <p className="text-sm text-base-content/40">
                                Offer Salary
                            </p>
                            <p className="font-semibold text-success">
                                {salary}
                            </p>
                        </div>
                    )}
                    {application.job?.location && (
                        <div>
                            <p className="text-sm text-base-content/40">
                                Location
                            </p>
                            <p className="font-semibold">
                                {application.job.location}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recruiter card */}
            {recruiter && (
                <div className="bg-base-200 p-6">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                        Your Recruiter
                    </p>
                    <p className="font-bold">
                        {recruiter.user?.name || recruiter.name || "—"}
                    </p>
                    {recruiter.tagline && (
                        <p className="text-sm text-base-content/60 italic mt-1">
                            {recruiter.tagline}
                        </p>
                    )}
                    {(recruiter.user?.email || recruiter.email) && (
                        <a
                            href={`mailto:${recruiter.user?.email || recruiter.email}`}
                            className="inline-flex items-center gap-2 text-sm text-primary mt-3 hover:underline"
                        >
                            <i className="fa-duotone fa-regular fa-envelope" />
                            {recruiter.user?.email || recruiter.email}
                        </a>
                    )}
                    {recruiter.phone && (
                        <a
                            href={`tel:${recruiter.phone}`}
                            className="flex items-center gap-2 text-sm text-base-content/60 mt-1 hover:text-primary"
                        >
                            <i className="fa-duotone fa-regular fa-phone" />
                            {recruiter.phone}
                        </a>
                    )}
                </div>
            )}

            {/* Tip */}
            {currentStep < 2 && (
                <div className="bg-warning/5 border-l-4 border-warning p-4">
                    <p className="text-sm font-bold mb-1">
                        <i className="fa-duotone fa-regular fa-lightbulb text-warning mr-1" />
                        Take Your Time
                    </p>
                    <p className="text-sm text-base-content/60">
                        There's no rush. Review everything carefully and reach
                        out to your recruiter if you have questions.
                    </p>
                </div>
            )}
        </div>
    );
}
