import fs from "fs/promises"
import { getDirectoriesWithTargetFile } from "./getDirectoriesWithTargetFile.js"

const generateJSContent = async (distDir = "dist") => {
    let baseItems = []
    let componentItems = []
    let utilityItems = []
    let imports = ""
    let importNameMap = new Map() // Track used names to avoid duplicates

    try {
        // Function to process each category
        const processCategory = async (category) => {
            const items = await getDirectoriesWithTargetFile(`./${distDir}/${category}`, "index.js")
            items.forEach((item) => {
                // Create unique import name if there's a conflict
                let importName = item
                if (importNameMap.has(importName)) {
                    importName = `${category}_${item}`
                }
                importNameMap.set(item, importName)

                imports += `import ${importName} from './${category}/${item}/index.js';\n`

                // Add items to their respective arrays
                switch (category) {
                    case "base":
                        baseItems.push([item, importName])
                        break
                    case "components":
                        componentItems.push([item, importName])
                        break
                    case "utilities":
                        utilityItems.push([item, importName])
                        break
                }
            })
        }

        // Process all categories
        await processCategory("base")
        await processCategory("components")
        await processCategory("utilities")

        // Generate the content with separate exports
        const baseMap = baseItems.map(([key, name]) => `${key}:${name}`).join(",")
        const componentMap = componentItems.map(([key, name]) => `${key}:${name}`).join(",")
        const utilityMap = utilityItems.map(([key, name]) => `${key}:${name}`).join(",")

        const content = `${imports}
export const base = {${baseMap}};
export const components = {${componentMap}};
export const utilities = {${utilityMap}};
`

        return { content }
    } catch (error) {
        throw new Error(`Failed to generate JS content: ${error.message}`)
    }
}// Write the generated content to a file
const writeToFile = async (content, filename) => {
    try {
        await fs.writeFile(filename, content, "utf8")
    } catch (error) {
        throw new Error(`Failed to write file ${filename}: ${error.message}`)
    }
}

// Main function to generate JS
export const generateImports = async (filename) => {
    try {
        const { content: jsContent } = await generateJSContent()
        await writeToFile(jsContent, filename)
    } catch (error) {
        throw new Error(`Failed to generate ${filename}: ${error.message}`)
    }
}
