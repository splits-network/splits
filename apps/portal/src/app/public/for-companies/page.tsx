import type { Metadata } from "next";
import { ForCompaniesContent } from "./for-companies-content";
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: "For Companies - Splits Network | Streamline Your Hiring",
    description:
        "Transform your hiring process with Splits Network's collaborative recruiting platform. Access top talent faster, reduce costs by up to 50%, and hire with confidence through our verified recruiter network.",
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
    ...buildCanonical("/public/for-companies"),
};

export default function ForCompaniesPage() {
    return <ForCompaniesContent />;
}
