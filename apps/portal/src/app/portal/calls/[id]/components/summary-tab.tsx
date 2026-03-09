"use client";

import { MarkdownRenderer } from "@/components/markdown-renderer";
import type { CallSummary } from "../../hooks/use-call-detail";

interface SummaryTabProps {
    summary?: CallSummary | null;
}

// Legacy structured sections for backward compatibility
interface LegacySection {
    key: string;
    label: string;
    icon: string;
    color: string;
}

const LEGACY_SECTIONS: LegacySection[] = [
    { key: "key_points", label: "Key Points", icon: "fa-lightbulb", color: "text-primary" },
    { key: "action_items", label: "Action Items", icon: "fa-list-check", color: "text-success" },
    { key: "decisions", label: "Decisions", icon: "fa-gavel", color: "text-info" },
    { key: "follow_ups", label: "Follow-ups", icon: "fa-arrow-rotate-right", color: "text-warning" },
];

export function SummaryTab({ summary }: SummaryTabProps) {
    if (!summary) {
        return <EmptyState message="No AI summary available for this call." />;
    }

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

    const data = summary.summary || {};
    const isNewFormat = !!(data.tldr || data.content);

    if (isNewFormat) {
        return <NewFormatSummary data={data} model={summary.model} />;
    }

    return <LegacyFormatSummary data={data} model={summary.model} />;
}

// ── New Format: TL;DR + Markdown + Action Items ──

function NewFormatSummary({
    data,
    model,
}: {
    data: CallSummary["summary"];
    model: string | null;
}) {
    const actionItems = data.action_items || [];

    return (
        <div className="space-y-6">
            {/* TL;DR */}
            {data.tldr && (
                <div className="border-l-4 border-primary bg-base-200 px-5 py-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.15em] text-primary mb-1">
                        TL;DR
                    </p>
                    <p className="font-bold text-lg">{data.tldr}</p>
                </div>
            )}

            {/* Markdown content */}
            {data.content && (
                <div className="border-2 border-base-300 p-5">
                    <MarkdownRenderer content={data.content} />
                </div>
            )}

            {/* Action items */}
            {actionItems.length > 0 && (
                <div className="border-2 border-base-300">
                    <div className="flex items-center gap-2 px-4 py-3 bg-base-200 border-b-2 border-base-300">
                        <i className="fa-duotone fa-regular fa-list-check text-success" />
                        <h3 className="font-bold text-sm uppercase tracking-[0.15em]">
                            Action Items
                        </h3>
                        <span className="text-sm text-base-content/40 ml-auto">
                            {actionItems.length}
                        </span>
                    </div>
                    <ul className="divide-y divide-base-300">
                        {actionItems.map((item, i) => (
                            <li
                                key={i}
                                className="px-4 py-3 text-sm flex gap-3"
                            >
                                <i className="fa-duotone fa-regular fa-circle-check text-base-content/20 pt-0.5" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Model attribution */}
            <ModelAttribution model={model} callType={data.call_type} />
        </div>
    );
}

// ── Legacy Format: Structured Sections ──

function LegacyFormatSummary({
    data,
    model,
}: {
    data: CallSummary["summary"];
    model: string | null;
}) {
    const hasAnySections = LEGACY_SECTIONS.some((s) => {
        const items = (data as Record<string, unknown>)[s.key];
        return Array.isArray(items) && items.length > 0;
    });

    if (!hasAnySections) {
        return <EmptyState message="No AI summary available for this call." />;
    }

    return (
        <div className="space-y-6">
            {LEGACY_SECTIONS.map((section) => {
                const items = (data as Record<string, unknown>)[
                    section.key
                ] as string[] | undefined;
                if (!items || items.length === 0) return null;

                return (
                    <div key={section.key} className="border-2 border-base-300">
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

            <ModelAttribution model={model} />
        </div>
    );
}

// ── Shared Components ──

function EmptyState({ message }: { message: string }) {
    return (
        <div className="border-2 border-base-300 p-8 text-center">
            <i className="fa-duotone fa-regular fa-sparkles text-4xl text-base-content/15 mb-4 block" />
            <p className="text-sm text-base-content/50">{message}</p>
        </div>
    );
}

function ModelAttribution({
    model,
    callType,
}: {
    model: string | null;
    callType?: string;
}) {
    if (!model && !callType) return null;

    return (
        <div className="flex items-center justify-end gap-3 text-sm text-base-content/30">
            {callType && <span>Type: {callType}</span>}
            {model && <span>Generated by {model}</span>}
        </div>
    );
}
