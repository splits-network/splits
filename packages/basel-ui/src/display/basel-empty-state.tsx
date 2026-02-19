"use client";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface BaselEmptyStateAction {
    /** Button label */
    label: string;
    /** DaisyUI button class (e.g. "btn-primary", "btn-ghost") */
    style?: string;
    /** FontAwesome icon class (optional) */
    icon?: string;
    /** Click handler */
    onClick?: () => void;
    /** Link href (renders as <a> instead of <button>) */
    href?: string;
}

export interface BaselEmptyStateStep {
    /** Step number (e.g. "01") */
    num: string;
    /** Step description */
    text: string;
}

export interface BaselEmptyStateProps {
    /** FontAwesome icon class for the large centered icon */
    icon: string;
    /** Icon color class (e.g. "text-primary") */
    iconColor?: string;
    /** Icon background color class (e.g. "bg-primary/10") */
    iconBg?: string;
    /** Main heading text */
    title: string;
    /** Subtitle text (displayed in semibold below title) */
    subtitle?: string;
    /** Description paragraph */
    description?: string;
    /** Action buttons */
    actions?: BaselEmptyStateAction[];
    /** Error code badge (e.g. "ERR_500_INTERNAL") */
    errorCode?: string;
    /** Onboarding steps (2-column grid) */
    steps?: BaselEmptyStateStep[];
    /** Suggestion items with lightbulb icons */
    suggestions?: string[];
    /** Additional className on the container */
    className?: string;
    /** Ref forwarded to the container for GSAP targeting */
    containerRef?: React.RefObject<HTMLDivElement | null>;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Basel empty state — centered composition with icon, title, subtitle,
 * description, optional error code badge, onboarding steps, suggestions,
 * and action buttons. Used for empty lists, error pages, permission blocks,
 * and first-time experiences.
 *
 * CSS hook: `.empty-state`
 */
export function BaselEmptyState({
    icon,
    iconColor = "text-primary",
    iconBg = "bg-primary/10",
    title,
    subtitle,
    description,
    actions,
    errorCode,
    steps,
    suggestions,
    className,
    containerRef,
}: BaselEmptyStateProps) {
    return (
        <div
            ref={containerRef}
            className={`empty-state bg-base-200 border border-base-300 p-10 lg:p-16 ${className || ""}`}
        >
            <div className="max-w-lg mx-auto text-center">
                {/* Icon */}
                <div
                    className={`w-20 h-20 ${iconBg} flex items-center justify-center mx-auto mb-6`}
                >
                    <i className={`${icon} ${iconColor} text-4xl`} />
                </div>

                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2">
                    {title}
                </h2>
                {subtitle && (
                    <p className="text-base font-semibold text-base-content/60 mb-3">
                        {subtitle}
                    </p>
                )}
                {description && (
                    <p className="text-sm text-base-content/50 leading-relaxed mb-8">
                        {description}
                    </p>
                )}

                {/* Error code */}
                {errorCode && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-error/10 text-error text-xs font-mono mb-6">
                        <i className="fa-duotone fa-regular fa-code" />
                        {errorCode}
                    </div>
                )}

                {/* Steps (onboarding) */}
                {steps && steps.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mb-8 text-left">
                        {steps.map((step) => (
                            <div
                                key={step.num}
                                className="flex items-center gap-3 p-3 bg-base-100 border border-base-300"
                            >
                                <span className="text-2xl font-black text-secondary/20">
                                    {step.num}
                                </span>
                                <span className="text-xs font-semibold text-base-content/60">
                                    {step.text}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Suggestions */}
                {suggestions && suggestions.length > 0 && (
                    <div className="text-left mb-8 p-4 bg-base-100 border border-base-300">
                        <p className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-3">
                            Suggestions
                        </p>
                        <div className="space-y-2">
                            {suggestions.map((s) => (
                                <div
                                    key={s}
                                    className="flex items-center gap-2 text-sm text-base-content/60"
                                >
                                    <i className="fa-duotone fa-regular fa-lightbulb text-primary text-xs" />
                                    {s}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                {actions && actions.length > 0 && (
                    <div className="flex flex-wrap gap-3 justify-center">
                        {actions.map((action) =>
                            action.href ? (
                                <a
                                    key={action.label}
                                    href={action.href}
                                    className={`btn btn-sm ${action.style || "btn-ghost"}`}
                                >
                                    {action.icon && (
                                        <i className={action.icon} />
                                    )}
                                    {action.label}
                                </a>
                            ) : (
                                <button
                                    key={action.label}
                                    type="button"
                                    onClick={action.onClick}
                                    className={`btn btn-sm ${action.style || "btn-ghost"}`}
                                >
                                    {action.icon && (
                                        <i className={action.icon} />
                                    )}
                                    {action.label}
                                </button>
                            ),
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
