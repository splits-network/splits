"use client";

import type { Job } from "../../types";
import { salaryDisplay } from "./helpers";
import { BaselCalculator } from "@/components/basel/pricing/basel-calculator";

export function FinancialsTab({ job }: { job: Job }) {
    const salary = salaryDisplay(job);

    return (
        <div className="space-y-6">
            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-[2px] bg-base-300">
                <div className="bg-base-100 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-1">
                        <i className="fa-duotone fa-regular fa-sack-dollar text-success mr-1" />
                        Compensation
                    </p>
                    <p className="text-lg font-black tracking-tight">
                        {salary || "N/A"}
                    </p>
                </div>
                <div className="bg-base-100 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-1">
                        <i className="fa-duotone fa-regular fa-percent text-primary mr-1" />
                        Fee
                    </p>
                    <p className="text-lg font-black tracking-tight text-primary">
                        {job.fee_percentage}%
                    </p>
                </div>
                {job.guarantee_days !== undefined &&
                    job.guarantee_days !== null && (
                        <div className="bg-base-100 p-4">
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-1">
                                <i className="fa-duotone fa-regular fa-shield-halved text-info mr-1" />
                                Guarantee
                            </p>
                            <p className="text-lg font-black tracking-tight">
                                {job.guarantee_days} days
                            </p>
                        </div>
                    )}
            </div>

            {/* Calculator */}
            <div className="border-l-4 border-l-primary bg-base-100 shadow-sm p-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                    <i className="fa-duotone fa-regular fa-calculator mr-2" />
                    Payout Calculator
                </h3>
                <BaselCalculator
                    variant="compact"
                    initialSalary={job.salary_max || job.salary_min}
                    initialFeePercentage={job.fee_percentage}
                    lockFee
                />
            </div>
        </div>
    );
}
