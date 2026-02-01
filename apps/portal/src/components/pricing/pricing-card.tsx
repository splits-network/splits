"use client";

/**
 * PricingCard Component
 * Reusable pricing card for plan display and selection
 */

import { PricingCardProps } from "./types";
import Link from "next/link";

export function PricingCard({
    plan,
    isSelected = false,
    onSelect,
    isAnnual = false,
    variant = "default",
    disabled = false,
}: PricingCardProps) {
    const { features } = plan;

    // Simple fallback features if not provided in database
    const defaultFeatures = {
        headline: plan.description || `Perfect for ${plan.tier} recruiting`,
        subheadline: plan.description || "Get access to the marketplace",
        included: [
            "Access to open roles across the network",
            "Unlimited candidate submissions",
            "Full ATS workflow and application tracking",
        ],
        not_included: [],
        cta: "Get Started",
        footnote: null,
        is_popular: false,
        annual_price_cents: null,
        annual_savings_text: null,
    };

    // Use features from database or fallback
    const planFeatures = features || defaultFeatures;
    const isPopular = planFeatures.is_popular;
    const isFree = plan.price_monthly === 0;

    // Calculate display price and period
    const displayPrice = isAnnual ? plan.price_annual : plan.price_monthly;
    const pricePeriod = isAnnual ? "/year" : "/month";

    // Calculate savings for annual plans
    const annualSavings = isFree
        ? 0
        : plan.price_monthly * 12 - plan.price_annual;
    const monthlySavingsEquivalent =
        isAnnual && !isFree ? Math.round(plan.price_annual / 12) : null;

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
    const maxIncludedFeatures = isCompact ? 4 : planFeatures.included.length;
    const maxNotIncludedFeatures = isCompact
        ? 2
        : planFeatures.not_included.length;

    const handleClick = () => {
        if (!disabled && onSelect) {
            onSelect(plan);
        }
    };

    return (
        <div className={cardClasses}>
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
                                {pricePeriod}
                            </span>
                        </>
                    )}
                </h3>

                {/* Monthly equivalent for annual plans */}
                {!isFree && isAnnual && monthlySavingsEquivalent && (
                    <div
                        className={`${isCompact ? "text-xs" : "text-sm"} ${priceSubtextClass} -mt-2 mb-1`}
                    >
                        ${monthlySavingsEquivalent}/month when paid annually
                    </div>
                )}

                {/* Annual savings badge */}
                {!isFree && isAnnual && annualSavings > 0 && (
                    <div className="badge badge-success badge-sm mb-2">
                        Save ${annualSavings}
                        {planFeatures.annual_savings_text &&
                            ` (${planFeatures.annual_savings_text.replace("Save ", "")})`}
                    </div>
                )}

                <div>
                    <span className={`${subtitleClass} font-bold`}>
                        {planFeatures.headline}
                    </span>
                </div>

                {/* Headline/Subheadline (default variant only) */}
                {!isCompact && (
                    <div className={`${subtitleClass} `}>
                        {planFeatures.subheadline}
                    </div>
                )}

                <div className="divider my-2"></div>

                {/* Features List */}
                <ul className={`space-y-2 ${isCompact ? "text-sm" : ""} mb-4`}>
                    {/* Included features */}
                    {planFeatures.included
                        .slice(0, maxIncludedFeatures)
                        .map((feature: string, index: number) => (
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
                        planFeatures.included.length > maxIncludedFeatures && (
                            <li className="flex items-start gap-2 opacity-70">
                                <i
                                    className={`fa-duotone fa-regular fa-plus mt-0.5 flex-shrink-0 ${checkIconClass}`}
                                ></i>
                                <span>
                                    {planFeatures.included.length -
                                        maxIncludedFeatures}{" "}
                                    more features
                                </span>
                            </li>
                        )}

                    {/* Not included features */}
                    {planFeatures.not_included
                        .slice(0, maxNotIncludedFeatures)
                        .map((feature: string, index: number) => (
                            <li
                                key={`not-included-${index}`}
                                className={`flex items-start gap-2 ${xIconClass}`}
                            >
                                <i className="fa-duotone fa-regular fa-x mt-0.5 text-sm flex-shrink-0"></i>
                                <span>{feature}</span>
                            </li>
                        ))}
                    <div className="h-2">
                        <Link href="/pricing" className="text-xs underline">
                            See full pricing details
                        </Link>
                    </div>
                </ul>
                <div className="mt-auto">
                    {/* Selection indicator or CTA */}
                    {onSelect ? (
                        <button
                            onClick={handleClick}
                            disabled={disabled}
                            className={`btn ${isSelected ? "btn-success" : isPopular ? "btn-secondary" : "btn-primary"} btn-block ${isCompact ? "btn-sm" : ""}`}
                        >
                            {isSelected ? (
                                <>
                                    <i className="fa-duotone fa-regular fa-check"></i>
                                    Selected
                                </>
                            ) : (
                                planFeatures.cta
                            )}
                        </button>
                    ) : (
                        <div
                            className={`btn ${isPopular ? "btn-secondary" : plan.tier === "partner" ? "btn-accent" : "btn-primary"} btn-block ${isCompact ? "btn-sm" : ""}`}
                        >
                            {planFeatures.cta}
                        </div>
                    )}

                    {/* Footnote (default variant only) */}
                    {!isCompact && planFeatures.footnote && (
                        <p
                            className={`text-xs ${subtitleClass} mt-2 text-center`}
                        >
                            {planFeatures.footnote}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
