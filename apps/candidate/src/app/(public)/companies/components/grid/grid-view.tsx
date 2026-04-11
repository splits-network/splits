"use client";

import type { PublicCompany } from "../../types";
import { GridCard } from "./grid-card";

interface GridViewProps {
    companies: PublicCompany[];
}

export function GridView({ companies }: GridViewProps) {
    return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {companies.map((company) => (
                <GridCard key={company.id} company={company} />
            ))}
        </div>
    );
}
