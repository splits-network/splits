"use client";

/**
 * Inbox panel header — title, search bar, connection pills, compose button.
 * Sits inside the left 38% panel of the split view.
 */

import { useEmail } from "./email-context";

export default function EmailInboxHeader() {
    const {
        connections,
        selectedConnection,
        selectConnection,
        searchQuery,
        setSearchQuery,
        refresh,
        loading,
        openCompose,
    } = useEmail();

    return (
        <div className="p-4 border-b border-base-300 bg-base-200">
            {/* Title row */}
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-black tracking-tight">Inbox</h2>
                <div className="flex items-center gap-1">
                    <button
                        onClick={refresh}
                        className="btn btn-ghost btn-sm btn-square"
                        disabled={loading}
                        title="Refresh inbox"
                    >
                        <i
                            className={`fa-duotone fa-regular fa-arrows-rotate text-base-content/60 ${
                                loading ? "animate-spin" : ""
                            }`}
                        />
                    </button>
                    <button
                        onClick={() =>
                            openCompose({
                                connectionId: selectedConnection?.id,
                            })
                        }
                        className="btn btn-primary btn-sm rounded-none font-bold uppercase tracking-wider"
                        disabled={!selectedConnection}
                    >
                        <i className="fa-duotone fa-regular fa-pen-to-square" />
                        Compose
                    </button>
                </div>
            </div>

            {/* Search */}
            <label className="input input-sm w-full bg-base-100 border-base-300 mb-3">
                <i className="fa-duotone fa-regular fa-magnifying-glass opacity-50" />
                <input
                    type="text"
                    placeholder="Search emails..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={loading}
                    className="grow"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery("")}
                        className="btn btn-ghost btn-xs btn-square"
                    >
                        <i className="fa-duotone fa-regular fa-xmark" />
                    </button>
                )}
            </label>

            {/* Connection pills (only if multiple) */}
            {connections.length > 1 && (
                <div className="flex gap-1.5 flex-wrap">
                    {connections.map((conn) => (
                        <button
                            key={conn.id}
                            onClick={() => selectConnection(conn)}
                            className={`px-3 py-1 text-sm font-semibold uppercase tracking-wider transition-all ${
                                selectedConnection?.id === conn.id
                                    ? "bg-neutral text-neutral-content"
                                    : "bg-base-100 text-base-content/60 hover:bg-base-300"
                            }`}
                        >
                            <i
                                className={
                                    conn.provider_slug.startsWith("google_")
                                        ? "fa-brands fa-google mr-1"
                                        : "fa-brands fa-microsoft mr-1"
                                }
                            />
                            {conn.provider_account_name || conn.provider_slug}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
