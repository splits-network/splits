"use client";

interface Alert {
    label: string;
    count: number;
    color: "error" | "warning" | "info";
    icon: string;
}

interface UrgencyAlertsProps {
    alerts: Alert[];
    className?: string;
}

/**
 * Role-aware urgency alerts strip.
 * Renders nothing if no alerts have non-zero counts.
 */
export function UrgencyAlerts({ alerts, className }: UrgencyAlertsProps) {
    const active = alerts.filter((a) => a.count > 0);
    if (active.length === 0) return null;

    const colorMap = {
        error: "bg-error/10 text-error border-error/20",
        warning: "bg-warning/10 text-warning border-warning/20",
        info: "bg-info/10 text-info border-info/20",
    };

    return (
        <div className={`flex flex-wrap gap-2 ${className || ""}`}>
            {active.map((alert) => (
                <div
                    key={alert.label}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 border text-xs font-semibold ${colorMap[alert.color]}`}
                >
                    <i className={`${alert.icon} text-[10px]`} />
                    <span>{alert.count}</span>
                    <span className="opacity-70">{alert.label}</span>
                </div>
            ))}
        </div>
    );
}
