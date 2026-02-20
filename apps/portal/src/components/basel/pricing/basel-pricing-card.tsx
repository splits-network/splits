"use client";

import type { PricingCardProps } from "@/components/pricing/types";

/* ─── Basel Tier Colors ──────────────────────────────────────────────────── */

const tierColors = {
    starter: {
        border: "border-success",
        bg: "bg-success",
        text: "text-success-content",
        checkColor: "text-success",
        cardBg: "bg-base-100",
        cardText: "text-base-content",
        cardTextMuted: "text-base-content/50",
        cardTextSubtle: "text-base-content/70",
        cardTextSoft: "text-base-content/80",
        cardTextFaint: "text-base-content/40",
        cardTextFaintest: "text-base-content/30",
    },
    pro: {
        border: "border-primary",
        bg: "bg-primary",
        text: "text-primary-content",
        checkColor: "text-primary",
        cardBg: "bg-neutral",
        cardText: "text-neutral-content",
        cardTextMuted: "text-neutral-content/50",
        cardTextSubtle: "text-neutral-content/70",
        cardTextSoft: "text-neutral-content/80",
        cardTextFaint: "text-neutral-content/50",
        cardTextFaintest: "text-neutral-content/40",
    },
    partner: {
        border: "border-accent",
        bg: "bg-accent",
        text: "text-accent-content",
        checkColor: "text-accent",
        cardBg: "bg-base-100",
        cardText: "text-base-content",
        cardTextMuted: "text-base-content/50",
        cardTextSubtle: "text-base-content/70",
        cardTextSoft: "text-base-content/80",
        cardTextFaint: "text-base-content/40",
        cardTextFaintest: "text-base-content/30",
    },
};

/* ─── Component ──────────────────────────────────────────────────────────── */

export function BaselPricingCard({
    plan,
    isSelected = false,
    onSelect,
    isAnnual = false,
    disabled = false,
}: PricingCardProps) {
    const { features } = plan;

    const defaultFeatures = {
        headline: plan.description || `Perfect for ${plan.tier} recruiting`,
        subheadline: plan.description || "Get access to the marketplace",
        included: [
            "Access to open roles across the network",
            "Unlimited candidate submissions",
            "Full ATS workflow and application tracking",
        ],
        not_included: [] as string[],
        cta: "Get Started",
        footnote: null as string | null,
        is_popular: false,
        annual_price_cents: null as number | null,
        annual_savings_text: null as string | null,
    };

    const planFeatures = features || defaultFeatures;
    const isPopular = planFeatures.is_popular;
    const isFree = plan.price_monthly === 0;

    const displayPrice = isAnnual ? plan.price_annual : plan.price_monthly;
    const pricePeriod = "/mo";

    const monthlySavingsEquivalent =
        isAnnual && !isFree ? Math.round(plan.price_annual / 12) : null;

    const tierKey = plan.tier?.toLowerCase() as keyof typeof tierColors;
    const colors = tierColors[tierKey] || tierColors.starter;

    const handleClick = () => {
        if (!disabled && onSelect) {
            onSelect(plan);
        }
    };

    return (
        <div
            className={`relative p-8 border-l-4 ${colors.border} ${colors.cardBg} border border-base-300 flex flex-col ${
                isPopular ? "md:-mt-4 md:mb-[-16px]" : ""
            }`}
        >
            {/* Popular badge */}
            {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-black uppercase tracking-[0.2em] bg-warning text-warning-content">
                    Most Popular
                </div>
            )}

            {/* Tier badge */}
            <span
                className={`inline-block max-w-[50%] px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 ${colors.bg} ${colors.text}`}
            >
                {plan.name}
            </span>

            {/* Price */}
            <div className={`text-4xl font-black mb-2 ${colors.cardText}`}>
                {isFree ? (
                    "Free"
                ) : (
                    <>
                        ${displayPrice}
                        <span
                            className={`text-lg font-bold ${colors.cardTextMuted}`}
                        >
                            {pricePeriod}
                        </span>
                    </>
                )}
            </div>

            {/* Savings / free note */}
            {!isFree && isAnnual && monthlySavingsEquivalent && (
                <div
                    className={`text-xs font-bold uppercase tracking-wider mb-4 ${colors.cardTextMuted}`}
                >
                    ${monthlySavingsEquivalent}/mo billed annually -- save 20%
                </div>
            )}
            {isFree && (
                <div
                    className={`text-xs font-bold uppercase tracking-wider mb-4 ${colors.cardTextMuted}`}
                >
                    Forever -- no credit card required
                </div>
            )}

            {/* Headline */}
            {planFeatures.headline && (
                <h3
                    className={`text-base font-bold mb-3 ${colors.cardText}`}
                >
                    {planFeatures.headline}
                </h3>
            )}

            {/* Subheadline */}
            {planFeatures.subheadline && (
                <p
                    className={`text-sm leading-relaxed mb-6 ${colors.cardTextSubtle}`}
                >
                    {planFeatures.subheadline}
                </p>
            )}

            {/* Divider */}
            <div className={`w-full h-1 mb-6 ${colors.bg}`} />

            {/* Features list */}
            <ul className="space-y-3 mb-8 flex-grow">
                {planFeatures.included.map((feat: string, i: number) => (
                    <li
                        key={`inc-${i}`}
                        className={`flex items-start gap-3 text-sm leading-relaxed ${colors.cardTextSoft}`}
                    >
                        <i
                            className={`fa-duotone fa-regular fa-check mt-0.5 flex-shrink-0 ${colors.checkColor}`}
                        />
                        {feat}
                    </li>
                ))}

                {planFeatures.not_included &&
                    planFeatures.not_included.length > 0 &&
                    planFeatures.not_included.map(
                        (feat: string, i: number) => (
                            <li
                                key={`exc-${i}`}
                                className={`flex items-start gap-3 text-sm leading-relaxed ${colors.cardTextFaint}`}
                            >
                                <i
                                    className={`fa-duotone fa-regular fa-xmark mt-0.5 flex-shrink-0 ${colors.cardTextFaintest}`}
                                />
                                {feat}
                            </li>
                        ),
                    )}
            </ul>

            {/* CTA Button */}
            {onSelect ? (
                <button
                    onClick={handleClick}
                    disabled={disabled}
                    className={`block w-full py-3 font-bold uppercase tracking-wider border ${colors.border} ${
                        isSelected ? "bg-base-100" : colors.bg
                    } ${
                        isSelected ? colors.cardText : colors.text
                    } text-center text-sm transition-transform hover:-translate-y-1`}
                >
                    {isSelected ? (
                        <>
                            <i className="fa-duotone fa-regular fa-check mr-2" />
                            Selected
                        </>
                    ) : (
                        planFeatures.cta || "Get Started"
                    )}
                </button>
            ) : (
                <a
                    href="/sign-up"
                    className={`block w-full py-3 font-bold uppercase tracking-wider border ${colors.border} ${colors.bg} ${colors.text} text-center text-sm transition-transform hover:-translate-y-1`}
                >
                    {planFeatures.cta ||
                        (tierKey === "starter"
                            ? "Start Free"
                            : tierKey === "pro"
                              ? "Go Pro"
                              : "Become a Partner")}
                </a>
            )}

            {/* Footnote */}
            {planFeatures.footnote && (
                <p
                    className={`text-xs leading-relaxed mt-4 ${colors.cardTextMuted}`}
                >
                    {planFeatures.footnote}
                </p>
            )}
        </div>
    );
}
