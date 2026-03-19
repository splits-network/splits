"use client";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export type BaselAvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type BaselPresenceStatus = "online" | "idle" | "offline" | null;

export interface BaselAvatarProps {
    /** Initials to display when no image is provided */
    initials: string;
    /** Optional image URL */
    src?: string | null;
    /** Alt text for image */
    alt?: string;
    /** Size (default: "md" = 48px) */
    size?: BaselAvatarSize;
    /** Online presence status — shows a dot when provided */
    presence?: BaselPresenceStatus;
    /** Additional className on the outer wrapper */
    className?: string;
}

/* ─── Size config ────────────────────────────────────────────────────────── */

const sizeConfig: Record<
    BaselAvatarSize,
    {
        box: string;
        text: string;
        dot: string;
        dotBorder: string;
        dotOffset: string;
    }
> = {
    xs: {
        box: "w-8 h-8",
        text: "text-xs",
        dot: "w-2.5 h-2.5",
        dotBorder: "border-[1.5px]",
        dotOffset: "-bottom-0.5 -right-0.5",
    },
    sm: {
        box: "w-9 h-9",
        text: "text-sm",
        dot: "w-3 h-3",
        dotBorder: "border-2",
        dotOffset: "-bottom-0.5 -right-0.5",
    },
    md: {
        box: "w-12 h-12",
        text: "text-base",
        dot: "w-3.5 h-3.5",
        dotBorder: "border-[2.5px]",
        dotOffset: "-bottom-0.5 -right-0.5",
    },
    lg: {
        box: "w-16 h-16",
        text: "text-xl",
        dot: "w-4 h-4",
        dotBorder: "border-[3px]",
        dotOffset: "-bottom-0.5 -right-0.5",
    },
    xl: {
        box: "w-20 h-20",
        text: "text-2xl",
        dot: "w-4 h-4",
        dotBorder: "border-[3px]",
        dotOffset: "-bottom-1 -right-1",
    },
};

const presenceColor: Record<string, string> = {
    online: "bg-success",
    idle: "bg-warning",
    offline: "bg-base-content/20",
};

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Basel avatar — initials or image with optional presence dot.
 *
 * Zero border-radius, presence indicator bottom-right.
 * Designed to free the avatar surface for presence only —
 * gamification LevelBadge belongs in the metadata row.
 */
export function BaselAvatar({
    initials,
    src,
    alt,
    size = "md",
    presence,
    className,
}: BaselAvatarProps) {
    const cfg = sizeConfig[size];

    return (
        <div className={`relative shrink-0 ${className || ""}`}>
            {src ? (
                <img
                    src={src}
                    alt={alt || initials}
                    className={`${cfg.box} object-contain border border-base-300`}
                />
            ) : (
                <div
                    className={`${cfg.box} bg-primary text-primary-content flex items-center justify-center ${cfg.text} font-black tracking-tight select-none`}
                >
                    {initials}
                </div>
            )}
            {presence && (
                <span
                    className={`absolute ${cfg.dotOffset} ${cfg.dot} ${cfg.dotBorder} border-base-100 ${presenceColor[presence]}`}
                    title={
                        presence === "online"
                            ? "Online"
                            : presence === "idle"
                              ? "Away"
                              : "Offline"
                    }
                />
            )}
        </div>
    );
}
