import { generatePlugins } from "./functions/generatePlugins.js";
import { generateImports } from "./functions/generateImports.js";
import { generateThemesObject } from "./functions/generateThemesObject.js";
import { promises as fs } from "fs";

async function generateFiles() {
    console.log("▦ Building Memphis UI...");

    try {
        // Create dist directory
        await fs.mkdir("dist", { recursive: true });
        await fs.mkdir("dist/theme", { recursive: true });

        // Copy main CSS file
        await fs.copyFile("src/index.css", "dist/index.css");

        console.log("✓ Copied main CSS file");

        // Generate plugins from source files
        await Promise.all([
            generatePlugins({
                type: "base",
                srcDir: "src/base",
                distDir: "dist/base",
            }),
            generatePlugins({
                type: "component",
                srcDir: "src/components",
                distDir: "dist/components",
            }),
            generatePlugins({
                type: "utility",
                srcDir: "src/utilities",
                distDir: "dist/utilities",
            }),
        ]);

        console.log("✓ Generated component plugins");

        // Copy CSS directories for @import resolution
        await fs.mkdir("dist/base", { recursive: true });
        await fs.mkdir("dist/components", { recursive: true });
        await fs.mkdir("dist/utilities", { recursive: true });
        await fs.mkdir("dist/themes", { recursive: true });

        // Copy base CSS files
        const baseFiles = await fs.readdir("src/base");
        for (const file of baseFiles) {
            if (file.endsWith(".css")) {
                await fs.copyFile(`src/base/${file}`, `dist/base/${file}`);
            }
        }

        // Copy theme CSS files
        const themeFiles = await fs.readdir("src/themes");
        for (const file of themeFiles) {
            if (file.endsWith(".css")) {
                await fs.copyFile(`src/themes/${file}`, `dist/themes/${file}`);
            }
        }

        // Copy component CSS files
        const componentFiles = await fs.readdir("src/components");
        for (const file of componentFiles) {
            if (file.endsWith(".css")) {
                await fs.copyFile(
                    `src/components/${file}`,
                    `dist/components/${file}`,
                );
            }
        }

        // Copy utility CSS files
        const utilityFiles = await fs.readdir("src/utilities");
        for (const file of utilityFiles) {
            if (file.endsWith(".css")) {
                await fs.copyFile(
                    `src/utilities/${file}`,
                    `dist/utilities/${file}`,
                );
            }
        }

        console.log("✓ Copied CSS files for @import resolution");

        // Generate imports
        await generateImports("dist/imports.js");

        console.log("✓ Generated imports.js");

        // Generate themes object
        await generateThemesObject("dist/theme/object.js");

        console.log("✓ Generated theme objects");
        console.log("▦ Memphis UI build complete!");
    } catch (error) {
        console.error("Build error:", error.message);
        process.exit(1);
    }
}
generateFiles();
