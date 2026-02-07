"use client";

import DetailHeader from "./detail-header";
import Details from "../shared/details";

interface DetailPanelProps {
    id: string;
    onClose: () => void;
}

export default function DetailPanel({ id, onClose }: DetailPanelProps) {
    return (
        <div className="flex-1 flex flex-col bg-base-100 w-full overflow-hidden">
            <DetailHeader id={id} onClose={onClose} />
            <div className="flex-1 overflow-y-auto">
                <Details companyId={id} />
            </div>
        </div>
    );
}
