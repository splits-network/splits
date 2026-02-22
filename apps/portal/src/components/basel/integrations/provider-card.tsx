"use client";

import type { IntegrationProvider } from "@splits-network/shared-types";

interface ProviderCardProps {
    provider: IntegrationProvider;
    connecting: boolean;
    onConnect: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
    calendar: "Calendar",
    email: "Email",
    ats: "ATS",
    linkedin: "LinkedIn",
};

export function ProviderCard({ provider, connecting, onConnect }: ProviderCardProps) {
    return (
        <div className="integration-card opacity-0 border border-base-300 bg-base-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-5">
                {/* Header row */}
                <div className="flex items-start gap-4 mb-3">
                    <div className="w-10 h-10 bg-base-200 border border-base-300 flex items-center justify-center shrink-0">
                        <i className={`${provider.icon || "fa-duotone fa-regular fa-plug"} text-lg text-base-content/60`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold tracking-tight">
                            {provider.name}
                        </h4>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-base-content/40">
                            {CATEGORY_LABELS[provider.category] ?? provider.category}
                        </p>
                    </div>
                </div>

                {/* Description */}
                {provider.description && (
                    <p className="text-xs text-base-content/50 leading-relaxed mb-4">
                        {provider.description}
                    </p>
                )}

                {/* Connect button */}
                <button
                    onClick={onConnect}
                    disabled={connecting}
                    className="btn btn-primary btn-sm w-full rounded-none font-bold uppercase tracking-wider text-[11px]"
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
            </div>
        </div>
    );
}
