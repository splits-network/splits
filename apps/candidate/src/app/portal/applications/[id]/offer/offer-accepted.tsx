"use client";

import Link from "next/link";
import type { Application } from "../../types";
import { offerSalaryDisplay } from "../../components/shared/helpers";

interface OfferAcceptedProps {
    application: Application;
}

export default function OfferAccepted({ application }: OfferAcceptedProps) {
    const salary = offerSalaryDisplay(application);
    const company = application.job?.company?.name || "the company";
    const jobTitle = application.job?.title || "the position";
    const recruiterName =
        application.recruiter?.user?.name || application.recruiter?.name;

    return (
        <main className="min-h-[70vh] flex items-center justify-center p-6">
            <div className="max-w-2xl w-full text-center">
                {/* Hero icon */}
                <div className="w-20 h-20 bg-success/10 flex items-center justify-center mx-auto mb-6">
                    <i className="fa-duotone fa-regular fa-party-horn text-success text-4xl" />
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
                    Congratulations!
                </h1>
                <p className="text-base text-base-content/60 max-w-lg mx-auto mb-10">
                    You've accepted the offer for the{" "}
                    <strong className="text-base-content">{jobTitle}</strong>{" "}
                    position at{" "}
                    <strong className="text-base-content">{company}</strong>.
                </p>

                {/* Summary */}
                <div className="bg-base-200 p-6 mb-8 text-left">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-4">
                        Offer Summary
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-base-content/50">
                                Position
                            </p>
                            <p className="font-semibold">{jobTitle}</p>
                        </div>
                        <div>
                            <p className="text-sm text-base-content/50">
                                Company
                            </p>
                            <p className="font-semibold">{company}</p>
                        </div>
                        {salary && (
                            <div>
                                <p className="text-sm text-base-content/50">
                                    Salary
                                </p>
                                <p className="font-semibold text-success">
                                    {salary}
                                </p>
                            </div>
                        )}
                        {recruiterName && (
                            <div>
                                <p className="text-sm text-base-content/50">
                                    Your Recruiter
                                </p>
                                <p className="font-semibold">{recruiterName}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Next steps */}
                <div className="bg-base-200 border-l-4 border-info p-6 mb-10 text-left">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-4">
                        What Happens Next
                    </p>
                    <div className="space-y-3">
                        {[
                            `${company} has been notified and will begin the hiring process`,
                            recruiterName
                                ? `${recruiterName} will be in touch to guide you through onboarding`
                                : "Your recruiter will guide you through next steps",
                            "You'll receive updates as the process progresses",
                            "Keep an eye on your notifications and messages",
                        ].map((item) => (
                            <div key={item} className="flex items-start gap-3">
                                <i className="fa-duotone fa-regular fa-circle-check text-info mt-0.5" />
                                <p className="text-sm text-base-content/70 leading-relaxed">
                                    {item}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="flex items-center justify-center gap-4">
                    <Link
                        href={`/portal/applications?applicationId=${application.id}`}
                        className="btn btn-primary"
                        style={{ borderRadius: 0 }}
                    >
                        <i className="fa-duotone fa-regular fa-eye" />
                        View Application
                    </Link>
                    <Link
                        href="/portal/applications"
                        className="btn btn-ghost"
                        style={{ borderRadius: 0 }}
                    >
                        Back to Applications
                    </Link>
                </div>
            </div>
        </main>
    );
}
