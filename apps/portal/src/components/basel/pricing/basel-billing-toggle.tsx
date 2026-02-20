"use client";

interface BaselBillingToggleProps {
    isAnnual: boolean;
    onToggle: (isAnnual: boolean) => void;
    showSavingsBadge?: boolean;
}

export function BaselBillingToggle({
    isAnnual,
    onToggle,
    showSavingsBadge = false,
}: BaselBillingToggleProps) {
    return (
        <div className="inline-flex items-center justify-center">
            <div className="join">
                <button
                    className={`join-item btn btn-sm ${!isAnnual ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => onToggle(false)}
                >
                    Monthly
                </button>
                <button
                    className={`join-item btn btn-sm ${isAnnual ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => onToggle(true)}
                >
                    Annual
                    {showSavingsBadge && (
                        <span className="ml-2 px-2 py-0.5 bg-success/10 text-success text-[10px] font-bold uppercase tracking-wider">
                            Save 20%
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}
