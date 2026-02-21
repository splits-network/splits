"use client";

import type { Application } from "../../types";
import { MobileDetailOverlay } from "@/components/standard-lists";
import { DetailLoader } from "../shared/application-detail";
import { SplitItem } from "./split-item";

export function SplitView({
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
        <div
            className="flex border-2 border-base-300"
            style={{ minHeight: 600 }}
        >
            {/* Left list — hidden on mobile when an application is selected */}
            <div
                className={`w-full md:w-2/5 border-r-2 border-base-300 overflow-y-auto ${
                    selectedId ? "hidden md:block" : "block"
                }`}
            >
                {applications.map((app) => (
                    <SplitItem
                        key={app.id}
                        app={app}
                        isSelected={selectedId === app.id}
                        onSelect={() => onSelect(app)}
                    />
                ))}
            </div>

            {/* Right detail — MobileDetailOverlay handles mobile portal */}
            <MobileDetailOverlay
                isOpen={!!selectedApp}
                className="md:w-3/5 w-full bg-base-100"
            >
                {selectedApp ? (
                    <DetailLoader
                        applicationId={selectedApp.id}
                        onClose={() => onSelect(selectedApp)}
                        onRefresh={onRefresh}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center p-12">
                        <div className="text-center">
                            <i className="fa-duotone fa-regular fa-hand-pointer text-5xl text-base-content/30 mb-4" />
                            <h3 className="font-bold text-base text-base-content/30 tracking-tight">
                                Select an application to view details
                            </h3>
                        </div>
                    </div>
                )}
            </MobileDetailOverlay>
        </div>
    );
}
