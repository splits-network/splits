"use client";

import { useCallback } from "react";
import type {
    FooterNavConfig,
    FooterSection,
    FooterSocialLink,
    FooterTrustStat,
    FooterLinkItem,
} from "@splits-network/shared-types";
import { RepeatingListEditor } from "../shared/repeating-list-editor";

interface FooterNavEditorProps {
    config: FooterNavConfig;
    onChange: (config: FooterNavConfig) => void;
}

function SectionTitle({
    icon,
    title,
    count,
}: {
    icon: string;
    title: string;
    count: number;
}) {
    return (
        <h4 className="text-sm font-semibold text-base-content/70 flex items-center gap-2 mb-3">
            <i className={`fa-duotone fa-regular ${icon} text-primary`}></i>
            {title}
            <span className="badge badge-xs badge-ghost">{count}</span>
        </h4>
    );
}

export function FooterNavEditor({ config, onChange }: FooterNavEditorProps) {
    const update = useCallback(
        (patch: Partial<FooterNavConfig>) => onChange({ ...config, ...patch }),
        [config, onChange],
    );

    return (
        <div className="space-y-8">
            {/* Link Sections */}
            <div>
                <SectionTitle
                    icon="fa-table-columns"
                    title="Link Sections"
                    count={config.sections.length}
                />
                <RepeatingListEditor<FooterSection>
                    items={config.sections}
                    onChange={(sections) => update({ sections })}
                    defaultItem={() => ({ title: "", links: [] })}
                    addLabel="Add Section"
                    renderItem={(section, _index, updateSection) => (
                        <div className="space-y-2">
                            <input
                                type="text"
                                className="input input-bordered input-sm w-full"
                                value={section.title}
                                onChange={(e) =>
                                    updateSection({ title: e.target.value })
                                }
                                placeholder="Section title (e.g., Platform, Resources)"
                            />
                            <div className="pl-4 border-l-2 border-primary/20">
                                <RepeatingListEditor<FooterLinkItem>
                                    items={section.links}
                                    onChange={(links) =>
                                        updateSection({ links })
                                    }
                                    defaultItem={() => ({
                                        label: "",
                                        href: "",
                                    })}
                                    addLabel="Add Link"
                                    renderItem={(link, _i, updateLink) => (
                                        <div className="grid grid-cols-3 gap-2">
                                            <input
                                                type="text"
                                                className="input input-bordered input-xs"
                                                value={link.label}
                                                onChange={(e) =>
                                                    updateLink({
                                                        label: e.target.value,
                                                    })
                                                }
                                                placeholder="Label"
                                            />
                                            <input
                                                type="text"
                                                className="input input-bordered input-xs"
                                                value={link.href}
                                                onChange={(e) =>
                                                    updateLink({
                                                        href: e.target.value,
                                                    })
                                                }
                                                placeholder="/path or https://..."
                                            />
                                            <label className="flex items-center gap-1.5 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="checkbox checkbox-xs"
                                                    checked={
                                                        link.external || false
                                                    }
                                                    onChange={(e) =>
                                                        updateLink({
                                                            external:
                                                                e.target
                                                                    .checked,
                                                        })
                                                    }
                                                />
                                                <span className="text-xs text-base-content/50">
                                                    External
                                                </span>
                                            </label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>
                    )}
                />
            </div>

            {/* Social Links */}
            <div>
                <SectionTitle
                    icon="fa-share-nodes"
                    title="Social Links"
                    count={config.socialLinks.length}
                />
                <RepeatingListEditor<FooterSocialLink>
                    items={config.socialLinks}
                    onChange={(socialLinks) => update({ socialLinks })}
                    defaultItem={() => ({ icon: "", href: "", label: "" })}
                    addLabel="Add Social Link"
                    renderItem={(link, _index, updateLink) => (
                        <div className="grid grid-cols-3 gap-2">
                            <input
                                type="text"
                                className="input input-bordered input-sm"
                                value={link.icon}
                                onChange={(e) =>
                                    updateLink({ icon: e.target.value })
                                }
                                placeholder="fa-brands fa-linkedin-in"
                            />
                            <input
                                type="text"
                                className="input input-bordered input-sm"
                                value={link.href}
                                onChange={(e) =>
                                    updateLink({ href: e.target.value })
                                }
                                placeholder="https://..."
                            />
                            <input
                                type="text"
                                className="input input-bordered input-sm"
                                value={link.label}
                                onChange={(e) =>
                                    updateLink({ label: e.target.value })
                                }
                                placeholder="Label (e.g., LinkedIn)"
                            />
                        </div>
                    )}
                />
            </div>

            {/* Trust Stats */}
            <div>
                <SectionTitle
                    icon="fa-chart-simple"
                    title="Trust Stats"
                    count={config.trustStats.length}
                />
                <RepeatingListEditor<FooterTrustStat>
                    items={config.trustStats}
                    onChange={(trustStats) => update({ trustStats })}
                    defaultItem={() => ({ value: "", label: "" })}
                    addLabel="Add Stat"
                    renderItem={(stat, _index, updateStat) => (
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="text"
                                className="input input-bordered input-sm"
                                value={stat.value}
                                onChange={(e) =>
                                    updateStat({ value: e.target.value })
                                }
                                placeholder="Value (e.g., 2,847)"
                            />
                            <input
                                type="text"
                                className="input input-bordered input-sm"
                                value={stat.label}
                                onChange={(e) =>
                                    updateStat({ label: e.target.value })
                                }
                                placeholder="Label (e.g., Recruiters)"
                            />
                        </div>
                    )}
                />
            </div>

            {/* Legal Links */}
            <div>
                <SectionTitle
                    icon="fa-scale-balanced"
                    title="Legal Links"
                    count={config.legalLinks.length}
                />
                <RepeatingListEditor<FooterLinkItem>
                    items={config.legalLinks}
                    onChange={(legalLinks) => update({ legalLinks })}
                    defaultItem={() => ({ label: "", href: "" })}
                    addLabel="Add Legal Link"
                    renderItem={(link, _index, updateLink) => (
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="text"
                                className="input input-bordered input-sm"
                                value={link.label}
                                onChange={(e) =>
                                    updateLink({ label: e.target.value })
                                }
                                placeholder="Label (e.g., Privacy Policy)"
                            />
                            <input
                                type="text"
                                className="input input-bordered input-sm"
                                value={link.href}
                                onChange={(e) =>
                                    updateLink({ href: e.target.value })
                                }
                                placeholder="/privacy-policy"
                            />
                        </div>
                    )}
                />
            </div>
        </div>
    );
}
