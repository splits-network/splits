"use client";

import type { Application } from "../../types";
import { DetailLoader } from "../shared/application-detail";
import { MobileDetailOverlay } from "@/components/standard-lists";
import { GridCard } from "./grid-card";

export function GridView({
    applications,
    onSelect,
    selectedId,
    onRefresh,
}: {
    applications: Application[];
    onSelect: (a: Application) => void;
    selectedId: string | null;
    onRefresh?: () => void;
}) {
    const selectedApplication =
        applications.find((a) => a.id === selectedId) ?? null;

    return (
        <div className="flex gap-6">
            {/* Card grid — hidden on mobile when a detail is open */}
            <div
                className={`flex flex-col w-full ${selectedApplication ? "hidden md:flex" : "flex"}`}
            >
                <div
                    className={`grid gap-4 w-full ${
                        selectedApplication
                            ? "grid-cols-1 md:grid-cols-2"
                            : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                    }`}
                >
                    {applications.map((application) => (
                        <GridCard
                            key={application.id}
                            application={application}
                            isSelected={selectedId === application.id}
                            onSelect={() => onSelect(application)}
                            onRefresh={onRefresh}
                        />
                    ))}
                </div>
            </div>

            {/* Detail sidebar — 45% width on lg+, full-screen overlay on mobile */}
            {selectedApplication && (
                <MobileDetailOverlay
                    isOpen
                    className="md:w-[45%] md:flex-shrink-0 md:self-start bg-base-100 border-l-4 border-primary"
                >
                    <div className="h-full sticky top-[140px] overflow-y-auto">
                        <DetailLoader
                            applicationId={selectedApplication.id}
                            onClose={() => onSelect(selectedApplication)}
                            onRefresh={onRefresh}
                        />
                    </div>
                </MobileDetailOverlay>
            )}
        </div>
    );
}
