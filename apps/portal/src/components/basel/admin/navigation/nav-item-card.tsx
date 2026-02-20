"use client";

import { useState } from "react";
import type { NavItem, NavSubItem } from "@splits-network/shared-types";
import { BaselFormField } from "@splits-network/basel-ui";
import { RepeatingListEditor } from "../shared/repeating-list-editor";
import { SortableItemWrapper } from "../shared/sortable-item-wrapper";

interface NavItemCardProps {
    id: string;
    item: NavItem;
    onChange: (item: NavItem) => void;
    onDelete: () => void;
}

export function NavItemCard({ id, item, onChange, onDelete }: NavItemCardProps) {
    const [expanded, setExpanded] = useState(false);
    const hasSubItems = (item.subItems?.length ?? 0) > 0;

    function update(patch: Partial<NavItem>) {
        onChange({ ...item, ...patch });
    }

    function handleSubItemsChange(subItems: NavSubItem[]) {
        onChange({ ...item, subItems });
    }

    return (
        <SortableItemWrapper id={id}>
            {({ dragHandleProps }) => (
                <div className="bg-base-100 border border-base-300 group">
                    {/* Top row */}
                    <div className="flex items-center gap-2 p-3">
                        <button
                            type="button"
                            ref={dragHandleProps.ref}
                            {...dragHandleProps.listeners}
                            {...dragHandleProps.attributes}
                            className="cursor-grab active:cursor-grabbing text-base-content/30 hover:text-base-content/60"
                            tabIndex={-1}
                        >
                            <i className="fa-duotone fa-regular fa-grip-dots-vertical"></i>
                        </button>

                        <div className="flex-1 grid grid-cols-3 gap-2">
                            <input
                                type="text"
                                className="input input-bordered input-sm"
                                value={item.label}
                                onChange={(e) => update({ label: e.target.value })}
                                placeholder="Label"
                            />
                            <input
                                type="text"
                                className="input input-bordered input-sm"
                                value={item.icon || ""}
                                onChange={(e) => update({ icon: e.target.value || undefined })}
                                placeholder="Icon (optional)"
                            />
                            <input
                                type="text"
                                className="input input-bordered input-sm"
                                value={item.href || ""}
                                onChange={(e) => update({ href: e.target.value || null })}
                                placeholder={hasSubItems ? "No link (has dropdown)" : "/path"}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => setExpanded(!expanded)}
                            className={`btn btn-ghost btn-xs ${hasSubItems ? "text-primary" : ""}`}
                            title={hasSubItems ? "Edit sub-items" : "Add sub-items"}
                        >
                            <i className={`fa-duotone fa-regular ${expanded ? "fa-chevron-up" : "fa-chevron-down"}`}></i>
                            {hasSubItems && (
                                <span className="text-[10px] ml-0.5">{item.subItems!.length}</span>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={onDelete}
                            className="btn btn-ghost btn-xs text-error opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove"
                        >
                            <i className="fa-duotone fa-regular fa-trash-can"></i>
                        </button>
                    </div>

                    {/* Sub-items (expanded) */}
                    {expanded && (
                        <div className="border-t border-base-300 p-3 bg-base-200/50">
                            <div className="text-xs font-semibold uppercase tracking-widest text-base-content/50 mb-2">
                                Dropdown Items
                            </div>
                            <RepeatingListEditor<NavSubItem>
                                items={item.subItems || []}
                                onChange={handleSubItemsChange}
                                defaultItem={() => ({ icon: "", label: "", desc: "", href: "" })}
                                addLabel="Add Sub-item"
                                renderItem={(sub, _index, updateSub) => (
                                    <div className="grid grid-cols-4 gap-2">
                                        <input
                                            type="text"
                                            className="input input-bordered input-xs"
                                            value={sub.icon}
                                            onChange={(e) => updateSub({ icon: e.target.value })}
                                            placeholder="Icon"
                                        />
                                        <input
                                            type="text"
                                            className="input input-bordered input-xs"
                                            value={sub.label}
                                            onChange={(e) => updateSub({ label: e.target.value })}
                                            placeholder="Label"
                                        />
                                        <input
                                            type="text"
                                            className="input input-bordered input-xs"
                                            value={sub.desc}
                                            onChange={(e) => updateSub({ desc: e.target.value })}
                                            placeholder="Description"
                                        />
                                        <input
                                            type="text"
                                            className="input input-bordered input-xs"
                                            value={sub.href}
                                            onChange={(e) => updateSub({ href: e.target.value })}
                                            placeholder="/path"
                                        />
                                    </div>
                                )}
                            />
                        </div>
                    )}
                </div>
            )}
        </SortableItemWrapper>
    );
}
