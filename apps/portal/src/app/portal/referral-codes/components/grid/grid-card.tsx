"use client";

import type { RecruiterCode } from "../../types";
import { statusColorName, statusBorder } from "../shared/status-color";
import { BaselBadge } from "@splits-network/basel-ui";
import {
    formatDate,
    timeAgo,
    copyShareLink,
    copyCandidateShareLink,
} from "../shared/helpers";
import { Button } from "@splits-network/basel-ui";

export function GridCard({
    code,
    isSelected,
    onSelect,
}: {
    code: RecruiterCode;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const isExpired =
        !!code.expiry_date && new Date(code.expiry_date) < new Date();
    const isExhausted =
        code.uses_remaining !== undefined && code.uses_remaining === 0;

    // Inline metadata
    const metaItems: { icon: string; color: string; value: string; muted: boolean; tooltip: string }[] = [
        { icon: "fa-users", color: "text-primary", value: `${code.usage_count ?? 0} signups`, muted: !code.usage_count, tooltip: "Total signups" },
        { icon: "fa-clock", color: isExpired ? "text-error" : "text-accent", value: code.expiry_date ? formatDate(code.expiry_date) : "Never", muted: false, tooltip: "Expiry date" },
        ...(code.max_uses != null ? [{ icon: "fa-gauge", color: "text-secondary", value: `${code.uses_remaining ?? code.max_uses}/${code.max_uses} remaining`, muted: isExhausted, tooltip: "Usage limit" }] : []),
    ];

    return (
        <article
            onClick={onSelect}
            className={[
                "group cursor-pointer flex flex-col bg-base-100 border border-base-300 border-l-4 transition-colors",
                isSelected
                    ? `${statusBorder(code)} bg-primary/5`
                    : "border-l-base-300 hover:border-base-content/20",
            ].join(" ")}
        >
            {/* Header Band */}
            <div className="bg-base-300 px-5 pt-4 pb-4">
                {/* Icon + Code block */}
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 shrink-0 mt-0.5 bg-primary text-primary-content flex items-center justify-center">
                        <i className="fa-duotone fa-regular fa-link text-lg" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold uppercase tracking-[0.15em] text-primary mb-0.5 truncate">
                            Referral Code
                        </p>
                        <h3 className="font-mono text-lg font-black tracking-tight leading-tight text-base-content truncate group-hover:text-primary transition-colors">
                            {code.code}
                        </h3>
                        <p className={`text-sm truncate mt-0.5 ${code.label ? "text-base-content/50" : "text-base-content/30"}`}>
                            {code.label || "No label"}
                        </p>
                    </div>
                </div>

                {/* Created ago */}
                <div className="flex items-center gap-3 mt-2.5 text-sm text-base-content/50">
                    <span className="flex items-center gap-1.5 shrink-0">
                        <i className="fa-duotone fa-regular fa-calendar text-xs text-accent" />
                        {timeAgo(code.created_at)}
                    </span>
                </div>
            </div>

            {/* Inline metadata: signups · expires · limit */}
            <div className="px-5 py-2.5 border-b border-base-300 text-sm flex flex-wrap items-center gap-x-3 gap-y-1">
                {metaItems.map((item, i) => (
                    <span key={i} className={`tooltip tooltip-bottom flex items-center gap-1 ${item.muted ? "text-base-content/30" : "text-base-content/50"}`} data-tip={item.tooltip}>
                        <i className={`fa-duotone fa-regular ${item.icon} ${item.muted ? "text-base-content/20" : item.color} text-xs`} />
                        <span className="truncate">{item.value}</span>
                    </span>
                ))}
            </div>

            {/* Badge row: emphasis (soft-outline) + default (soft) */}
            <div className="px-5 py-3 flex-1">
                <div className="flex flex-wrap gap-1.5">
                    <BaselBadge color={statusColorName(code)} variant="soft-outline" size="sm" icon={code.status === "active" ? "fa-circle-check" : "fa-circle-pause"}>
                        {code.status === "active" ? "Active" : "Inactive"}
                    </BaselBadge>
                    {isExpired && (
                        <BaselBadge color="warning" variant="soft-outline" size="sm" icon="fa-clock">
                            Expired
                        </BaselBadge>
                    )}
                    {isExhausted && (
                        <BaselBadge color="error" variant="soft-outline" size="sm" icon="fa-ban">
                            Limit Reached
                        </BaselBadge>
                    )}
                    {code.max_uses == null && !isExhausted && (
                        <BaselBadge color="neutral" variant="soft" size="sm" icon="fa-infinity">
                            Unlimited
                        </BaselBadge>
                    )}
                </div>
            </div>

            {/* Footer: share actions */}
            <div
                className="flex items-center justify-end gap-1 px-5 py-3 border-t border-base-300"
                onClick={(e) => e.stopPropagation()}
            >
                <Button
                    icon="fa-duotone fa-regular fa-briefcase"
                    variant="btn-ghost btn-square"
                    size="xs"
                    onClick={() => copyShareLink(code.code)}
                    title="Copy recruiter share link"
                />
                <Button
                    icon="fa-duotone fa-regular fa-user"
                    variant="btn-ghost btn-square"
                    size="xs"
                    onClick={() => copyCandidateShareLink(code.code)}
                    title="Copy candidate share link"
                />
            </div>
        </article>
    );
}
