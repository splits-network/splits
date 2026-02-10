"use client";

import { Candidate } from "../../types";
import { useFilter } from "../../contexts/filter-context";
import DetailHeader from "./detail-header";
import Details from "../shared/details";

interface DetailPanelProps {
    id: string;
    item: Candidate | null;
    onClose: () => void;
}

export default function DetailPanel({ id, item, onClose }: DetailPanelProps) {
    const { refresh } = useFilter();

    return (
        <div className="flex-1 flex flex-col bg-base-100 w-full overflow-hidden">
            <DetailHeader item={item} onClose={onClose} onRefresh={refresh} />
            <div className="flex-1 overflow-y-auto">
                <Details itemId={id} onRefresh={refresh} />
            </div>
        </div>
    );
}
