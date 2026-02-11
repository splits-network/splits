import type { Metadata } from "next";
import { TransparencyContent } from "./transparency-content";
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Transparency",
    description: "Complete transparency on how placement fees are split between recruiters on Splits Network. Clear pricing and processes for collaborative recruiting.",
    openGraph: {
        title: "Transparency",
        description: "Complete transparency on how placement fees are split between recruiters on Splits Network. Clear pricing and processes for collaborative recruiting.",
        url: "https://splits.network/public/transparency",
    },
    ...buildCanonical("/public/transparency"),
};

export default function TransparencyPage() {
    return <TransparencyContent />;
}
