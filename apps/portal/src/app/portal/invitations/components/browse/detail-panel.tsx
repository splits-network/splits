"use client";

import { Invitation } from "../../types";
import DetailHeader from "./detail-header";
import Details from "../shared/details";

interface DetailPanelProps {
    id: string;
    item: Invitation | null;
    onClose: () => void;
}

export default function DetailPanel({ id, item, onClose }: DetailPanelProps) {
    return (
        <div className="flex-1 flex flex-col bg-base-100 w-full overflow-hidden">
            <DetailHeader item={item} onClose={onClose} />
            <div className="flex-1 overflow-y-auto">
                <Details itemId={id} />
            </div>
        </div>
    );
}
