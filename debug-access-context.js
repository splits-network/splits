// Debug script to check user access context
// Run with: node debug-access-context.js <clerk_user_id>

import { createClient } from "@supabase/supabase-js";
import { resolveAccessContext } from "./packages/shared-access-context/dist/index.js";

const SUPABASE_URL =
    process.env.SUPABASE_URL || "https://einhgkqmxbkgdohwfayv.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_KEY) {
    console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const clerkUserId = process.argv[2];
if (!clerkUserId) {
    console.error("Usage: node debug-access-context.js <clerk_user_id>");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log(`🔍 Debugging access context for Clerk User ID: ${clerkUserId}`);

async function debug() {
    try {
        const context = await resolveAccessContext(supabase, clerkUserId);

        console.log("\n📊 Access Context:");
        console.log(`  Identity User ID: ${context.identityUserId}`);
        console.log(`  Recruiter ID: ${context.recruiterId}`);
        console.log(`  Candidate ID: ${context.candidateId}`);
        console.log(`  Roles: [${context.roles.join(", ")}]`);
        console.log(
            `  Organization IDs: [${context.organizationIds.join(", ")}]`,
        );
        console.log(`  Company IDs: [${context.companyIds.join(", ")}]`);
        console.log(`  Firm IDs: [${context.firmIds.join(", ")}]`);
        console.log(`  Platform Admin: ${context.isPlatformAdmin}`);
        console.log(`  Error: ${context.error || "none"}`);

        // Check raw data
        const { data: user } = await supabase
            .from("users")
            .select(
                `
        id,
        clerk_user_id,
        email,
        memberships!memberships_user_id_fkey1(role_name, organization_id, company_id),
        user_roles!user_roles_user_id_fkey(role_name, role_entity_id)
      `,
            )
            .eq("clerk_user_id", clerkUserId)
            .single();

        console.log("\n📋 Raw Database Data:");
        console.log("User:", user);
    } catch (error) {
        console.error("Error:", error);
    }
}

debug();
