import { useStandardList } from "@/hooks/use-standard-list";
import { createBrowseComponents } from "@splits-network/shared-ui";
import { Job, JobFilters } from "./types";

// Create domain-specific browse components using existing useStandardList hook
const { BrowseClient: RolesBrowseClient } = createBrowseComponents<
    Job,
    JobFilters
>(useStandardList);

export { RolesBrowseClient };
