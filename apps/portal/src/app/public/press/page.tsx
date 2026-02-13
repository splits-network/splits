import type { Metadata } from "next";
import { PressContent } from "./press-content";
import { buildCanonical } from "@/lib/seo";
import { getAllArticles } from "@/lib/press";

export const metadata: Metadata = {
    title: "Press & Updates",
    description: "The latest features, improvements, and platform news from Splits Network. See what we've shipped and where we're headed.",
    openGraph: {
        title: "Press & Updates | Splits Network",
        description: "The latest features, improvements, and platform news from Splits Network. See what we've shipped and where we're headed.",
        url: "https://splits.network/public/press",
    },
    ...buildCanonical("/public/press"),
};

export default function PressKitPage() {
    const articles = getAllArticles();
    console.log(`[press] getAllArticles returned ${articles.length} articles, cwd=${process.cwd()}`);
    return <PressContent articles={articles} />;
}
