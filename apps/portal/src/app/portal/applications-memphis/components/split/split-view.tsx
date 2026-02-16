"use client";

import type { Application } from "../../types";
import { ACCENT, accentAt } from "../shared/accent";
import { DetailLoader } from "../shared/application-detail";
import { SplitItem } from "./split-item";

export function SplitView({
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
        <div className="flex gap-0 border-4 border-dark" style={{ minHeight: 600 }}>
            <div className="w-2/5 border-r-4 border-dark overflow-y-auto">
                {applications.map((application, idx) => (
                    <SplitItem
                        key={application.id}
                        application={application}
                        accent={accentAt(idx)}
                        isSelected={selectedId === application.id}
                        onSelect={() => onSelect(application)}
                    />
                ))}
            </div>

            <div className="w-3/5 bg-white overflow-y-auto">
                {selectedApplication ? (
                    <DetailLoader
                        applicationId={selectedApplication.id}
                        accent={selectedAc}
                        onClose={() => onSelect(selectedApplication)}
                        onRefresh={onRefresh}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center p-12">
                        <div className="text-center">
                            <div className="flex justify-center gap-3 mb-6">
                                <div className="w-8 h-8 rotate-12 bg-coral" />
                                <div className="w-8 h-8 rounded-full bg-teal" />
                                <div className="w-8 h-8 rotate-45 bg-yellow" />
                            </div>
                            <h3 className="font-black text-xl uppercase tracking-tight mb-2 text-dark">Select an Application</h3>
                            <p className="text-sm text-dark/50">Click an application on the left to view details</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
