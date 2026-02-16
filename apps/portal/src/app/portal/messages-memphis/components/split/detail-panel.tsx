"use client";

import type { ConversationRow } from "../../types";
import DetailHeader from "../shared/detail-header";
import ThreadPanel from "../shared/thread-panel";

interface DetailPanelProps {
    id: string;
    item: ConversationRow | null;
    onClose: () => void;
}

export default function DetailPanel({ id, item, onClose }: DetailPanelProps) {
    return (
        <div className="flex-1 flex flex-col bg-base-100 w-full overflow-hidden">
            <DetailHeader item={item} onClose={onClose} />
            <div className="flex-1 overflow-y-auto min-h-0">
                <ThreadPanel conversationId={id} />
            </div>
        </div>
    );
}
