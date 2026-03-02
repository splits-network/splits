"use client";

interface ReadinessChecklistProps {
    profileConfigured: boolean;
    paymentMethodConfigured: boolean;
}

export function ReadinessChecklist({
    profileConfigured,
    paymentMethodConfigured,
}: ReadinessChecklistProps) {
    return (
        <div className="bg-base-100 border border-base-300 p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 shrink-0">
                Setup
            </span>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                <ChecklistItem done={profileConfigured} label="Billing Profile" />
                <ChecklistItem done={paymentMethodConfigured} label="Payment Method" />
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
                How placement billing works
            </h2>
            <p className="text-sm text-base-content/60 mb-4">
                When a recruiter fills one of your open roles, your company pays the
                placement fee. Set up your billing profile and payment method so
                invoices can be processed automatically.
            </p>
            <div className="bg-primary/5 border border-primary/20 p-3 flex items-center gap-3">
                <i className="fa-duotone fa-regular fa-arrow-up-from-bracket text-primary text-lg shrink-0" />
                <span className="text-sm font-mono tracking-wide text-primary">
                    PLACEMENT CONFIRMED → invoice created → YOUR COMPANY PAYS
                </span>
            </div>
        </div>
    );
}
