type PresenceProps = {
    status?: "online" | "idle" | "offline" | null;
    size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
    variant?: "dot" | "badge" | "both";
    label?: string;
    className?: string;
};

export function Presence({
    status = "offline",
    size = "md",
    variant = "dot",
    label,
    className = "",
}: PresenceProps) {
    const isActive = status === "online" || status === "idle";
    const statusClass = isActive ? "status status-success" : "status status-neutral";
    const sizeClass =
        size === "2xl"
            ? "status-2xl"
            : size === "xl"
              ? "status-xl"
              : size === "lg"
                ? "status-lg"
                : size === "md"
                  ? "status-md"
                  : size === "sm"
                    ? "status-sm"
                    : "status-xs";
    const statusLabel = label ?? (isActive ? "Online" : "Offline");

    if (variant === "both") {
        return (
            <div className={`indicator ${className}`}>
                <span className="indicator-item">
                    <span
                        className={`${statusClass} ${sizeClass} ${
                            status === "online" ? "animate-pulse" : ""
                        }`}
                    />
                </span>
                <span
                    className={`badge badge-sm ${isActive ? "badge-outline badge-success badge-soft" : ""} gap-2}`}
                    aria-label={statusLabel}
                    title={statusLabel}
                >
                    {statusLabel}
                </span>
            </div>
        );
    }

    if (variant === "badge") {
        return (
            <span
                className={`badge badge-sm ${isActive ? "badge-outline badge-success badge-soft" : ""} gap-2} ${className}`}
                aria-label={statusLabel}
                title={statusLabel}
            >
                {statusLabel}
            </span>
        );
    }

    return (
        <span
            className={`${statusClass} ${sizeClass} ${
                isActive ? (status === "online" ? "animate-pulse" : "") : "hidden"
            } ${className}`}
            aria-label={statusLabel}
            title={statusLabel}
        />
    );
}
