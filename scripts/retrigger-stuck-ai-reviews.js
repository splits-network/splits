/**
 * Script to retrigger stuck AI reviews via browser console
 * Run this in the portal admin page (/portal/admin/applications)
 */

async function retriggerAllStuckAIReviews() {
    const authToken = localStorage.getItem("__clerk_db_jwt");
    if (!authToken) {
        throw new Error("No auth token found. Make sure you are logged in.");
    }

    // Get all applications in stuck AI review stages
    const response = await fetch(
        "/api/v3/applications?stage=ai_review,gpt_review&limit=100",
        {
            headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
            },
        },
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch applications: ${response.statusText}`);
    }

    const data = await response.json();
    const stuckApplications = data.data || [];

    console.log(
        `Found ${stuckApplications.length} applications in AI review stages`,
    );

    if (stuckApplications.length === 0) {
        console.log("No stuck applications found!");
        return;
    }

    // Retrigger each one
    const results = [];
    for (const app of stuckApplications) {
        try {
            console.log(`Retriggering AI review for application ${app.id}...`);

            const retriggerResponse = await fetch(
                `/api/v3/applications/${app.id}/trigger-ai-review`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Content-Type": "application/json",
                    },
                },
            );

            if (retriggerResponse.ok) {
                results.push({ id: app.id, status: "success" });
                console.log(`✅ Successfully retriggered ${app.id}`);
            } else {
                results.push({
                    id: app.id,
                    status: "failed",
                    error: retriggerResponse.statusText,
                });
                console.log(
                    `❌ Failed to retrigger ${app.id}: ${retriggerResponse.statusText}`,
                );
            }

            // Add small delay to avoid overwhelming the API
            await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error) {
            results.push({
                id: app.id,
                status: "failed",
                error: error.message,
            });
            console.log(`❌ Error retriggering ${app.id}: ${error.message}`);
        }
    }

    // Summary
    const successful = results.filter((r) => r.status === "success").length;
    const failed = results.filter((r) => r.status === "failed").length;

    console.log("\n📊 SUMMARY:");
    console.log(`✅ Successfully retriggered: ${successful}`);
    console.log(`❌ Failed to retrigger: ${failed}`);

    if (failed > 0) {
        console.log("\n❌ Failed applications:");
        results
            .filter((r) => r.status === "failed")
            .forEach((r) => {
                console.log(`  ${r.id}: ${r.error}`);
            });
    }

    return results;
}

// Usage:
// 1. Open portal admin applications page
// 2. Open browser dev tools console
// 3. Paste this entire script
// 4. Run: retriggerAllStuckAIReviews()

console.log("Script loaded. Run retriggerAllStuckAIReviews() to begin.");
