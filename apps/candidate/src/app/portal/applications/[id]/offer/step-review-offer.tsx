"use client";

import type { Application } from "../../types";
import { offerSalaryDisplay } from "../../components/shared/helpers";

interface StepReviewOfferProps {
    application: Application;
}

export default function StepReviewOffer({ application }: StepReviewOfferProps) {
    const salary = offerSalaryDisplay(application);
    const job = application.job;
    const company = job?.company;

    return (
        <div>
            <h2 className="text-2xl font-black tracking-tight mb-1">
                Your Offer
            </h2>
            <p className="text-sm text-base-content/50 mb-8">
                Review the details of the offer extended to you.
            </p>

            {/* Offer details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[2px] bg-base-300 mb-8">
                {salary && (
                    <div className="bg-base-100 p-6">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Offer Salary
                        </p>
                        <p className="text-3xl font-black tracking-tight text-success">
                            {salary}
                        </p>
                    </div>
                )}
                <div className="bg-base-100 p-6">
                    <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                        Position
                    </p>
                    <p className="text-xl font-black tracking-tight">
                        {job?.title || "—"}
                    </p>
                </div>
                <div className="bg-base-100 p-6">
                    <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                        Company
                    </p>
                    <p className="text-lg font-bold">{company?.name || "—"}</p>
                    {company?.industry && (
                        <p className="text-sm text-base-content/50">
                            {company.industry}
                        </p>
                    )}
                </div>
                <div className="bg-base-100 p-6">
                    <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                        Location
                    </p>
                    <p className="text-lg font-bold">
                        {job?.location || "—"}
                    </p>
                    {job?.employment_type && (
                        <p className="text-sm text-base-content/50 capitalize">
                            {job.employment_type.replace(/_/g, " ")}
                        </p>
                    )}
                </div>
                {application.start_date && (
                    <div className="bg-base-100 p-6">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Start Date
                        </p>
                        <p className="text-lg font-bold">
                            {new Date(application.start_date + "T00:00:00").toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                    </div>
                )}
            </div>

            {/* Recruiter info */}
            {application.recruiter?.name && (
                <div className="bg-base-200 p-6 mb-6">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                        <i className="fa-duotone fa-regular fa-user-tie mr-2" />
                        Your Recruiter
                    </p>
                    <p className="font-bold">
                        {application.recruiter.user?.name ||
                            application.recruiter.name}
                    </p>
                    {application.recruiter.tagline && (
                        <p className="text-sm text-base-content/60 italic mt-1">
                            {application.recruiter.tagline}
                        </p>
                    )}
                    <p className="text-sm text-base-content/50 mt-2">
                        Your recruiter can help you understand the offer,
                        negotiate terms, and guide you through the process.
                    </p>
                </div>
            )}

            {/* Job description snippet */}
            {(job?.candidate_description || job?.description) && (
                <div>
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                        About the Role
                    </p>
                    <p className="text-sm text-base-content/70 leading-relaxed line-clamp-6">
                        {job.candidate_description || job.description}
                    </p>
                </div>
            )}
        </div>
    );
}
