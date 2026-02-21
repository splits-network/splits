"use client";

import type { Application } from "../../types";
import { MobileDetailOverlay } from "@/components/standard-lists";
import { DetailLoader } from "../shared/application-detail";
import { GridCard } from "./grid-card";

export function GridView({
    applications,
    onSelect,
    selectedId,
    onRefresh,
}: {
    applications: Application[];
    onSelect: (app: Application) => void;
    selectedId: string | null;
    onRefresh?: () => void;
}) {
    const selectedApp =
        applications.find((a) => a.id === selectedId) ?? null;

    return (
        <div className="flex gap-6">
            {/* Card grid — hidden on mobile when a detail is open */}
            <div
                className={`flex flex-col w-full ${selectedApp ? "hidden md:flex" : "flex"}`}
            >
                <div
                    className={`grid gap-4 w-full ${
                        selectedApp
                            ? "grid-cols-1 lg:grid-cols-2 3xl:grid-cols-3"
                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5"
                    }`}
                >
                    {applications.map((app) => (
                        <GridCard
                            key={app.id}
                            app={app}
                            isSelected={selectedId === app.id}
                            onSelect={() => onSelect(app)}
                            onRefresh={onRefresh}
                        />
                    ))}
                </div>
            </div>

            {/* Detail panel — 50% width on desktop, full-screen overlay on mobile */}
            {selectedApp && (
                <MobileDetailOverlay
                    isOpen
                    className="md:w-1/2 md:border-2 md:border-base-300 md:flex-shrink-0 md:self-start bg-base-100"
                >
                    <DetailLoader
                        applicationId={selectedApp.id}
                        onClose={() => onSelect(selectedApp)}
                        onRefresh={onRefresh}
                    />
                </MobileDetailOverlay>
            )}
        </div>
    );
}
