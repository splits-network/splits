import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { buildCanonical, CANDIDATE_BASE_URL } from "@/lib/seo";
import CompanyProfileClient from "./company-profile-client";
import type { PublicCompany } from "../types";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;

    try {
        const response = await apiClient.get<{ data: PublicCompany }>(
            `/public/companies/${slug}`,
        );
        const company = response.data;
        const title = company.tagline
            ? `${company.name} - ${company.tagline}`
            : `${company.name} | Companies Hiring`;
        const description =
            company.description?.substring(0, 160) ||
            `View ${company.name}'s company profile and open roles on Applicant Network.`;

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                url: `${CANDIDATE_BASE_URL}/companies/${slug}`,
                ...(company.logo_url
                    ? { images: [{ url: company.logo_url }] }
                    : {}),
            },
            ...buildCanonical(`/companies/${slug}`),
        };
    } catch {
        return { title: "Company Not Found" };
    }
}

export default async function CompanyDetailPage({ params }: Props) {
    const { slug } = await params;
    let company: PublicCompany;

    try {
        const response = await apiClient.get<{ data: PublicCompany }>(
            `/public/companies/${slug}`,
        );
        company = response.data;
    } catch {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: company.name,
        url:
            company.website ||
            `${CANDIDATE_BASE_URL}/companies/${slug}`,
        description: company.description || undefined,
        ...(company.logo_url ? { logo: company.logo_url } : {}),
        ...(company.headquarters_location
            ? {
                  address: {
                      "@type": "PostalAddress",
                      addressLocality: company.headquarters_location,
                  },
              }
            : {}),
        ...(company.founded_year
            ? { foundingDate: String(company.founded_year) }
            : {}),
        ...(company.linkedin_url
            ? { sameAs: [company.linkedin_url] }
            : {}),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <CompanyProfileClient company={company} />
        </>
    );
}
