import { promises as fs } from "fs"
import path from "path"

export const createPluginFiles = async (type, componentDir, cssContent, fileName) => {
    const types = {
        base: "addBase",
        component: "addComponents",
        utility: "addUtilities",
    }

    // Create index.js that processes the CSS file
    const indexJsPath = path.join(componentDir, "index.js")
    const indexJsContent = `import { readFileSync } from "fs"
import { fileURLToPath } from "url"
import path from "path"
import postcss from "postcss"
import postcssJs from "postcss-js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const cssFile = path.join(__dirname, "${fileName}.css")

export default ({ ${types[type]}, prefix = "" }) => {
  try {
    const cssContent = readFileSync(cssFile, "utf-8")
    const result = postcss.parse(cssContent)
    const jsObject = postcssJs.objectify(result)
    
    ${types[type]}(jsObject)
  } catch (error) {
    console.error("Error loading ${fileName} component:", error)
  }
}
`
    await fs.writeFile(indexJsPath, indexJsContent)

    // Also create the CSS file in the component directory
    const cssPath = path.join(componentDir, `${fileName}.css`)
    await fs.writeFile(cssPath, cssContent)
}
