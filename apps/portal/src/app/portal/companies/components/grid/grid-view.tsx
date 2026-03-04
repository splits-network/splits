"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import type { Company, CompanyRelationship, CompanyTab } from "../../types";
import { CompanyDetailLoader } from "../shared/company-detail";
import { companyId } from "../shared/helpers";
import { GridCard } from "./grid-card";

type TagMap = Record<string, { skills: string[]; perks: string[] }>;

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

    const selectedItem = items.find(
        (item) => companyId(item, isMarketplace) === selectedId,
    );

    useEffect(() => {
        if (!isMarketplace || items.length === 0) return;

        const companyIds = items.map((item) =>
            companyId(item, true),
        ).filter(Boolean);

        if (companyIds.length === 0) return;

        let cancelled = false;

        async function fetchTags() {
            try {
                const token = await getToken();
                if (!token || cancelled) return;
                const client = createAuthenticatedClient(token);

                const results = await Promise.all(
                    companyIds.map(async (cId) => {
                        const [skillsRes, perksRes] = await Promise.all([
                            client.get(`/company-skills?company_id=${cId}`),
                            client.get(`/company-perks?company_id=${cId}`),
                        ]);

                        const skills = (skillsRes.data || [])
                            .filter((r: any) => r.skill)
                            .map((r: any) => r.skill.name as string);

                        const perks = (perksRes.data || [])
                            .filter((r: any) => r.perk)
                            .map((r: any) => r.perk.name as string);

                        return { cId, skills, perks };
                    }),
                );

                if (cancelled) return;

                const map: TagMap = {};
                for (const { cId, skills, perks } of results) {
                    map[cId] = { skills, perks };
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

    return (
        <div className="relative">
            {/* Grid */}
            <div className="grid gap-4 w-full grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => {
                    const cId = companyId(item, isMarketplace);
                    return (
                        <GridCard
                            key={
                                isMarketplace
                                    ? (item as Company).id
                                    : (item as CompanyRelationship).id
                            }
                            item={item}
                            activeTab={activeTab}
                            isSelected={selectedId === cId}
                            onSelect={() => onSelectAction(item)}
                            onRefresh={onRefreshAction}
                            techStack={tagMap[cId]?.skills ?? []}
                            perks={tagMap[cId]?.perks ?? []}
                        />
                    );
                })}
            </div>

            {/* Detail Drawer */}
            {selectedItem && selectedId && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/30 transition-opacity"
                        onClick={() => onSelectAction(selectedItem)}
                    />
                    <div className="fixed top-0 right-0 z-50 h-full w-full md:w-[480px] lg:w-[540px] bg-base-100 shadow-2xl border-l border-base-300 overflow-y-auto animate-slide-in-right">
                        <CompanyDetailLoader
                            companyId={selectedId}
                            onClose={() => onSelectAction(selectedItem)}
                            onRefresh={onRefreshAction}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
