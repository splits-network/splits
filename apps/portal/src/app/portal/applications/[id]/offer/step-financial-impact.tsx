"use client";

interface StepFinancialImpactProps {
    salary: string;
    startDate: string;
    feePercentage: number | null;
    guaranteeDays: number;
}

export default function StepFinancialImpact({
    salary,
    startDate,
    feePercentage,
    guaranteeDays,
}: StepFinancialImpactProps) {
    const parsedSalary = parseFloat(salary) || 0;
    const placementFee =
        feePercentage != null ? Math.round((parsedSalary * feePercentage) / 100) : null;

    const guaranteeExpires = startDate
        ? (() => {
              const date = new Date(startDate);
              date.setDate(date.getDate() + guaranteeDays);
              return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
              });
          })()
        : null;

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
        }).format(amount);

    return (
        <div>
            <h2 className="text-2xl font-black tracking-tight mb-1">
                Financial Impact
            </h2>
            <p className="text-sm text-base-content/50 mb-8">
                Review the estimated placement fee and guarantee terms.
            </p>

            {/* Fee Calculation */}
            <div className="bg-base-200 p-6 mb-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-4">
                    Fee Calculation
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-base-300 pb-3">
                        <span className="text-sm text-base-content/60">Annual Salary</span>
                        <span className="font-semibold">{formatCurrency(parsedSalary)}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-base-300 pb-3">
                        <span className="text-sm text-base-content/60">Fee Percentage</span>
                        {feePercentage != null ? (
                            <span className="font-semibold">{feePercentage}%</span>
                        ) : (
                            <span className="badge badge-warning">Not configured</span>
                        )}
                    </div>
                    <div className="flex items-center justify-between border-b border-base-300 pb-3">
                        <span className="text-sm text-base-content/60">
                            Estimated Placement Fee
                        </span>
                        {placementFee != null ? (
                            <span className="text-lg font-black text-primary">
                                {formatCurrency(placementFee)}
                            </span>
                        ) : (
                            <span className="text-sm text-base-content/40">N/A</span>
                        )}
                    </div>
                    <div className="flex items-center justify-between border-b border-base-300 pb-3">
                        <span className="text-sm text-base-content/60">Guarantee Period</span>
                        <span className="font-semibold">{guaranteeDays} days</span>
                    </div>
                    {guaranteeExpires && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-base-content/60">
                                Guarantee Expires
                            </span>
                            <span className="font-semibold">{guaranteeExpires}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* What This Means */}
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-4">
                What This Means
            </h3>
            <div className="space-y-4">
                {[
                    {
                        icon: "fa-duotone fa-regular fa-bell",
                        text: "When you extend this offer, the candidate and their recruiter will be notified.",
                    },
                    {
                        icon: "fa-duotone fa-regular fa-handshake",
                        text: "If the candidate accepts and is marked as hired, a placement record will be created.",
                    },
                    {
                        icon: "fa-duotone fa-regular fa-calculator",
                        text: "The placement fee shown above is an estimate based on the job's fee configuration.",
                    },
                ].map((item) => (
                    <div
                        key={item.text}
                        className="flex items-start gap-3 border-l-4 border-base-300 pl-4 py-2"
                    >
                        <i className={`${item.icon} text-primary mt-0.5`} />
                        <p className="text-sm text-base-content/60 leading-relaxed">
                            {item.text}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
