import { redirect, notFound } from "next/navigation";
import { getContentPage } from "@/lib/content";

export const revalidate = 300;

interface PageProps {
    params: Promise<{ slug: string[] }>;
}

export default async function CmsLegacyPage({ params }: PageProps) {
    const { slug } = await params;
    const slugPath = slug.join("/");
    const page = await getContentPage(slugPath);

    if (!page) notFound();

    // 301 redirect to structured URL
    redirect(`/cms/${page.page_type}/${page.slug}`);
}
