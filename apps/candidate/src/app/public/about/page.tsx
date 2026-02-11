import type { Metadata } from "next";
import { AboutContent } from "./about-content";
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: "About Us - Applicant Network | Connecting Talent with Opportunity",
    description: "Learn about Applicant Network's mission to connect talented candidates with amazing career opportunities through expert recruiters. Discover our story, values, and commitment to your success.",
    keywords: "about applicant network, recruiting platform, career opportunities, job search, talent acquisition",
    openGraph: {
        title: "About Us - Applicant Network | Connecting Talent with Opportunity",
        description: "Learn about Applicant Network's mission to connect talented candidates with amazing career opportunities through expert recruiters. Discover our story, values, and commitment to your success.",
        url: "https://applicant.network/public/about",
        type: "website",
    },
    ...buildCanonical("/public/about"),
};

export default function AboutPage() {
    return <AboutContent />;
}
