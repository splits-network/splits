"use client";

interface ReadinessChecklistProps {
    billingConfigured: boolean;
    payoutConfigured: boolean;
}

export function ReadinessChecklist({ billingConfigured, payoutConfigured }: ReadinessChecklistProps) {
    return (
        <div className="bg-base-100 border border-base-300 p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 shrink-0">
                Setup
            </span>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                <ChecklistItem done={billingConfigured} label="Payments You Send" />
                <ChecklistItem done={payoutConfigured} label="Payments You Receive" />
            </div>
        </div>
    );
}

function ChecklistItem({ done, label }: { done: boolean; label: string }) {
    return (
        <div className="flex items-center gap-2 text-sm">
            <span
                className={`w-[18px] h-[18px] flex items-center justify-center text-[10px] ${
                    done
                        ? "bg-success/10 border-2 border-success text-success"
                        : "border-2 border-base-300"
                }`}
            >
                {done && <i className="fa-duotone fa-regular fa-check" />}
            </span>
            <span className="text-base-content/60">
                {label} —{" "}
                {done ? (
                    <span className="font-semibold text-success">Configured</span>
                ) : (
                    <span className="text-base-content/40">Not configured</span>
                )}
            </span>
        </div>
    );
}

export function OrientationStrip() {
    return (
        <div className="bg-base-100 border border-base-300 p-5">
            <h2 className="text-base font-bold mb-1">
                Manage how money moves in and out of your firm.
            </h2>
            <p className="text-sm text-base-content/60 mb-4">
                Your firm handles two sides of every transaction on the platform.
                When you post roles for off-platform companies, you pay the recruiters
                who fill them. When your recruiters make placements, your firm collects
                its share. Set up both below.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-primary/5 border border-primary/20 p-3 flex items-center gap-3">
                    <i className="fa-duotone fa-regular fa-arrow-up-from-bracket text-primary text-lg shrink-0" />
                    <span className="text-sm font-mono tracking-wide text-primary">
                        YOUR FIRM → pays commission → PARTNER
                    </span>
                </div>
                <div className="bg-secondary/5 border border-secondary/20 p-3 flex items-center gap-3">
                    <i className="fa-duotone fa-regular fa-arrow-down-to-bracket text-secondary text-lg shrink-0" />
                    <span className="text-sm font-mono tracking-wide text-secondary">
                        PLACEMENTS → admin take → YOUR FIRM
                    </span>
                </div>
            </div>
        </div>
    );
}
