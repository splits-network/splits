"use client";

import { useEffect, useRef } from "react";
import { useDrawer } from "@/contexts";
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
    onSelect: (app: Application) => void;
    selectedId: string | null;
    onRefresh?: () => void;
}) {
    const selectedApp =
        applications.find((a) => a.id === selectedId) ?? null;
    const { open, close, isOpen } = useDrawer();
    const wasOpen = useRef(false);

    useEffect(() => {
        if (wasOpen.current && !isOpen && selectedApp) {
            onSelect(selectedApp);
        }
        wasOpen.current = isOpen;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    useEffect(() => {
        if (selectedApp) {
            open(
                <DetailLoader
                    applicationId={selectedApp.id}
                    onClose={() => onSelect(selectedApp)}
                    onRefresh={onRefresh}
                />,
            );
        } else {
            close();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedApp?.id]);

    return (
        <div className="grid gap-4 w-full grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
    );
}
