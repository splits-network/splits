import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createUnauthenticatedClient } from "@/lib/api-client";
import { buildCanonical, PORTAL_BASE_URL } from "@/lib/seo";
import RecruiterProfileClient from "./recruiter-profile-client";
import type { RecruiterWithUser } from "../types";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;

    try {
        const client = createUnauthenticatedClient();
        const response = await client.get<{ data: RecruiterWithUser }>(
            `/public/recruiters/${slug}`,
            {
                params: {
                    include: "user,reputation,firm,activity,response_metrics",
                },
            },
        );
        const recruiter = response.data;
        const name = recruiter.users?.name || recruiter.name || "Recruiter";
        const tagline = recruiter.tagline || "Expert Recruiter";
        const title = `${name} - ${tagline}`;
        const description =
            recruiter.bio?.substring(0, 160) ||
            `View ${name}'s recruiter profile on Splits Network.`;

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                url: `${PORTAL_BASE_URL}/recruiters/${slug}`,
            },
            ...buildCanonical(`/recruiters/${slug}`),
        };
    } catch {
        return { title: "Recruiter Not Found" };
    }
}

export default async function RecruiterProfilePage({ params }: Props) {
    const { slug } = await params;
    let recruiter: RecruiterWithUser;

    try {
        const client = createUnauthenticatedClient();
        const response = await client.get<{ data: RecruiterWithUser }>(
            `/public/recruiters/${slug}`,
            {
                params: {
                    include: "user,reputation,firm,activity,response_metrics",
                },
            },
        );
        recruiter = response.data;
    } catch {
        notFound();
    }

    const name = recruiter.users?.name || recruiter.name || "Recruiter";
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Person",
        name,
        jobTitle: recruiter.tagline || "Recruiter",
        url: `${PORTAL_BASE_URL}/recruiters/${slug}`,
        ...(recruiter.location
            ? {
                  address: {
                      "@type": "PostalAddress",
                      addressLocality: recruiter.location,
                  },
              }
            : {}),
        ...(recruiter.bio
            ? { description: recruiter.bio.substring(0, 160) }
            : {}),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <RecruiterProfileClient recruiter={recruiter} />
        </>
    );
}
