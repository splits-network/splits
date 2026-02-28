interface FactorCardProps {
    icon: string;
    label: string;
    passed: boolean;
    detail?: string;
}

export function FactorCard({ icon, label, passed, detail }: FactorCardProps) {
    return (
        <div
            className={`card bg-base-100 border ${
                passed ? "border-success/30" : "border-error/30"
            } p-4`}
        >
            <div className="flex items-start gap-3">
                <div
                    className={`rounded-full p-2 ${
                        passed ? "bg-success/10 text-success" : "bg-error/10 text-error"
                    }`}
                >
                    <i className={`fa-duotone fa-regular ${icon}`}></i>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm">{label}</span>
                        <span className={`badge badge-sm ${passed ? "badge-success" : "badge-error"}`}>
                            {passed ? "Met" : "Gap"}
                        </span>
                    </div>
                    {detail && (
                        <p className="text-sm text-base-content/60 mt-1">{detail}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
