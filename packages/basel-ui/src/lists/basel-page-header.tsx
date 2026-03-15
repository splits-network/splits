import type { ReactNode } from "react";

export interface BaselPageHeaderStat {
    value: string | number;
    label: string;
    icon: string;
    color: "primary" | "accent" | "secondary" | "success" | "base";
}

export interface BaselPageHeaderProps {
    icon: string;
    kicker: string;
    headline: Array<{ text: string; highlight?: boolean }>;
    subtitle: string;
    stats: BaselPageHeaderStat[];
    isCompact: boolean;
    onToggle: () => void;
    isLoaded: boolean;
}

const colorMap: Record<BaselPageHeaderStat["color"], string> = {
    primary: "bg-primary text-primary-content",
    accent: "bg-accent text-accent-content",
    secondary: "bg-secondary text-secondary-content",
    success: "bg-success text-success-content",
    base: "bg-base-300 text-base-content",
};

const dotColorMap: Record<BaselPageHeaderStat["color"], string> = {
    primary: "bg-primary",
    accent: "bg-accent",
    secondary: "bg-secondary",
    success: "bg-success",
    base: "bg-base-content/30",
};

function ToggleButton({
    isCompact,
    onToggle,
}: {
    isCompact: boolean;
    onToggle: () => void;
}) {
    return (
        <button
            onClick={onToggle}
            className="btn btn-sm btn-square transition-opacity"
            title={isCompact ? "Expand header" : "Collapse header"}
        >
            <i
                className={`fa-solid fa-chevron-${isCompact ? "down" : "up"} text-accent fa-lg`}
            />
        </button>
    );
}

function CompactHeader({
    icon,
    kicker,
    stats,
    onToggle,
}: Pick<BaselPageHeaderProps, "icon" | "kicker" | "stats" | "onToggle">) {
    return (
        <section className="bg-base-300 text-base-content border-b-2 border-base-300">
            <div className="container mx-auto px-6 lg:px-12 py-3">
                <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-6 min-w-0">
                        {/* Kicker */}
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary flex items-center gap-2 shrink-0">
                            <i className={`fa-duotone fa-regular ${icon}`} />
                            {kicker}
                        </p>

                        {/* Inline stats */}
                        <div className="hidden md:flex items-center gap-4 text-sm">
                            {stats.map((stat, i) => (
                                <span
                                    key={i}
                                    className="flex items-center gap-1.5"
                                >
                                    {i > 0 && (
                                        <span className="text-base-content/20 mr-1">
                                            ·
                                        </span>
                                    )}
                                    <span
                                        className={`w-2 h-2 rounded-full ${dotColorMap[stat.color]}`}
                                    />
                                    <span className="font-bold">
                                        {stat.value}
                                    </span>
                                    <span className="text-base-content/50">
                                        {stat.label}
                                    </span>
                                </span>
                            ))}
                        </div>
                    </div>

                    <ToggleButton isCompact onToggle={onToggle} />
                </div>
            </div>
        </section>
    );
}

function FullHeader({
    icon,
    kicker,
    headline,
    subtitle,
    stats,
    onToggle,
}: Omit<BaselPageHeaderProps, "isCompact" | "isLoaded">) {
    return (
        <section className="relative bg-base-300 text-base-content py-16 lg:py-20">
            {/* Subtle grid pattern overlay */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage:
                        "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />

            <div className="relative container mx-auto px-6 lg:px-12">
                <div className="max-w-4xl">
                    {/* Kicker */}
                    <p className="hero-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-6 scroll-reveal fade-up">
                        <i className={`fa-duotone fa-regular ${icon} mr-2`} />
                        {kicker}
                    </p>

                    {/* Headline */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.92] tracking-tight mb-6">
                        {headline.map((word, i) => (
                            <span key={i}>
                                {i > 0 && " "}
                                <span
                                    className={`hero-headline-word inline-block scroll-reveal fade-up${word.highlight ? " text-primary" : ""}`}
                                >
                                    {word.text}
                                </span>
                            </span>
                        ))}
                    </h1>

                    {/* Subtitle */}
                    <p className="hero-subtitle text-lg text-base-content/60 leading-relaxed max-w-xl mb-10 scroll-reveal fade-up">
                        {subtitle}
                    </p>

                    {/* Stats */}
                    <div className="header-stat-bar flex flex-wrap gap-8 mt-8 scroll-reveal fade-up">
                        {stats.map((stat, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div
                                    className={`w-10 h-10 flex items-center justify-center ${colorMap[stat.color]}`}
                                >
                                    <i
                                        className={`fa-duotone fa-regular ${stat.icon}`}
                                    />
                                </div>
                                <div>
                                    <div className="text-2xl font-black">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm uppercase tracking-wider opacity-60">
                                        {stat.label}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Diagonal clip-path accent */}
            <div
                className="absolute top-0 right-0 bottom-0 w-1/3 bg-primary/5 hidden lg:block"
                style={{
                    clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)",
                }}
            ></div>
            {/* Collapse toggle */}
            <div className="absolute bottom-3 inset-x-0 flex justify-end px-6 lg:px-12">
                <ToggleButton isCompact={false} onToggle={onToggle} />
            </div>
        </section>
    );
}

export function BaselPageHeader(props: BaselPageHeaderProps) {
    const { isCompact, isLoaded } = props;

    if (!isLoaded || !isCompact) {
        return <FullHeader {...props} />;
    }

    return <CompactHeader {...props} />;
}
