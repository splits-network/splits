import { formatRelativeTime } from "@/lib/utils";
import type { Company, CompanyRelationship } from "../../types";

export function companyName(item: Company | CompanyRelationship, isMarketplace: boolean): string {
    if (isMarketplace) return (item as Company).name;
    return (item as CompanyRelationship).company?.name || "Company";
}

export function companyInitials(name: string): string {
    const words = name.split(" ");
    return words.length > 1
        ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
        : (words[0]?.[0] || "").toUpperCase();
}

export function companyIndustry(item: Company | CompanyRelationship, isMarketplace: boolean): string | undefined {
    if (isMarketplace) return (item as Company).industry;
    return (item as CompanyRelationship).company?.industry;
}

export function companyLocation(item: Company | CompanyRelationship, isMarketplace: boolean): string | undefined {
    if (isMarketplace) return (item as Company).headquarters_location;
    return (item as CompanyRelationship).company?.headquarters_location;
}

export function companyId(item: Company | CompanyRelationship, isMarketplace: boolean): string {
    if (isMarketplace) return (item as Company).id;
    return (item as CompanyRelationship).company_id || (item as CompanyRelationship).company?.id;
}

export function extractCompany(item: Company | CompanyRelationship, isMarketplace: boolean): Company {
    if (isMarketplace) return item as Company;
    const rel = item as CompanyRelationship;
    return {
        id: rel.company_id || rel.company?.id,
        name: rel.company?.name || "Company",
        industry: rel.company?.industry,
        headquarters_location: rel.company?.headquarters_location,
        created_at: rel.created_at,
        updated_at: rel.updated_at,
    } as Company;
}

export function extractRelationship(item: Company | CompanyRelationship, isMarketplace: boolean): CompanyRelationship | null {
    if (isMarketplace) return null;
    return item as CompanyRelationship;
}

export function formatStatus(status?: string): string {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
}

export function addedAgo(item: Company | CompanyRelationship): string {
    return formatRelativeTime(item.created_at);
}
