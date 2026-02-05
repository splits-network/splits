"use client";

import { PageTitle } from "@/components/page-title";
import { BrowseMarketplaceClient } from "./components/browse-marketplace-client";

export default function RecruiterMarketplacePage() {
    return (
        <>
            <PageTitle
                title="Find Recruiters"
                subtitle="Discover and invite recruiters to represent your company"
            />
            <BrowseMarketplaceClient />
        </>
    );
}
