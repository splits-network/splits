"use client";

import type { Placement } from "../../types";
import ActionsToolbar from "../shared/actions-toolbar";

interface DetailHeaderProps {
    item: Placement | null;
    onClose: () => void;
}

export default function DetailHeader({ item, onClose }: DetailHeaderProps) {
    return (
        <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 p-3 flex items-center justify-between">
            {/* Mobile back button */}
            <button
                onClick={onClose}
                className="btn btn-sm btn-ghost md:hidden"
            >
                <i className="fa-duotone fa-regular fa-chevron-left mr-1" />
                Back
            </button>

            <span className="text-sm font-medium text-base-content/60 hidden md:block">
                Placement Details
            </span>

            <div className="flex items-center gap-2">
                {item && (
                    <ActionsToolbar
                        placement={item}
                        variant="descriptive"
                        size="md"
                        showActions={{
                            viewDetails: false,
                            statusActions: true,
                        }}
                    />
                )}
                <button
                    onClick={onClose}
                    className="btn btn-sm btn-square btn-ghost hidden md:flex"
                    aria-label="Close"
                >
                    <i className="fa-duotone fa-regular fa-xmark" />
                </button>
            </div>
        </div>
    );
}
