"use client";

import { Application } from "../../types";
import { useFilter } from "../../contexts/filter-context";
import DetailHeader from "./detail-header";
import Details from "../shared/details";

interface DetailPanelProps {
    id: string;
    item: Application | null;
    onClose: () => void;
    onMessage?: (
        conversationId: string,
        candidateName: string,
        candidateUserId: string,
        context?: any,
    ) => void;
}

export default function DetailPanel({ id, item, onClose, onMessage }: DetailPanelProps) {
    const { refresh } = useFilter();

    return (
        <div className="flex-1 flex flex-col bg-base-100 w-full overflow-hidden">
            <DetailHeader item={item} onClose={onClose} onMessage={onMessage} />
            <div className="flex-1 overflow-y-auto">
                <Details itemId={id} onRefresh={refresh} />
            </div>
        </div>
    );
}
