import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { getAllArticles } from "@/lib/press";
import { PressListing } from "./press-listing";

export const metadata: Metadata = {
    title: "Press & Updates",
    description:
        "The latest features, improvements, and platform news from Splits Network. See what we've shipped and where we're headed.",
    openGraph: {
        title: "Press & Updates | Splits Network",
        description:
            "The latest features, improvements, and platform news from Splits Network. See what we've shipped and where we're headed.",
        url: "https://splits.network/press",
    },
    ...buildCanonical("/press"),
};

export default function PressBaselPage() {
    const articles = getAllArticles();
    return <PressListing articles={articles} />;
}
