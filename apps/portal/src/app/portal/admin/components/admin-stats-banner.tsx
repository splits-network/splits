"use client";

import { ReactNode } from "react";

interface StatItem {
    label: string;
    value: number | string;
    icon?: string;
    color?:
        | "primary"
        | "secondary"
        | "accent"
        | "success"
        | "warning"
        | "error"
        | "info";
    loading?: boolean;
    trend?: {
        value: number;
        direction: "up" | "down" | "neutral";
    };
}

interface AdminStatsBannerProps {
    stats: StatItem[];
    className?: string;
}

export function AdminStatsBanner({
    stats,
    className = "",
}: AdminStatsBannerProps) {
    return (
        <div
            className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-6 ${className}`}
        >
            {stats.map((stat, index) => (
                <StatBannerItem key={index} stat={stat} />
            ))}
        </div>
    );
}

function StatBannerItem({ stat }: { stat: StatItem }) {
    const colorClasses = {
        primary: "border-primary/30 bg-primary/5",
        secondary: "border-secondary/30 bg-secondary/5",
        accent: "border-accent/30 bg-accent/5",
        success: "border-success/30 bg-success/5",
        warning: "border-warning/30 bg-warning/5",
        error: "border-error/30 bg-error/5",
        info: "border-info/30 bg-info/5",
    };

    const iconColorClasses = {
        primary: "text-primary",
        secondary: "text-secondary",
        accent: "text-accent",
        success: "text-success",
        warning: "text-warning",
        error: "text-error",
        info: "text-info",
    };

    const color = stat.color || "primary";

    return (
        <div
            className={`rounded-lg border p-3 ${colorClasses[color]} transition-all hover:shadow-sm`}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-base-content/60 truncate">
                        {stat.label}
                    </p>
                    <p className="text-lg font-bold mt-0.5">
                        {stat.loading ? (
                            <span className="loading loading-dots loading-sm"></span>
                        ) : (
                            stat.value
                        )}
                    </p>
                </div>
                {stat.icon && (
                    <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColorClasses[color]} bg-base-100/50`}
                    >
                        <i
                            className={`fa-duotone fa-regular ${stat.icon} text-sm`}
                        ></i>
                    </div>
                )}
            </div>
            {stat.trend && (
                <div className="mt-1 flex items-center gap-1">
                    <i
                        className={`fa-duotone fa-regular text-xs ${
                            stat.trend.direction === "up"
                                ? "fa-arrow-up text-success"
                                : stat.trend.direction === "down"
                                  ? "fa-arrow-down text-error"
                                  : "fa-minus text-base-content/40"
                        }`}
                    ></i>
                    <span
                        className={`text-xs ${
                            stat.trend.direction === "up"
                                ? "text-success"
                                : stat.trend.direction === "down"
                                  ? "text-error"
                                  : "text-base-content/40"
                        }`}
                    >
                        {stat.trend.value}%
                    </span>
                </div>
            )}
        </div>
    );
}

interface ActionableItemProps {
    title: string;
    count: number;
    icon: string;
    href: string;
    color?: "warning" | "error" | "info" | "success";
    loading?: boolean;
}

export function AdminActionableItems({
    items,
    className = "",
}: {
    items: ActionableItemProps[];
    className?: string;
}) {
    const visibleItems = items.filter((item) => item.count > 0 || item.loading);

    if (visibleItems.length === 0) return null;

    return (
        <div className={`mb-6 ${className}`}>
            <h3 className="text-sm font-medium text-base-content/60 mb-3">
                <i className="fa-duotone fa-regular fa-bell mr-2"></i>
                Needs Attention
            </h3>
            <div className="flex flex-wrap gap-2">
                {visibleItems.map((item, index) => (
                    <ActionableItem key={index} item={item} />
                ))}
            </div>
        </div>
    );
}

function ActionableItem({ item }: { item: ActionableItemProps }) {
    const colorClasses = {
        warning: "badge-warning",
        error: "badge-error",
        info: "badge-info",
        success: "badge-success",
    };

    const color = item.color || "warning";

    return (
        <a
            href={item.href}
            className={`badge ${colorClasses[color]} gap-2 py-3 px-4 hover:brightness-95 transition-all`}
        >
            {item.loading ? (
                <span className="loading loading-spinner loading-xs"></span>
            ) : (
                <i className={`fa-duotone fa-regular ${item.icon}`}></i>
            )}
            <span className="font-medium">{item.count}</span>
            <span>{item.title}</span>
        </a>
    );
}
