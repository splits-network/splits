import { generatePlugins } from "./functions/generatePlugins.js"
import { generateImports } from "./functions/generateImports.js"
import { generateThemesObject } from "./functions/generateThemesObject.js"
import { promises as fs } from "fs"

async function generateFiles() {
    console.log("▦ Building Memphis UI...")

    try {
        // Create dist directory
        await fs.mkdir("dist", { recursive: true })
        await fs.mkdir("dist/theme", { recursive: true })

        // Generate plugins from source files
        await Promise.all([
            generatePlugins({ type: "base", srcDir: "src/base", distDir: "dist/base" }),
            generatePlugins({ type: "component", srcDir: "src/components", distDir: "dist/components" }),
            generatePlugins({ type: "utility", srcDir: "src/utilities", distDir: "dist/utilities" }),
        ])

        console.log("✓ Generated component plugins")

        // Generate imports
        await generateImports("dist/imports.js")

        console.log("✓ Generated imports.js")

        // Generate themes object
        await generateThemesObject("dist/theme/object.js")

        console.log("✓ Generated theme objects")
        console.log("▦ Memphis UI build complete!")
    } catch (error) {
        console.error("Build error:", error.message)
        process.exit(1)
    }
}
generateFiles()
