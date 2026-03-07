"use client";

import Link from "next/link";

interface OfferExtendedProps {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    salary: number;
    applicationId: string;
}

export default function OfferExtended({
    candidateName,
    jobTitle,
    companyName,
    salary,
    applicationId,
}: OfferExtendedProps) {
    const formattedSalary = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(salary);

    return (
        <main className="min-h-[70vh] flex items-center justify-center p-6">
            <div className="max-w-2xl w-full text-center">
                {/* Hero Icon */}
                <div className="w-20 h-20 bg-success/10 flex items-center justify-center mx-auto mb-6">
                    <i className="fa-duotone fa-regular fa-champagne-glasses text-success text-4xl" />
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
                    Offer Extended
                </h1>
                <p className="text-base text-base-content/60 max-w-lg mx-auto mb-10">
                    The formal offer has been extended to{" "}
                    <strong className="text-base-content">{candidateName}</strong> for the{" "}
                    <strong className="text-base-content">{jobTitle}</strong> position at{" "}
                    <strong className="text-base-content">{companyName}</strong>.
                </p>

                {/* Offer Summary */}
                <div className="bg-base-200 p-6 mb-8 text-left">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-4">
                        Offer Summary
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-base-content/50">Candidate</p>
                            <p className="font-semibold">{candidateName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-base-content/50">Position</p>
                            <p className="font-semibold">{jobTitle}</p>
                        </div>
                        <div>
                            <p className="text-sm text-base-content/50">Company</p>
                            <p className="font-semibold">{companyName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-base-content/50">Annual Salary</p>
                            <p className="font-semibold text-success">{formattedSalary}</p>
                        </div>
                    </div>
                </div>

                {/* What Happens Next */}
                <div className="bg-base-200 border-l-4 border-info p-6 mb-10 text-left">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-4">
                        What Happens Next
                    </p>
                    <div className="space-y-3">
                        {[
                            "The candidate will receive a notification about this offer",
                            "The recruiter has been informed and can assist with negotiations",
                            "The application has moved to the Offer stage",
                            "When the candidate accepts, you can mark them as hired to create a placement record",
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

                {/* CTA Buttons */}
                <div className="flex items-center justify-center gap-4">
                    <Link
                        href={`/portal/applications?applicationId=${applicationId}`}
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
