"use client";

/**
 * PricingCard Component
 * Reusable pricing card for plan display and selection
 */

import { PricingCardProps } from "./types";

export function PricingCard({
    plan,
    isSelected = false,
    onSelect,
    isAnnual = false,
    variant = "default",
    disabled = false,
}: PricingCardProps) {
    const { features } = plan;
    const isPopular = features.is_popular;
    const isFree = plan.price_cents === 0;

    // Calculate display price
    const displayPrice =
        isAnnual && features.annual_price_cents
            ? Math.round(features.annual_price_cents / 12 / 100)
            : Math.round(plan.price_cents / 100);

    const isCompact = variant === "compact";

    // Determine styles based on selection and popularity
    const cardClasses = isPopular
        ? `card shadow-lg ${isSelected ? "ring-4 ring-primary" : ""} ${isCompact ? "" : "scale-105"} bg-primary text-primary-content`
        : `card shadow ${isSelected ? "ring-4 ring-primary" : ""} bg-base-200`;

    const badgeClass = isPopular
        ? "badge badge-secondary"
        : plan.tier === "partner"
          ? "badge badge-accent"
          : "badge badge-primary";

    const checkIconClass = isPopular ? "text-secondary" : "text-success";
    const xIconClass = isPopular ? "opacity-50" : "text-base-content/50";
    const priceSubtextClass = isPopular ? "opacity-80" : "text-base-content/60";
    const subtitleClass = isPopular ? "opacity-90" : "text-base-content/70";

    // Limit features in compact mode
    const maxIncludedFeatures = isCompact ? 4 : features.included.length;
    const maxNotIncludedFeatures = isCompact ? 2 : features.not_included.length;

    const handleClick = () => {
        if (!disabled && onSelect) {
            onSelect(plan);
        }
    };

    return (
        <div
            className={`${cardClasses} ${onSelect && !disabled ? "cursor-pointer hover:shadow-xl transition-shadow" : ""}`}
            onClick={handleClick}
            role={onSelect ? "button" : undefined}
            tabIndex={onSelect && !disabled ? 0 : undefined}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleClick();
                }
            }}
        >
            <div className={`card-body ${isCompact ? "p-4" : ""}`}>
                {/* Badge */}
                <div className={badgeClass}>
                    {isPopular ? "MOST POPULAR" : plan.name.toUpperCase()}
                </div>

                {/* Price */}
                <h3
                    className={`card-title ${isCompact ? "text-2xl" : "text-3xl"} mb-2`}
                >
                    {isFree ? (
                        "Free"
                    ) : (
                        <>
                            ${displayPrice}
                            <span
                                className={`${isCompact ? "text-sm" : "text-lg"} font-normal ${priceSubtextClass}`}
                            >
                                /month
                            </span>
                        </>
                    )}
                </h3>

                {/* Annual savings badge */}
                {!isFree && isAnnual && features.annual_savings_text && (
                    <div className="badge badge-success badge-sm mb-2">
                        {features.annual_savings_text}
                    </div>
                )}

                {/* Headline/Subheadline (default variant only) */}
                {!isCompact && (
                    <p className={`${subtitleClass} mb-4`}>
                        {features.subheadline}
                    </p>
                )}

                <div className="divider my-2"></div>

                {/* Features List */}
                <ul className={`space-y-2 ${isCompact ? "text-sm" : ""} mb-4`}>
                    {/* Included features */}
                    {features.included
                        .slice(0, maxIncludedFeatures)
                        .map((feature, index) => (
                            <li
                                key={`included-${index}`}
                                className="flex items-start gap-2"
                            >
                                <i
                                    className={`fa-duotone fa-regular fa-check ${checkIconClass} mt-0.5 flex-shrink-0`}
                                ></i>
                                <span>{feature}</span>
                            </li>
                        ))}

                    {/* Show more indicator in compact mode */}
                    {isCompact &&
                        features.included.length > maxIncludedFeatures && (
                            <li className="flex items-start gap-2 opacity-70">
                                <i
                                    className={`fa-duotone fa-regular fa-plus mt-0.5 flex-shrink-0 ${checkIconClass}`}
                                ></i>
                                <span>
                                    {features.included.length -
                                        maxIncludedFeatures}{" "}
                                    more features
                                </span>
                            </li>
                        )}

                    {/* Not included features */}
                    {features.not_included
                        .slice(0, maxNotIncludedFeatures)
                        .map((feature, index) => (
                            <li
                                key={`not-included-${index}`}
                                className={`flex items-start gap-2 ${xIconClass}`}
                            >
                                <i className="fa-duotone fa-regular fa-x mt-0.5 text-sm flex-shrink-0"></i>
                                <span>{feature}</span>
                            </li>
                        ))}
                </ul>

                {/* Selection indicator or CTA */}
                {onSelect ? (
                    <div
                        className={`btn ${isSelected ? "btn-success" : isPopular ? "btn-secondary" : "btn-primary"} btn-block ${isCompact ? "btn-sm" : ""}`}
                    >
                        {isSelected ? (
                            <>
                                <i className="fa-duotone fa-regular fa-check"></i>
                                Selected
                            </>
                        ) : (
                            features.cta_text
                        )}
                    </div>
                ) : (
                    <div
                        className={`btn ${isPopular ? "btn-secondary" : plan.tier === "partner" ? "btn-accent" : "btn-primary"} btn-block ${isCompact ? "btn-sm" : ""}`}
                    >
                        {features.cta_text}
                    </div>
                )}

                {/* Footnote (default variant only) */}
                {!isCompact && features.footnote && (
                    <p className={`text-xs ${subtitleClass} mt-2 text-center`}>
                        {features.footnote}
                    </p>
                )}
            </div>
        </div>
    );
}
