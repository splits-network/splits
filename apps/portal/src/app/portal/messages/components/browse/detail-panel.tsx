"use client";

import ThreadPanel from "../thread-panel";

interface DetailPanelProps {
    id: string | null;
    onClose: () => void;
}

export default function DetailPanel({ id, onClose }: DetailPanelProps) {
    if (!id) {
        return (
            <div className="flex h-full items-center justify-center text-base-content/60">
                <div className="text-center">
                    <i className="fa-duotone fa-regular fa-inbox text-4xl mb-3 opacity-40"></i>
                    <p>Select a conversation to view messages.</p>
                </div>
            </div>
        );
    }

    return <ThreadPanel conversationId={id} onClose={onClose} />;
}
