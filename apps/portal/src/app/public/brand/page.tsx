import type { Metadata } from "next";
import { BrandContent } from "./brand-content";
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Brand Kit",
    description: "Brand assets, logos, color palette, and company information for journalists and partners covering Splits Network.",
    openGraph: {
        title: "Brand Kit | Splits Network",
        description: "Brand assets, logos, color palette, and company information for journalists and partners covering Splits Network.",
        url: "https://splits.network/public/brand",
    },
    ...buildCanonical("/public/brand"),
};

export default function BrandPage() {
    return <BrandContent />;
}
