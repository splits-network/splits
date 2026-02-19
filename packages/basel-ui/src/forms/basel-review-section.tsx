"use client";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface BaselReviewItem {
    /** Label displayed above the value */
    label: string;
    /** Value text */
    value?: string;
}

export interface BaselReviewSectionProps {
    /** Section title (e.g. "Basics", "Details") */
    title: string;
    /** Key-value pairs to display in the review grid */
    items: BaselReviewItem[];
    /** Called when the "Edit" link is clicked (renders the link when provided) */
    onEdit?: () => void;
    /** Additional className on the container */
    className?: string;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Basel review section — review card with title, optional "Edit" link, and a
 * 2-column grid of label/value pairs. Used in form review steps and wizards.
 */
export function BaselReviewSection({
    title,
    items,
    onEdit,
    className,
}: BaselReviewSectionProps) {
    return (
        <div
            className={`border border-base-300 bg-base-200 ${className || ""}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-base-300">
                <h3 className="text-sm font-black uppercase tracking-wider">
                    {title}
                </h3>
                {onEdit && (
                    <button
                        type="button"
                        onClick={onEdit}
                        className="text-xs text-primary font-semibold hover:underline"
                    >
                        Edit
                    </button>
                )}
            </div>
            {/* Body grid */}
            <div className="p-4 grid grid-cols-2 gap-3">
                {items.map((item) => (
                    <div key={item.label}>
                        <span className="text-[10px] uppercase tracking-widest text-base-content/40">
                            {item.label}
                        </span>
                        <p className="text-sm font-semibold truncate">
                            {item.value || "Not set"}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
