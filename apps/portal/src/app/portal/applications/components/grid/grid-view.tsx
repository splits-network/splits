"use client";

import type { Application } from "../../types";
import { ACCENT, accentAt } from "../shared/accent";
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
    const selectedApplication = applications.find((a) => a.id === selectedId);
    const selectedAc = selectedApplication ? accentAt(applications.indexOf(selectedApplication)) : ACCENT[0];

    return (
        <div className="flex gap-6">
            <div className="flex flex-col w-full">
                <div
                    className={`grid gap-4 w-full ${
                        selectedApplication
                            ? "grid-cols-1 lg:grid-cols-2"
                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    }`}
                >
                    {applications.map((application, idx) => (
                        <GridCard
                            key={application.id}
                            application={application}
                            accent={accentAt(idx)}
                            isSelected={selectedId === application.id}
                            onSelect={() => onSelect(application)}
                            onRefresh={onRefresh}
                        />
                    ))}
                </div>
            </div>

            {selectedApplication && (
                <div className={`w-1/2 border-4 flex-shrink-0 self-start bg-white ${selectedAc.border}`}>
                    <DetailLoader
                        applicationId={selectedApplication.id}
                        accent={selectedAc}
                        onClose={() => onSelect(selectedApplication)}
                        onRefresh={onRefresh}
                    />
                </div>
            )}
        </div>
    );
}
