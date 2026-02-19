"use client";

import type { Application } from "../../types";
import { DetailLoader } from "../shared/application-detail";
import { MobileDetailOverlay } from "@/components/standard-lists";
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

    return (
        <div className="flex border-2 border-base-300" style={{ minHeight: 600 }}>
            {/* Left list — hidden on mobile when an application is selected */}
            <div
                className={`w-full lg:w-[40%] xl:w-[35%] border-r-2 border-base-300 overflow-y-auto ${
                    selectedId ? "hidden lg:block" : "block"
                }`}
            >
                {applications.map((application) => (
                    <SplitItem
                        key={application.id}
                        application={application}
                        isSelected={selectedId === application.id}
                        onSelect={() => onSelect(application)}
                    />
                ))}
            </div>

            {/* Right detail — MobileDetailOverlay handles mobile portal */}
            <MobileDetailOverlay
                isOpen={!!selectedApplication}
                className="lg:flex-1 w-full bg-base-100 overflow-y-auto"
            >
                {selectedApplication ? (
                    <DetailLoader
                        applicationId={selectedApplication.id}
                        onClose={() => onSelect(selectedApplication)}
                        onRefresh={onRefresh}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center p-12">
                        <div className="text-center">
                            <i className="fa-duotone fa-regular fa-hand-pointer text-4xl text-base-content/15 mb-4 block" />
                            <p className="text-sm font-bold uppercase tracking-wider text-base-content/30">
                                Select an application
                            </p>
                        </div>
                    </div>
                )}
            </MobileDetailOverlay>
        </div>
    );
}
