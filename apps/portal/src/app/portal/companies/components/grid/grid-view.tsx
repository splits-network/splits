"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useDrawer } from "@/contexts";
import { createAuthenticatedClient } from "@/lib/api-client";
import type { Company, CompanyRelationship, CompanyTab } from "../../types";
import { CompanyDetailLoader } from "../shared/company-detail";
import { companyId, rowId } from "../shared/helpers";
import { GridCard } from "./grid-card";

type TagMap = Record<
    string,
    { skills: string[]; perks: string[]; cultureTags: string[] }
>;

export function GridView({
    items,
    activeTab,
    onSelectAction,
    selectedId,
    onRefreshAction,
}: {
    items: (Company | CompanyRelationship)[];
    activeTab: CompanyTab;
    onSelectAction: (item: Company | CompanyRelationship) => void;
    selectedId: string | null;
    onRefreshAction?: () => void;
}) {
    const isMarketplace = activeTab === "marketplace";
    const { getToken } = useAuth();
    const [tagMap, setTagMap] = useState<TagMap>({});
    const { open, close, isOpen } = useDrawer();
    const wasOpen = useRef(false);

    const selectedItem = items.find(
        (item) => rowId(item, isMarketplace) === selectedId,
    );

    useEffect(() => {
        if (wasOpen.current && !isOpen && selectedItem) {
            onSelectAction(selectedItem);
        }
        wasOpen.current = isOpen;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    useEffect(() => {
        if (items.length === 0) return;

        const companyIds = [...new Set(
            items.map((item) => companyId(item, isMarketplace)).filter(Boolean),
        )];

        if (companyIds.length === 0) return;

        let cancelled = false;

        async function fetchTags() {
            try {
                const token = await getToken();
                if (!token || cancelled) return;
                const client = createAuthenticatedClient(token);

                const results = await Promise.all(
                    companyIds.map(async (cId) => {
                        const [skillsRes, perksRes, cultureRes] =
                            await Promise.all([
                                client.get(`/company-skills?company_id=${cId}`),
                                client.get(`/company-perks?company_id=${cId}`),
                                client.get(
                                    `/company-culture-tags?company_id=${cId}`,
                                ),
                            ]);

                        const skills = (skillsRes.data || [])
                            .filter((r: any) => r.skill)
                            .map((r: any) => r.skill.name as string);

                        const perks = (perksRes.data || [])
                            .filter((r: any) => r.perk)
                            .map((r: any) => r.perk.name as string);

                        const cultureTags = (cultureRes.data || [])
                            .filter((r: any) => r.culture_tag)
                            .map((r: any) => r.culture_tag.name as string);

                        return { cId, skills, perks, cultureTags };
                    }),
                );

                if (cancelled) return;

                const map: TagMap = {};
                for (const { cId, skills, perks, cultureTags } of results) {
                    map[cId] = { skills, perks, cultureTags };
                }
                setTagMap(map);
            } catch (err) {
                console.error("Failed to fetch company junction data:", err);
            }
        }

        fetchTags();

        return () => {
            cancelled = true;
        };
    }, [items, isMarketplace]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (selectedItem && selectedId) {
            open(
                <CompanyDetailLoader
                    companyId={companyId(selectedItem, isMarketplace)}
                    onClose={() => onSelectAction(selectedItem)}
                    onRefresh={onRefreshAction}
                />,
            );
        } else {
            close();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedId]);

    return (
        <div className="grid gap-4 w-full grid-cols-1 md:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4">
            {items.map((item) => {
                const rId = rowId(item, isMarketplace);
                const cId = companyId(item, isMarketplace);
                return (
                    <GridCard
                        key={rId}
                        item={item}
                        activeTab={activeTab}
                        isSelected={selectedId === rId}
                        onSelect={() => onSelectAction(item)}
                        onRefresh={onRefreshAction}
                        techStack={tagMap[cId]?.skills ?? []}
                        perks={tagMap[cId]?.perks ?? []}
                        cultureTags={tagMap[cId]?.cultureTags ?? []}
                    />
                );
            })}
        </div>
    );
}
