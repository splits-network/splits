import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { buildCanonical, PORTAL_BASE_URL } from "@/lib/seo";
import FirmProfileClient from "./firm-profile-client";
import type { PublicFirm } from "../types";
import { firmLocation } from "../types";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;

    try {
        const response = await apiClient.get<{ data: PublicFirm }>(
            `/public/firms/${slug}`,
        );
        const firm = response.data;
        const title = firm.tagline
            ? `${firm.name} - ${firm.tagline}`
            : `${firm.name} | Recruiting Firm`;
        const description =
            firm.description?.substring(0, 160) ||
            `View ${firm.name}'s recruiting firm profile on Splits Network.`;

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                url: `https://splits.network/firms/${slug}`,
                ...(firm.logo_url ? { images: [{ url: firm.logo_url }] } : {}),
            },
            ...buildCanonical(`/firms/${slug}`),
        };
    } catch {
        return { title: "Firm Not Found" };
    }
}

export default async function FirmDetailPage({ params }: Props) {
    const { slug } = await params;
    let firm: PublicFirm;

    try {
        const response = await apiClient.get<{ data: PublicFirm }>(
            `/public/firms/${slug}`,
        );
        firm = response.data;
    } catch {
        notFound();
    }

    const location = firmLocation(firm);
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: firm.name,
        url: firm.website_url || `${PORTAL_BASE_URL}/firms/${slug}`,
        description: firm.description || undefined,
        ...(firm.logo_url ? { logo: firm.logo_url } : {}),
        ...(location
            ? {
                  address: {
                      "@type": "PostalAddress",
                      addressLocality: firm.headquarters_city,
                      addressRegion: firm.headquarters_state,
                      addressCountry: firm.headquarters_country,
                  },
              }
            : {}),
        ...(firm.founded_year
            ? { foundingDate: String(firm.founded_year) }
            : {}),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <FirmProfileClient firm={firm} />
        </>
    );
}
