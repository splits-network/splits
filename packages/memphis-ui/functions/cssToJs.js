import { promises as fs } from "fs";

// Simple CSS parser for MemphisUI - reads CSS content from file
export const cssToJs = async (cssFile) => {
    try {
        const cssContent = await fs.readFile(cssFile, "utf-8");
        return {
            content: cssContent,
        };
    } catch (error) {
        throw new Error(`Error reading CSS file: ${error.message}`);
    }
};
