import type { Metadata } from "next";
import { ForCompaniesContent } from "./for-companies-content";

export const metadata: Metadata = {
    title: "For Companies - Splits Network | Streamline Your Hiring",
    description:
        "Transform your hiring process with Splits Network's collaborative recruiting platform. Access top talent faster, reduce costs by up to 50%, and hire with confidence through our verified recruiter network.",
    keywords: [
        "hiring platform",
        "recruiting solutions",
        "talent acquisition",
        "collaborative hiring",
        "recruiter network",
        "hiring process",
        "talent sourcing",
        "employment platform",
        "candidate marketplace",
        "hiring technology",
    ],
    openGraph: {
        title: "For Companies - Splits Network | Streamline Your Hiring",
        description:
            "Transform your hiring process with Splits Network's collaborative recruiting platform. Access top talent faster, reduce costs by up to 50%, and hire with confidence.",
        type: "website",
        url: "https://splits.network/public/for-companies",
    },
    twitter: {
        card: "summary_large_image",
        title: "For Companies - Splits Network | Streamline Your Hiring",
        description:
            "Transform your hiring process with Splits Network's collaborative recruiting platform. Access top talent faster, reduce costs by up to 50%, and hire with confidence.",
    },
};

export default function ForCompaniesPage() {
    return <ForCompaniesContent />;
}
