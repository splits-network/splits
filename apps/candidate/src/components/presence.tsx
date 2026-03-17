type PresenceProps = {
    status?: "online" | "idle" | "offline" | null;
    size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
    variant?: "dot" | "badge" | "both" | "icon";
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
    const isOnline = status === "online";
    const isIdle = status === "idle";
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
    const statusLabel = label ?? (isOnline ? "Online" : isIdle ? "Idle" : "Offline");
    const badgeSizeClass = size === "xs" ? "badge-xs" : size === "sm" ? "badge-sm" : size === "lg" ? "badge-lg" : "";

    if (variant === "icon") {
        const iconSizeClass = size === "xs" ? "text-[0.45rem]" : size === "sm" ? "text-[0.5rem]" : "text-xs";
        const colorClass = isOnline
            ? "text-success"
            : isIdle
              ? "text-warning"
              : "text-base-content/20";

        return (
            <span
                className={`tooltip tooltip-bottom inline-flex items-center justify-center ${className}`}
                data-tip={statusLabel}
                aria-label={statusLabel}
            >
                <i
                    className={`fa-solid fa-circle ${iconSizeClass} ${colorClass} ${
                        isOnline ? "animate-pulse" : ""
                    }`}
                />
            </span>
        );
    }

    if (variant === "both") {
        return (
            <div className={`indicator ${className}`}>
                <span className="indicator-item">
                    <span
                        className={`${statusClass} ${sizeClass} ${
                            isOnline ? "animate-pulse" : ""
                        }`}
                    />
                </span>
                <span
                    className={`badge ${badgeSizeClass} ${isActive ? "badge-outline badge-success badge-soft" : ""} gap-2`}
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
                className={`badge ${badgeSizeClass} ${isActive ? "badge-outline badge-success badge-soft" : ""} gap-2 ${className}`}
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
                isActive ? (isOnline ? "animate-pulse" : "") : "hidden"
            } ${className}`}
            aria-label={statusLabel}
            title={statusLabel}
        />
    );
}
