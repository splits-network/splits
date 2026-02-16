/**
 * Build-time CSS preprocessor for Memphis UI.
 *
 * Two transforms are applied:
 *
 * 1. **@apply expansion** — Uses Tailwind CSS v4's compile() to expand @apply
 *    directives into raw CSS properties. Necessary because postcss-js.objectify()
 *    silently drops @apply (a Tailwind-specific directive it doesn't understand).
 *
 * 2. **@layer unwrapping** — Strips @layer wrappers from inside selectors and
 *    removes top-level @layer blocks. Tailwind's addComponents() already places
 *    styles in the correct layer; the internal @layer wrappers cause:
 *    - Bare declarations inside @layer (invalid per CSS spec)
 *    - Top-level @layer blocks rejected by addComponents() as invalid selectors
 */

import { compile } from "tailwindcss"
import { readFileSync } from "fs"
import { createRequire } from "module"
import path from "path"
import postcss from "postcss"

// Resolve tailwindcss index.css location
const require = createRequire(import.meta.url)
const twPkgPath = path.dirname(require.resolve("tailwindcss/package.json"))
const twCssPath = path.join(twPkgPath, "index.css")
const twCssContent = readFileSync(twCssPath, "utf-8")
const twCssBase = path.dirname(twCssPath)

/**
 * Theme context providing DaisyUI/Memphis CSS variable names so Tailwind
 * can resolve utilities like bg-base-content, rounded-field, etc.
 *
 * The actual hex values don't matter for the output — compiled CSS references
 * var(--color-xxx), not the hex. Values just need to be valid so Tailwind
 * can resolve the utility class.
 */
const THEME_CONTEXT = `
@reference "tailwindcss";
@theme {
  /* DaisyUI semantic colors */
  --color-base-100: #ffffff;
  --color-base-200: #f5f0eb;
  --color-base-300: #e8e0d8;
  --color-base-content: #1a1a2e;
  --color-primary: #ff6b6b;
  --color-primary-content: #ffffff;
  --color-secondary: #4ecdc4;
  --color-secondary-content: #1a1a2e;
  --color-accent: #ffe66d;
  --color-accent-content: #1a1a2e;
  --color-neutral: #1a1a2e;
  --color-neutral-content: #ffffff;
  --color-info: #a78bfa;
  --color-info-content: #ffffff;
  --color-success: #4ecdc4;
  --color-success-content: #1a1a2e;
  --color-warning: #ffe66d;
  --color-warning-content: #1a1a2e;
  --color-error: #ff6b6b;
  --color-error-content: #ffffff;

  /* Memphis palette colors */
  --color-coral: #ff6b6b;
  --color-teal: #4ecdc4;
  --color-yellow: #ffe66d;
  --color-purple: #a78bfa;
  --color-dark: #1a1a2e;
  --color-cream: #f5f0eb;

  /* DaisyUI border-radius tokens */
  --radius-box: 0;
  --radius-field: 0;
  --radius-selector: 0;

  /* DaisyUI size token */
  --size-field: 0.25rem;
}
`

const loadStylesheet = async (id, base) => {
    if (id === "tailwindcss") {
        return { content: twCssContent, base: twCssBase }
    }
    const resolved = path.resolve(base, id)
    return { content: readFileSync(resolved, "utf-8"), base: path.dirname(resolved) }
}

/**
 * Clean CSS for compatibility with postcss-js.objectify() + addComponents().
 *
 * addComponents() expects a flat object of { ".selector": { ...props } }.
 * Any top-level at-rules become invalid keys and cause errors. This function:
 *
 * - Unwraps @layer blocks (moves children up; addComponents handles layers)
 * - Removes top-level @property declarations (host Tailwind provides them)
 * - Removes top-level @supports polyfills (host Tailwind provides them)
 *
 * Nested at-rules (@supports, @media inside selectors) are preserved — those
 * become valid nested CSS-in-JS and addComponents handles them correctly.
 */
function cleanCss(css) {
    const root = postcss.parse(css)

    // Pass 1: Unwrap all @layer blocks (move children to parent)
    // Must happen first since it may promote nodes to root level
    let found = true
    while (found) {
        found = false
        root.walk((node) => {
            if (node.type === "atrule" && node.name === "layer") {
                while (node.first) {
                    node.before(node.first)
                }
                node.remove()
                found = true // Re-walk since tree changed
                return false // Stop this walk
            }
        })
    }

    // Pass 2: Remove all root-level at-rules (@property, @supports polyfills, etc.)
    // Only style rules (.selector {}) should remain at root for addComponents()
    const toRemove = []
    for (const node of root.nodes) {
        if (node.type === "atrule") {
            toRemove.push(node)
        }
    }
    for (const node of toRemove) {
        node.remove()
    }

    return root.toString()
}

/**
 * Preprocess CSS for the Memphis UI plugin build.
 *
 * 1. Expands @apply directives to raw CSS properties
 * 2. Strips @layer wrappers (addComponents handles layer placement)
 *
 * @param {string} cssContent - Raw CSS source
 * @returns {Promise<string>} - Processed CSS ready for postcss-js.objectify()
 */
export async function expandApply(cssContent) {
    let output = cssContent

    // Step 1: Expand @apply using Tailwind's compiler
    if (cssContent.includes("@apply")) {
        const input = THEME_CONTEXT + "\n" + cssContent
        const result = await compile(input, { loadStylesheet })
        output = result.build([])
        // Strip the Tailwind header comment
        output = output.replace(/\/\*![\s\S]*?\*\/\n?/, "")
    }

    // Step 2: Clean up at-rules incompatible with addComponents()
    output = cleanCss(output)

    return output
}
