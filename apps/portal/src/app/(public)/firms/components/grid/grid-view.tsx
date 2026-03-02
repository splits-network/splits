"use client";

import type { PublicFirm } from "../../types";
import { GridCard } from "./grid-card";

interface GridViewProps {
    firms: PublicFirm[];
}

export function GridView({ firms }: GridViewProps) {
    return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {firms.map((firm) => (
                <GridCard key={firm.id} firm={firm} />
            ))}
        </div>
    );
}
