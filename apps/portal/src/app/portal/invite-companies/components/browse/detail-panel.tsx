"use client";

import { useInvitationFilter } from "../../contexts/filter-context";
import DetailHeader from "./detail-header";
import Details from "../shared/details";

interface DetailPanelProps {
    id: string;
    onClose: () => void;
}

export default function DetailPanel({ id, onClose }: DetailPanelProps) {
    const { data: invitations, refresh } = useInvitationFilter();

    // Find the invitation in the list for the header
    const invitation = invitations.find((inv) => inv.id === id);

    return (
        <div className="flex-1 flex flex-col bg-base-100 w-full overflow-hidden">
            <DetailHeader
                invitation={invitation || null}
                onClose={onClose}
            />
            <div className="flex-1 overflow-y-auto">
                <Details invitationId={id} onRefresh={refresh} />
            </div>
        </div>
    );
}
