"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { Company, CompanyRelationship } from "../../types";
import ActionsToolbar from "../shared/actions-toolbar";
import { useFilter } from "../../contexts/filter-context";

interface DetailHeaderProps {
    id: string;
    onClose: () => void;
}

export default function DetailHeader({ id, onClose }: DetailHeaderProps) {
    const { getToken } = useAuth();
    const {
        marketplaceContext: { refresh: refreshMarketplace },
        myCompaniesContext: { refresh: refreshMyCompanies },
    } = useFilter();

    const [company, setCompany] = useState<Company | null>(null);
    const [relationship, setRelationship] =
        useState<CompanyRelationship | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await getToken();
                if (!token) return;
                const client = createAuthenticatedClient(token);

                const companyResponse: any = await client.get(
                    `/companies/${id}`,
                );
                setCompany(companyResponse.data);

                const relResponse: any = await client.get(
                    "/recruiter-companies",
                    { params: { company_id: id, limit: 1 } },
                );
                if (relResponse.data && relResponse.data.length > 0) {
                    setRelationship(relResponse.data[0]);
                }
            } catch (err) {
                console.error("Failed to fetch header data:", err);
            }
        };

        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleRefresh = () => {
        refreshMarketplace();
        refreshMyCompanies();
    };

    return (
        <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                    {/* Mobile back button */}
                    <button
                        onClick={onClose}
                        className="btn btn-sm btn-ghost md:hidden"
                    >
                        <i className="fa-duotone fa-regular fa-arrow-left" />
                    </button>
                    <h2 className="text-lg font-bold truncate">
                        <i className="fa-duotone fa-regular fa-building mr-2" />
                        {company?.name || "Loading..."}
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    {company && (
                        <ActionsToolbar
                            company={company}
                            relationship={relationship}
                            variant="icon-only"
                            size="sm"
                            onRefresh={handleRefresh}
                        />
                    )}
                    <button
                        onClick={onClose}
                        className="btn btn-sm btn-circle btn-ghost hidden md:flex"
                    >
                        <i className="fa-duotone fa-regular fa-xmark" />
                    </button>
                </div>
            </div>
        </div>
    );
}
