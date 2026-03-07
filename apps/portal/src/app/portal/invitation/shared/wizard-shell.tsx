"use client";

import type { WizardStep } from "./types";

interface WizardShellProps {
    kicker: string;
    title: React.ReactNode;
    subtitle: string;
    steps: WizardStep[];
    currentStep: number;
    onStepClick: (step: number) => void;
    children: React.ReactNode;
    sidebar: React.ReactNode;
}

export function WizardShell({
    kicker,
    title,
    subtitle,
    steps,
    currentStep,
    onStepClick,
    children,
    sidebar,
}: WizardShellProps) {
    return (
        <main>
            {/* Hero Header */}
            <section className="relative bg-neutral text-neutral-content py-12 lg:py-16">
                <div
                    className="absolute top-0 right-0 w-1/3 h-full bg-primary/10"
                    style={{
                        clipPath: "polygon(20% 0,100% 0,100% 100%,0% 100%)",
                    }}
                />
                <div className="relative container mx-auto px-6 lg:px-12">
                    <div className="max-w-3xl">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                            {kicker}
                        </p>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.92] tracking-tight mb-4">
                            {title}
                        </h1>
                        <p className="text-base text-neutral-content/50 max-w-xl">
                            {subtitle}
                        </p>
                    </div>
                </div>
            </section>

            {/* Step Indicators */}
            <section className="bg-base-200 border-b border-base-300">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex overflow-x-auto">
                        {steps.map((step, i) => (
                            <button
                                key={step.num}
                                onClick={() => {
                                    if (i < currentStep) onStepClick(i);
                                }}
                                className={`flex items-center gap-3 px-6 py-4 border-b-2 transition-all text-sm font-semibold whitespace-nowrap ${
                                    i === currentStep
                                        ? "border-primary text-primary"
                                        : i < currentStep
                                          ? "border-success text-success cursor-pointer"
                                          : "border-transparent text-base-content/30"
                                }`}
                            >
                                <span
                                    className={`w-7 h-7 flex items-center justify-center text-xs font-bold ${
                                        i === currentStep
                                            ? "bg-primary text-primary-content"
                                            : i < currentStep
                                              ? "bg-success text-success-content"
                                              : "bg-base-300 text-base-content/40"
                                    }`}
                                >
                                    {i < currentStep ? (
                                        <i className="fa-duotone fa-regular fa-check text-sm" />
                                    ) : (
                                        step.num
                                    )}
                                </span>
                                <span className="hidden sm:inline">
                                    {step.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Wizard Content */}
            <section className="container mx-auto px-6 lg:px-12 py-10 lg:py-14">
                <div className="grid lg:grid-cols-5 gap-10 lg:gap-16">
                    <div className="lg:col-span-3">{children}</div>
                    <div className="lg:col-span-2">{sidebar}</div>
                </div>
            </section>
        </main>
    );
}
