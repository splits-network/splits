"use client";

import { useEffect } from "react";
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
    onSelect: (a: Application) => void;
    selectedId: string | null;
    onRefresh?: () => void;
}) {
    const selectedApplication =
        applications.find((a) => a.id === selectedId) ?? null;
    const { open, close } = useDrawer();

    useEffect(() => {
        if (selectedApplication) {
            open(
                <DetailLoader
                    applicationId={selectedApplication.id}
                    onClose={() => onSelect(selectedApplication)}
                    onRefresh={onRefresh}
                />,
            );
        } else {
            close();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedApplication?.id]);

    return (
        <div className="grid gap-4 w-full grid-cols-1 md:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4">
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
    );
}
