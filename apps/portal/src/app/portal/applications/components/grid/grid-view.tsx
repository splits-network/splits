"use client";

import type { Application } from "../../types";
import { DetailLoader } from "../shared/application-detail";
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
        <div className="relative">
            {/* Grid */}
            <div className="grid gap-4 w-full grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
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

            {/* Detail Drawer */}
            {selectedApplication && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/30 transition-opacity"
                        onClick={() => onSelect(selectedApplication)}
                    />
                    <div className="fixed top-0 right-0 z-50 h-full w-full md:w-[480px] lg:w-[540px] bg-base-100 shadow-2xl border-l border-base-300 overflow-y-auto animate-slide-in-right">
                        <DetailLoader
                            applicationId={selectedApplication.id}
                            onClose={() => onSelect(selectedApplication)}
                            onRefresh={onRefresh}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
