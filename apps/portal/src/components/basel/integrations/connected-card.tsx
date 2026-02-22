"use client";

import { BaselStatusPill } from "@splits-network/basel-ui";
import type { IntegrationProvider, OAuthConnectionPublic } from "@splits-network/shared-types";

interface ConnectedCardProps {
    provider: IntegrationProvider;
    connection: OAuthConnectionPublic;
    statusLabel: string;
    statusColor: "success" | "warning" | "error" | "neutral";
    disconnecting: boolean;
    onDisconnect: () => void;
}

export function ConnectedCard({
    provider,
    connection,
    statusLabel,
    statusColor,
    disconnecting,
    onDisconnect,
}: ConnectedCardProps) {
    const lastSynced = connection.last_synced_at
        ? new Date(connection.last_synced_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          })
        : null;

    return (
        <div className="integration-card opacity-0 border-l-4 border-l-primary border border-base-300 bg-base-100 shadow-sm">
            <div className="p-5">
                <div className="flex items-start gap-4">
                    {/* Provider icon */}
                    <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <i className={`${provider.icon || "fa-duotone fa-regular fa-plug"} text-lg text-primary`} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-bold tracking-tight">
                                {provider.name}
                            </h4>
                            <BaselStatusPill color={statusColor}>
                                {statusLabel}
                            </BaselStatusPill>
                        </div>

                        {connection.provider_account_name && (
                            <p className="text-xs text-base-content/60 font-medium truncate">
                                {connection.provider_account_name}
                            </p>
                        )}

                        {/* Metadata row */}
                        <div className="flex items-center gap-4 mt-2 text-[11px] text-base-content/40">
                            {lastSynced && (
                                <span>
                                    <i className="fa-duotone fa-regular fa-clock mr-1" />
                                    Last synced {lastSynced}
                                </span>
                            )}
                            {connection.scopes_granted && (
                                <span>
                                    <i className="fa-duotone fa-regular fa-key mr-1" />
                                    {connection.scopes_granted.length} scope{connection.scopes_granted.length !== 1 ? "s" : ""}
                                </span>
                            )}
                        </div>

                        {/* Error display */}
                        {connection.last_error && (
                            <div className="mt-2 bg-error/5 border border-error/20 px-3 py-1.5">
                                <p className="text-xs text-error font-medium">{connection.last_error}</p>
                            </div>
                        )}
                    </div>

                    {/* Disconnect button */}
                    <button
                        onClick={onDisconnect}
                        disabled={disconnecting}
                        className="btn btn-outline btn-error btn-sm rounded-none font-bold uppercase tracking-wider text-[11px] shrink-0"
                    >
                        {disconnecting ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : (
                            <>
                                <i className="fa-duotone fa-regular fa-unlink text-xs" />
                                Disconnect
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
