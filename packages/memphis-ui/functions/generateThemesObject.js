import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Convert hex to OKLCH
function hexToOklch(hex) {
    // Remove # if present
    hex = hex.replace('#', '')

    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16) / 255
    const g = parseInt(hex.substring(2, 4), 16) / 255
    const b = parseInt(hex.substring(4, 6), 16) / 255

    // Convert to linear RGB
    const toLinear = (c) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    const rLin = toLinear(r)
    const gLin = toLinear(g)
    const bLin = toLinear(b)

    // Convert to OKLab
    const l = 0.4122214708 * rLin + 0.5363325363 * gLin + 0.0514459929 * bLin
    const m = 0.2119034982 * rLin + 0.6806995451 * gLin + 0.1073969566 * bLin
    const s = 0.0883024619 * rLin + 0.2817188376 * gLin + 0.6299787005 * bLin

    const l_ = Math.cbrt(l)
    const m_ = Math.cbrt(m)
    const s_ = Math.cbrt(s)

    const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_
    const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_
    const bComp = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_

    // Convert to LCH
    const C = Math.sqrt(a * a + bComp * bComp)
    let h = Math.atan2(bComp, a) * 180 / Math.PI
    if (h < 0) h += 360

    // Format as OKLCH
    const lightness = (L * 100).toFixed(1)
    const chroma = C.toFixed(3)
    const hue = h.toFixed(1)

    return `oklch(${lightness}% ${chroma} ${hue})`
}

// Check if value is a hex color
function isHexColor(value) {
    return /^#[0-9A-Fa-f]{6}$/.test(value.trim())
}

// Convert color values in theme object
function convertColorsToOklch(variables) {
    const converted = {}
    for (const [key, value] of Object.entries(variables)) {
        if (isHexColor(value)) {
            converted[key] = hexToOklch(value)
        } else {
            converted[key] = value
        }
    }
    return converted
}

export const generateThemesObject = async (outputPath) => {
    const themesDir = path.join(__dirname, "../src/themes")
    const themeObjects = {}

    try {
        const themeFiles = await fs.readdir(themesDir)
        const cssFiles = themeFiles.filter(file => file.endsWith('.css'))

        // Parse each CSS theme file and convert to a theme object
        for (const cssFile of cssFiles) {
            const themeName = path.basename(cssFile, '.css')
            const cssPath = path.join(themesDir, cssFile)
            const cssContent = await fs.readFile(cssPath, 'utf-8')

            // Extract CSS variables from the file
            const variables = {}
            const lines = cssContent.split('\n')

            for (const line of lines) {
                const match = line.match(/--([^:]+):\s*([^;]+);/)
                if (match) {
                    const varName = match[1].trim()
                    const varValue = match[2].trim()
                    variables[varName] = varValue
                }
            }

            // Convert hex colors to OKLCH
            themeObjects[themeName] = convertColorsToOklch(variables)
        }

        // Convert themeObjects to a string in the desired format
        const themeObjectsString = `export default ${JSON.stringify(themeObjects, null, null)}`

        // Write the string to the specified output file
        await fs.writeFile(outputPath, themeObjectsString, 'utf8')

        console.log(`✓ Generated theme objects for: ${Object.keys(themeObjects).join(', ')}`)
    } catch (error) {
        throw new Error(`Error generating themes object: ${error.message}`)
    }
}