"use client";

import type { ConversationRow } from "@/app/portal/messages/types";
import DetailHeader from "./detail-header";
import ThreadPanel from "@/components/chat/thread-panel";

interface SplitDetailPanelProps {
    id: string;
    item: ConversationRow | null;
    onClose: () => void;
}

export default function SplitDetailPanel({ id, item, onClose }: SplitDetailPanelProps) {
    return (
        <div className="flex-1 flex flex-col bg-base-100 w-full overflow-hidden">
            <DetailHeader item={item} onClose={onClose} />
            {/* Square avatars for Basel — override shared thread-panel's rounded-full */}
            <div className="flex-1 overflow-y-auto min-h-0 [&_.chat-image_div.rounded-full]:rounded-none">
                <ThreadPanel conversationId={id} />
            </div>
        </div>
    );
}
