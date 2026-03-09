"use client";

import type { CallSummary } from "../../hooks/use-call-detail";

interface SummaryTabProps {
    summary?: CallSummary | null;
}

interface SummarySection {
    key: string;
    label: string;
    icon: string;
    color: string;
}

const SECTIONS: SummarySection[] = [
    { key: "key_points", label: "Key Points", icon: "fa-lightbulb", color: "text-primary" },
    { key: "action_items", label: "Action Items", icon: "fa-list-check", color: "text-success" },
    { key: "decisions", label: "Decisions", icon: "fa-gavel", color: "text-info" },
    { key: "follow_ups", label: "Follow-ups", icon: "fa-arrow-rotate-right", color: "text-warning" },
];

export function SummaryTab({ summary }: SummaryTabProps) {
    // No summary
    if (!summary) {
        return (
            <div className="border-2 border-base-300 p-8 text-center">
                <i className="fa-duotone fa-regular fa-sparkles text-4xl text-base-content/15 mb-4 block" />
                <p className="text-sm text-base-content/50">
                    No AI summary available for this call.
                </p>
            </div>
        );
    }

    // Processing
    if (
        summary.summary_status === "pending" ||
        summary.summary_status === "processing"
    ) {
        return (
            <div className="border-2 border-base-300 p-8 text-center">
                <span className="loading loading-spinner loading-md text-primary mb-4 block" />
                <p className="font-bold mb-1">Generating AI Summary</p>
                <p className="text-sm text-base-content/50">
                    The AI is analyzing the call transcript. This may take a few
                    minutes.
                </p>
                {summary.model && (
                    <p className="text-sm text-base-content/30 mt-2">
                        Model: {summary.model}
                    </p>
                )}
            </div>
        );
    }

    // Failed
    if (summary.summary_status === "failed") {
        return (
            <div className="border-2 border-base-300 p-8 text-center">
                <i className="fa-duotone fa-regular fa-triangle-exclamation text-4xl text-error/30 mb-4 block" />
                <p className="font-bold mb-1">Summary Generation Failed</p>
                <p className="text-sm text-base-content/50">
                    {summary.error || "The AI could not generate a summary."}
                </p>
            </div>
        );
    }

    const data = summary.summary || {} as Record<string, unknown>;
    const hasSections = SECTIONS.some((s) => {
        const items = (data as Record<string, unknown>)[s.key];
        return Array.isArray(items) && items.length > 0;
    });

    if (!hasSections) {
        return (
            <div className="border-2 border-base-300 p-8 text-center">
                <i className="fa-duotone fa-regular fa-sparkles text-4xl text-base-content/15 mb-4 block" />
                <p className="text-sm text-base-content/50">
                    Summary is ready but contains no structured content.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {SECTIONS.map((section) => {
                const items = (data as Record<string, unknown>)[section.key] as string[] | undefined;
                if (!items || items.length === 0) return null;

                return (
                    <div
                        key={section.key}
                        className="border-2 border-base-300"
                    >
                        <div className="flex items-center gap-2 px-4 py-3 bg-base-200 border-b-2 border-base-300">
                            <i
                                className={`fa-duotone fa-regular ${section.icon} ${section.color}`}
                            />
                            <h3 className="font-bold text-sm uppercase tracking-[0.15em]">
                                {section.label}
                            </h3>
                            <span className="text-sm text-base-content/40 ml-auto">
                                {items.length}
                            </span>
                        </div>
                        <ul className="divide-y divide-base-300">
                            {items.map((item, i) => (
                                <li
                                    key={i}
                                    className="px-4 py-3 text-sm flex gap-3"
                                >
                                    <span className="text-base-content/30 font-mono pt-0.5">
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            })}

            {/* Model attribution */}
            {summary.model && (
                <p className="text-sm text-base-content/30 text-right">
                    Generated by {summary.model}
                </p>
            )}
        </div>
    );
}
