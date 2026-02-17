"use client";

/**
 * PricingCard Component
 * Reusable pricing card for plan display and selection (Memphis Design)
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
    const pricePeriod = isAnnual ? "/mo" : "/mo";

    // Calculate savings for annual plans
    const annualSavings = isFree
        ? 0
        : plan.price_monthly * 12 - plan.price_annual;
    const monthlySavingsEquivalent =
        isAnnual && !isFree ? Math.round(plan.price_annual / 12) : null;

    const isCompact = variant === "compact";

    // Memphis tier-specific colors
    const tierColors = {
        starter: { border: "border-teal", bg: "bg-teal", text: "text-dark", barBg: "bg-teal", checkColor: "text-teal", cardBg: "bg-white", cardText: "text-dark" },
        pro: { border: "border-coral", bg: "bg-coral", text: "text-cream", barBg: "bg-coral", checkColor: "text-coral", cardBg: "bg-dark", cardText: "text-cream" },
        partner: { border: "border-purple", bg: "bg-purple", text: "text-cream", barBg: "bg-purple", checkColor: "text-purple", cardBg: "bg-white", cardText: "text-dark" },
    };

    const tierKey = plan.tier?.toLowerCase() as keyof typeof tierColors;
    const colors = tierColors[tierKey] || tierColors.starter;

    // Memphis card styling - Pro tier (popular) uses dark background
    const cardClasses = `pricing-card relative p-8 border-4 ${colors.border} ${colors.cardBg} ${isCompact ? "" : isPopular ? "md:-mt-4 md:mb-[-16px]" : ""}`;

    const handleClick = () => {
        if (!disabled && onSelect) {
            onSelect(plan);
        }
    };

    return (
        <div className={`${cardClasses} flex flex-col`}>
            {/* Corner decoration */}
            <div className={`absolute top-0 right-0 w-10 h-10 ${colors.bg}`} />

            {/* Popular badge (Pro tier only) */}
            {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-black uppercase tracking-[0.2em] bg-yellow text-dark">
                    Most Popular
                </div>
            )}

            {/* Tier badge */}
            <span className={`inline-block max-w-[50%] px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 ${colors.bg} ${colors.text}`}>
                {plan.name}
            </span>

            {/* Price */}
            <div className={`text-4xl font-black mb-2 ${colors.cardText}`}>
                {isFree ? (
                    "Free"
                ) : (
                    <>
                        ${displayPrice}
                        <span className={`text-lg font-bold ${colors.cardText}/50`}>
                            {pricePeriod}
                        </span>
                    </>
                )}
            </div>

            {/* Annual savings text */}
            {!isFree && isAnnual && monthlySavingsEquivalent && (
                <div className={`text-xs font-bold uppercase tracking-wider mb-4 ${colors.cardText}/50`}>
                    ${monthlySavingsEquivalent}/mo billed annually -- save 20%
                </div>
            )}
            {isFree && (
                <div className={`text-xs font-bold uppercase tracking-wider mb-4 ${colors.cardText}/50`}>
                    Forever -- no credit card required
                </div>
            )}

            {/* Headline from database */}
            {planFeatures.headline && (
                <h3 className={`text-base font-bold mb-3 ${colors.cardText}`}>
                    {planFeatures.headline}
                </h3>
            )}

            {/* Subheadline from database */}
            {planFeatures.subheadline && (
                <p className={`text-sm leading-relaxed mb-6 ${colors.cardText}/70`}>
                    {planFeatures.subheadline}
                </p>
            )}

            {/* Color bar divider */}
            <div className={`w-full h-1 mb-6 ${colors.barBg}`} />

            {/* Features list - flex-grow pushes button to bottom */}
            <ul className="space-y-3 mb-8 flex-grow">
                {/* Included features (with checkmarks) */}
                {planFeatures.included.map((feat: string, i: number) => (
                    <li key={`inc-${i}`} className={`flex items-start gap-3 text-sm leading-relaxed ${colors.cardText}/80`}>
                        <i className={`fa-duotone fa-regular fa-check mt-0.5 flex-shrink-0 ${colors.checkColor}`}></i>
                        {feat}
                    </li>
                ))}

                {/* Not-included features (with X marks) */}
                {planFeatures.not_included && planFeatures.not_included.length > 0 && planFeatures.not_included.map((feat: string, i: number) => (
                    <li key={`exc-${i}`} className={`flex items-start gap-3 text-sm leading-relaxed ${colors.cardText}/30`}>
                        <i className={`fa-duotone fa-regular fa-xmark mt-0.5 flex-shrink-0 ${colors.cardText}/25`}></i>
                        {feat}
                    </li>
                ))}
            </ul>

            {/* CTA Button */}
            {onSelect ? (
                <button
                    onClick={handleClick}
                    disabled={disabled}
                    className={`block w-full py-3 font-bold uppercase tracking-wider border-4 ${colors.border} ${isSelected ? "bg-white" : colors.bg} ${isSelected ? colors.cardText : colors.text} text-center text-sm transition-transform hover:-translate-y-1`}
                >
                    {isSelected ? (
                        <>
                            <i className="fa-duotone fa-regular fa-check mr-2"></i>
                            Selected
                        </>
                    ) : (
                        planFeatures.cta || "Get Started"
                    )}
                </button>
            ) : (
                <a
                    href="/sign-up"
                    className={`block w-full py-3 font-bold uppercase tracking-wider border-4 ${colors.border} ${colors.bg} ${colors.text} text-center text-sm transition-transform hover:-translate-y-1`}
                >
                    {planFeatures.cta ||
                        (tierKey === "starter" ? "Start Free" :
                         tierKey === "pro" ? "Go Pro" :
                         "Become a Partner")}
                </a>
            )}

            {/* Footnote from database */}
            {planFeatures.footnote && (
                <p className={`text-xs leading-relaxed mt-4 ${colors.cardText}/50`}>
                    {planFeatures.footnote}
                </p>
            )}
        </div>
    );
}
