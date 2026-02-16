const version = "0.2.0"
import { pluginOptionsHandler } from "./functions/pluginOptionsHandler.js"
import { plugin } from "./functions/plugin.js"
import variables from "./functions/variables.js"
import themesObject from "./dist/theme/object.js"
import { base, components, utilities } from "./dist/imports.js"

export default plugin.withOptions(
    (options) => {
        return ({ addBase, addComponents, addUtilities, addVariant }) => {
            const {
                include,
                exclude,
                prefix = "",
            } = pluginOptionsHandler(options, addBase, themesObject, version)

            const shouldIncludeItem = (name) => {
                if (include && exclude) {
                    return include.includes(name) && !exclude.includes(name)
                }
                if (include) {
                    return include.includes(name)
                }
                if (exclude) {
                    return !exclude.includes(name)
                }
                return true
            }

            Object.entries(base).forEach(([name, item]) => {
                if (!shouldIncludeItem(name)) return
                item({ addBase, prefix })
            })

            // Use addBase for components and utilities to prevent Tailwind v4
            // tree-shaking. Our React components reference these CSS classes
            // internally (e.g. NavItem renders className="nav-item"), but
            // Tailwind only scans the consuming app's source files — not
            // the memphis-ui package. addBase ensures all CSS is always
            // included regardless of content detection.
            Object.entries(components).forEach(([name, item]) => {
                if (!shouldIncludeItem(name)) return
                item({ addComponents: addBase, prefix })
            })

            Object.entries(utilities).forEach(([name, item]) => {
                if (!shouldIncludeItem(name)) return
                item({ addUtilities: addBase, prefix })
            })
        }
    },
    () => ({
        theme: {
            extend: variables,
        },
    }),
)
