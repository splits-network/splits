"use client";

import { useState } from "react";
import type { Application } from "../../types";
import { offerSalaryDisplay } from "../../components/shared/helpers";

interface StepAcceptProps {
    application: Application;
    processing: boolean;
    onAccept: () => Promise<void>;
}

export default function StepAccept({
    application,
    processing,
    onAccept,
}: StepAcceptProps) {
    const [confirmed, setConfirmed] = useState(false);
    const salary = offerSalaryDisplay(application);
    const company = application.job?.company?.name || "the company";
    const jobTitle = application.job?.title || "the position";

    return (
        <div>
            <h2 className="text-2xl font-black tracking-tight mb-1">
                Accept Offer
            </h2>
            <p className="text-sm text-base-content/50 mb-8">
                Confirm that you'd like to accept this offer.
            </p>

            {/* Summary card */}
            <div className="bg-base-200 p-6 mb-8">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40 mb-4">
                    Offer Summary
                </p>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-base-content/50">Position</p>
                        <p className="font-bold">{jobTitle}</p>
                    </div>
                    <div>
                        <p className="text-sm text-base-content/50">Company</p>
                        <p className="font-bold">{company}</p>
                    </div>
                    {salary && (
                        <div>
                            <p className="text-sm text-base-content/50">
                                Salary
                            </p>
                            <p className="font-bold text-success">{salary}</p>
                        </div>
                    )}
                    {application.job?.location && (
                        <div>
                            <p className="text-sm text-base-content/50">
                                Location
                            </p>
                            <p className="font-bold">
                                {application.job.location}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* What accepting means */}
            <div className="bg-base-200 border-l-4 border-primary p-6 mb-8">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                    What happens when you accept
                </p>
                <div className="space-y-3">
                    {[
                        `${company} and your recruiter will be notified of your acceptance`,
                        "The company will begin the formal hiring process",
                        "Your recruiter will guide you through next steps",
                        "This does not constitute a legally binding agreement",
                    ].map((item) => (
                        <div key={item} className="flex items-start gap-3">
                            <i className="fa-duotone fa-regular fa-circle-check text-primary mt-0.5" />
                            <p className="text-sm text-base-content/70 leading-relaxed">
                                {item}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Confirmation checkbox */}
            <label className="flex items-start gap-3 cursor-pointer mb-8 p-4 border-2 border-base-300 hover:border-primary transition-colors">
                <input
                    type="checkbox"
                    className="checkbox checkbox-primary mt-0.5"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                />
                <span className="text-sm leading-relaxed">
                    I have reviewed the offer details
                    {application.documents?.some((d) =>
                        [
                            "offer_letter",
                            "employment_contract",
                            "benefits_summary",
                        ].includes(d.document_type || ""),
                    )
                        ? " and attached documents"
                        : ""}
                    , and I'd like to accept this offer for the{" "}
                    <strong>{jobTitle}</strong> position at{" "}
                    <strong>{company}</strong>.
                </span>
            </label>

            {/* Accept button */}
            <button
                onClick={onAccept}
                disabled={!confirmed || processing}
                className="btn btn-success btn-lg w-full gap-3"
                style={{ borderRadius: 0 }}
            >
                {processing ? (
                    <>
                        <span className="loading loading-spinner loading-sm" />
                        Accepting Offer...
                    </>
                ) : (
                    <>
                        <i className="fa-duotone fa-regular fa-check-double" />
                        Accept Offer
                    </>
                )}
            </button>
        </div>
    );
}
