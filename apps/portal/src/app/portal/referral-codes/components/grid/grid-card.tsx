"use client";

import type { RecruiterCode } from "../../types";
import { statusBadgeClass, statusBorder } from "../shared/status-color";
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
    const borderClass = statusBorder(code);
    const isExpired =
        !!code.expiry_date && new Date(code.expiry_date) < new Date();
    const isExhausted =
        code.uses_remaining !== undefined && code.uses_remaining === 0;

    return (
        <article
            onClick={onSelect}
            className={[
                "group cursor-pointer bg-base-100 border border-base-300 border-l-4 transition-all",
                isSelected
                    ? `${borderClass} shadow-md`
                    : "border-l-base-300 hover:border-l-primary/50 hover:shadow-md",
            ].join(" ")}
        >
            {/* Header Band */}
            <div className="bg-base-300 border-b border-base-300 px-5 pt-5 pb-4">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/40 truncate">
                        Referral Code
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`badge ${statusBadgeClass(code)}`}>
                            <i
                                className={`fa-duotone fa-regular ${code.status === "active" ? "fa-circle-check" : "fa-circle-pause"} mr-1`}
                            />
                            {code.status}
                        </span>
                        {isExpired && (
                            <span className="badge badge-warning badge-outline">
                                <i className="fa-duotone fa-regular fa-clock mr-1" />
                                Expired
                            </span>
                        )}
                    </div>
                </div>

                {/* Code display */}
                <div className="flex items-end gap-3">
                    <div className="w-14 h-14 shrink-0 bg-primary text-primary-content flex items-center justify-center">
                        <i className="fa-duotone fa-regular fa-link text-xl" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-0.5">
                            Code
                        </p>
                        <h3 className="font-mono text-2xl font-black tracking-tight leading-none text-base-content group-hover:text-primary transition-colors">
                            {code.code}
                        </h3>
                    </div>
                </div>

                {/* Label / meta */}
                <div className="flex items-center gap-3 mt-2.5 text-sm text-base-content/40">
                    {code.label ? (
                        <span className="truncate">{code.label}</span>
                    ) : (
                        <span className="italic">No label</span>
                    )}
                    <span className="text-base-content/20">|</span>
                    <span className="flex items-center gap-1.5 shrink-0">
                        <i className="fa-duotone fa-regular fa-calendar text-xs" />
                        {timeAgo(code.created_at)}
                    </span>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 divide-x divide-base-300 border-b border-base-300">
                <div className="px-5 py-3">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-0.5">
                        Signups
                    </p>
                    <p className="text-sm font-bold text-base-content">
                        {code.usage_count ?? 0}
                    </p>
                </div>
                <div className="px-5 py-3">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-0.5">
                        Expires
                    </p>
                    <p
                        className={`text-sm font-bold ${isExpired ? "text-error" : "text-base-content"}`}
                    >
                        {code.expiry_date ? formatDate(code.expiry_date) : "Never"}
                    </p>
                </div>
            </div>

            {/* Tags */}
            <div className="px-5 py-3 border-b border-base-300">
                <div className="flex flex-wrap gap-1.5">
                    {code.max_uses != null && (
                        <span className="badge badge-outline badge-sm">
                            <i className="fa-duotone fa-regular fa-users mr-1" />
                            {code.uses_remaining ?? code.max_uses}/{code.max_uses}
                        </span>
                    )}
                    {isExhausted && (
                        <span className="badge badge-error badge-outline badge-sm">
                            <i className="fa-duotone fa-regular fa-ban mr-1" />
                            Limit reached
                        </span>
                    )}
                    {code.max_uses == null && !isExhausted && (
                        <span className="text-sm text-base-content/20 italic">
                            No limits
                        </span>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div
                className="px-5 py-3 flex items-center justify-end gap-1"
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
