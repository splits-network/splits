"use client";

import { useConnectionFilter } from "../../contexts/filter-context";
import DetailHeader from "./detail-header";
import Details from "../shared/details";
import ConnectionActionsToolbar from "../shared/actions-toolbar";

interface DetailPanelProps {
    id: string;
    onClose: () => void;
}

export default function DetailPanel({ id, onClose }: DetailPanelProps) {
    const { data: invitations } = useConnectionFilter();

    const invitation = invitations.find((inv) => inv.id === id);

    return (
        <div className="flex-1 flex flex-col bg-base-100 w-full overflow-hidden">
            <DetailHeader
                invitation={invitation || null}
                onClose={onClose}
            />
            <div className="flex-1 overflow-y-auto">
                {invitation && (
                    <>
                        {/* Actions */}
                        <div className="px-6 pt-4">
                            <ConnectionActionsToolbar
                                invitation={invitation}
                                variant="descriptive"
                                layout="horizontal"
                                size="md"
                            />
                        </div>
                        <Details invitation={invitation} />
                    </>
                )}
            </div>
        </div>
    );
}
