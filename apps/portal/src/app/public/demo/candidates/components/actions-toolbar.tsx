"use client";

interface ActionsToolbarProps {
    selectedCount: number;
    onClearSelection: () => void;
    onBulkAction: (action: string) => void;
}

export function ActionsToolbar({
    selectedCount,
    onClearSelection,
    onBulkAction,
}: ActionsToolbarProps) {
    return (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="font-medium">
                        {selectedCount} candidate
                        {selectedCount !== 1 ? "s" : ""} selected
                    </span>

                    <button
                        className="btn btn-sm btn-ghost"
                        onClick={onClearSelection}
                    >
                        <i className="fa-duotone fa-regular fa-xmark"></i>
                        Clear selection
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        className="btn btn-sm btn-outline"
                        onClick={() => onBulkAction("export")}
                    >
                        <i className="fa-duotone fa-regular fa-download"></i>
                        Export
                    </button>

                    <button
                        className="btn btn-sm btn-outline"
                        onClick={() => onBulkAction("email")}
                    >
                        <i className="fa-duotone fa-regular fa-envelope"></i>
                        Send Email
                    </button>

                    <button
                        className="btn btn-sm btn-outline"
                        onClick={() => onBulkAction("tag")}
                    >
                        <i className="fa-duotone fa-regular fa-tags"></i>
                        Add Tags
                    </button>

                    <div className="dropdown dropdown-end">
                        <div
                            tabIndex={0}
                            role="button"
                            className="btn btn-sm btn-outline"
                        >
                            <i className="fa-duotone fa-regular fa-ellipsis-horizontal"></i>
                            More Actions
                        </div>
                        <ul className="dropdown-content menu bg-base-100 rounded-box z-[1] w-48 p-1 shadow-lg border border-base-200">
                            <li>
                                <button onClick={() => onBulkAction("verify")}>
                                    <i className="fa-duotone fa-regular fa-circle-check"></i>
                                    Mark as Verified
                                </button>
                            </li>
                            <li>
                                <button onClick={() => onBulkAction("archive")}>
                                    <i className="fa-duotone fa-regular fa-archive"></i>
                                    Archive
                                </button>
                            </li>
                            <li>
                                <button onClick={() => onBulkAction("assign")}>
                                    <i className="fa-duotone fa-regular fa-user-plus"></i>
                                    Assign to Recruiter
                                </button>
                            </li>
                            <li>
                                <hr className="my-1" />
                            </li>
                            <li>
                                <button
                                    onClick={() => onBulkAction("delete")}
                                    className="text-error"
                                >
                                    <i className="fa-duotone fa-regular fa-trash"></i>
                                    Delete Selected
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
