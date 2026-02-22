"use client";

import { BaselStatusPill } from "@splits-network/basel-ui";
import type { IntegrationProvider, OAuthConnectionPublic } from "@splits-network/shared-types";

interface MarketplaceProviderCardProps {
    provider: IntegrationProvider;
    connection?: OAuthConnectionPublic;
    connecting: boolean;
    onConnect: () => void;
    onDetails: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
    calendar: "Calendar",
    email: "Email",
    ats: "ATS",
    linkedin: "LinkedIn",
};

export function MarketplaceProviderCard({
    provider,
    connection,
    connecting,
    onConnect,
    onDetails,
}: MarketplaceProviderCardProps) {
    const isConnected = connection?.status === "active";

    return (
        <div className="group border border-base-300 bg-base-100 shadow-sm hover:shadow-md transition-all">
            {/* Top accent bar */}
            <div className={`h-1 ${isConnected ? "bg-success" : "bg-base-300 group-hover:bg-primary"} transition-colors`} />

            <div className="p-5">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 flex items-center justify-center shrink-0 ${
                        isConnected
                            ? "bg-success/10 border border-success/20"
                            : "bg-base-200 border border-base-300 group-hover:bg-primary/10 group-hover:border-primary/20"
                    } transition-colors`}>
                        <i className={`${provider.icon || "fa-duotone fa-regular fa-plug"} text-xl ${
                            isConnected ? "text-success" : "text-base-content/50 group-hover:text-primary"
                        } transition-colors`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-black tracking-tight">{provider.name}</h3>
                            {isConnected && (
                                <BaselStatusPill color="success">Connected</BaselStatusPill>
                            )}
                        </div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-base-content/40 mt-0.5">
                            {CATEGORY_LABELS[provider.category] ?? provider.category}
                        </p>
                    </div>
                </div>

                {/* Description */}
                {provider.description && (
                    <p className="text-xs text-base-content/50 leading-relaxed mb-5 line-clamp-2">
                        {provider.description}
                    </p>
                )}

                {/* Connected account info */}
                {isConnected && connection?.provider_account_name && (
                    <div className="bg-base-200/50 border border-base-300 px-3 py-2 mb-4">
                        <div className="flex items-center gap-2 text-xs">
                            <i className="fa-duotone fa-regular fa-circle-check text-success" />
                            <span className="text-base-content/60 font-medium truncate">
                                {connection.provider_account_name}
                            </span>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {isConnected ? (
                        <button
                            onClick={onDetails}
                            className="btn btn-outline btn-sm w-full rounded-none font-bold uppercase tracking-wider text-[11px]"
                        >
                            <i className="fa-duotone fa-regular fa-gear text-xs" />
                            Manage
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={onConnect}
                                disabled={connecting}
                                className="btn btn-primary btn-sm flex-1 rounded-none font-bold uppercase tracking-wider text-[11px]"
                            >
                                {connecting ? (
                                    <>
                                        <span className="loading loading-spinner loading-xs" />
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-duotone fa-regular fa-link text-xs" />
                                        Connect
                                    </>
                                )}
                            </button>
                            <button
                                onClick={onDetails}
                                className="btn btn-ghost btn-sm rounded-none text-base-content/40 hover:text-base-content/60"
                                title="View details"
                            >
                                <i className="fa-duotone fa-regular fa-arrow-right text-xs" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
