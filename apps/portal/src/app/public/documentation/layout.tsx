import type { Metadata } from "next";
import { DocsSidebar } from "./components/docs-sidebar";
import { DocsMobileNav } from "./components/docs-mobile-nav";

export const metadata: Metadata = {
    title: "Splits Network Documentation",
    description:
        "Guides and troubleshooting for recruiters, hiring managers, and company admins.",
};

export default function DocumentationLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-base-100">
            <div className="container mx-auto px-4 py-8">
                <div className="space-y-6">
                    <DocsMobileNav />
                    <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-8">
                        <aside className="hidden lg:block">
                            <DocsSidebar />
                        </aside>
                        <main className="min-w-0">{children}</main>
                    </div>
                </div>
            </div>
        </div>
    );
}
