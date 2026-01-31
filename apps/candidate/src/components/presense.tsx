type PresenceProps = {
    status?: "online" | "offline" | null;
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
    const statusClass =
        status === "online" ? "status status-success" : "status status-neutral";
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
    const statusLabel = label ?? (status === "online" ? "Online" : "Offline");

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
                    className={`badge badge-sm ${status === "online" ? "badge-outline badge-success badge-soft" : ""} gap-2}`}
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
                className={`badge badge-sm ${status === "online" ? "badge-outline badge-success badge-soft" : ""} gap-2} ${className}`}
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
                status === "online" ? "animate-pulse" : ""
            } ${className}`}
            aria-label={statusLabel}
            title={statusLabel}
        />
    );
}

