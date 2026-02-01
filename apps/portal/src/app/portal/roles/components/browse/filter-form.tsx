"use client";

import {
    BrowseFilterDropdown,
    createFilterField,
} from "@splits-network/shared-ui";
import { JobFilters } from "./types";

const FilterField = createFilterField<JobFilters>();

interface FilterFormProps {
    filters: JobFilters;
    onChange: (filters: JobFilters) => void;
}

export default function RoleFilterForm({ filters, onChange }: FilterFormProps) {
    return (
        <BrowseFilterDropdown
            filters={filters}
            onChange={onChange}
            preserveFilters={["job_owner_filter"]} // Keep tab filter when resetting
        >
            <FilterField.Toggle
                label="Remote Only"
                checked={!!filters.is_remote}
                onChange={(checked) =>
                    onChange({
                        ...filters,
                        is_remote: checked ? true : undefined,
                    })
                }
            />

            <FilterField.Select
                label="Employment Type"
                value={filters.employment_type}
                options={[
                    { label: "Full-time", value: "fulltime" },
                    { label: "Contract", value: "contract" },
                    { label: "Part-time", value: "parttime" },
                    { label: "Freelance", value: "freelance" },
                ]}
                onChange={(value) =>
                    onChange({ ...filters, employment_type: value })
                }
                placeholder="All Types"
            />

            <FilterField.Select
                label="Status"
                value={filters.status}
                options={[
                    { label: "Active", value: "active" },
                    { label: "Paused", value: "paused" },
                    { label: "Closed", value: "closed" },
                ]}
                onChange={(value) => onChange({ ...filters, status: value })}
                placeholder="All Statuses"
            />
        </BrowseFilterDropdown>
    );
}
