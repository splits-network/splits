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
        <div className="drawer drawer-end">
            <input
                type="checkbox"
                className="drawer-toggle"
                checked={!!selectedApplication}
                readOnly
            />
            <div className="drawer-content">
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
            </div>
            <div className="drawer-side">
                <div
                    className="drawer-overlay"
                    onClick={() =>
                        selectedApplication && onSelect(selectedApplication)
                    }
                    aria-label="close drawer"
                />
                <div className="bg-base-100 w-full md:w-1/2 min-h-full overflow-y-auto shadow-2xl">
                    {selectedApplication && (
                        <DetailLoader
                            applicationId={selectedApplication.id}
                            onClose={() => onSelect(selectedApplication)}
                            onRefresh={onRefresh}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
