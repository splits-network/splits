import type { Metadata } from "next";
import { AboutContent } from "./about-content";

export const metadata: Metadata = {
    title: "About Us - Applicant Network | Connecting Talent with Opportunity",
    description: "Learn about Applicant Network's mission to connect talented candidates with amazing career opportunities through expert recruiters. Discover our story, values, and commitment to your success.",
    keywords: "about applicant network, recruiting platform, career opportunities, job search, talent acquisition",
    openGraph: {
        title: "About Applicant Network",
        description: "Connecting talented candidates with amazing opportunities through expert recruiters.",
        type: "website",
    },
};

export default function AboutPage() {
    return <AboutContent />;
}
