"use client";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface BaselTimelineItemData {
    /** User initials for the square avatar */
    initials: string;
    /** Background color class for the avatar (e.g. "bg-primary") */
    avatarBg?: string;
    /** User name displayed in bold */
    user: string;
    /** Action description */
    action: string;
    /** Timestamp string */
    time: string;
    /** Optional FontAwesome icon class next to the user name */
    icon?: string;
    /** Optional icon color class */
    iconColor?: string;
}

export interface BaselTimelineProps {
    /** Array of timeline items */
    items: BaselTimelineItemData[];
    /** Additional className on the container */
    className?: string;
    /** Ref forwarded to the container for GSAP targeting */
    containerRef?: React.RefObject<HTMLDivElement | null>;
}

export interface BaselTimelineItemProps extends BaselTimelineItemData {
    /** Whether to show the connector line to the next item */
    showConnector?: boolean;
}

/* ─── TimelineItem ───────────────────────────────────────────────────────── */

/**
 * Basel timeline item — square avatar node with connector line, user name,
 * action description, and timestamp.
 */
export function BaselTimelineItem({
    initials,
    avatarBg = "bg-primary",
    user,
    action,
    time,
    icon,
    iconColor,
    showConnector = true,
}: BaselTimelineItemProps) {
    return (
        <div className="flex gap-4 pb-6 relative">
            {showConnector && (
                <div className="absolute left-[18px] top-10 bottom-0 w-px bg-base-300" />
            )}
            <div
                className={`w-9 h-9 ${avatarBg} text-white flex items-center justify-center font-bold text-xs flex-shrink-0 z-10`}
            >
                {initials}
            </div>
            <div className="flex-1 pt-1">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold">{user}</span>
                    {icon && (
                        <i
                            className={`${icon} text-xs ${iconColor || ""}`}
                        />
                    )}
                </div>
                <p className="text-sm text-base-content/60">{action}</p>
                <p className="text-[10px] text-base-content/30 mt-1">{time}</p>
            </div>
        </div>
    );
}

/* ─── Timeline ───────────────────────────────────────────────────────────── */

/**
 * Basel timeline — vertical timeline with connector lines and square avatar
 * nodes. Used in detail activity tabs and dashboard activity feeds.
 */
export function BaselTimeline({
    items,
    className,
    containerRef,
}: BaselTimelineProps) {
    return (
        <div ref={containerRef} className={`space-y-0 ${className || ""}`}>
            {items.map((item, i) => (
                <BaselTimelineItem
                    key={`${item.user}-${item.time}-${i}`}
                    {...item}
                    showConnector={i < items.length - 1}
                />
            ))}
        </div>
    );
}
