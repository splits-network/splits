import themeOrder from "./themeOrder.js"

export const pluginOptionsHandler = (() => {
    let firstRun = true
    return (options, addBase, themesObject, packageVersion) => {
        const {
            logs = true,
            root = ":root",
            themes = ["memphis --default"],
            include,
            exclude,
            prefix = "",
        } = options || {}

        if (logs !== false && firstRun) {
            console.log(`/* ▦ Memphis UI ${packageVersion} */`)
            firstRun = false
        }

        const applyTheme = (themeName, flags) => {
            const theme = themesObject[themeName]
            if (theme) {
                // Convert theme object keys to CSS variables with -- prefix
                const themeWithVars = {}
                Object.entries(theme).forEach(([key, value]) => {
                    const varName = key.startsWith('--') ? key : `--${key}`
                    themeWithVars[varName] = value
                })

                const themeControllerClass = `${prefix}theme-controller`
                let selector = `${root}:has(input.${themeControllerClass}[value=${themeName}]:checked),[data-theme=${themeName}]`
                if (flags.includes("--default")) {
                    selector = `:where(${root}),${selector}`
                }
                addBase({ [selector]: themeWithVars })

                if (flags.includes("--prefersdark")) {
                    const darkSelector =
                        root === ":root" ? ":root:not([data-theme])" : `${root}:not([data-theme])`
                    addBase({ "@media (prefers-color-scheme: dark)": { [darkSelector]: themeWithVars } })
                }
            }
        }

        if (themes === "all") {
            if (themesObject["memphis"]) {
                applyTheme("memphis", ["--default"])
            }

            themeOrder.forEach((themeName) => {
                if (themesObject[themeName]) {
                    applyTheme(themeName, [])
                }
            })
        } else if (themes) {
            const themeArray = Array.isArray(themes) ? themes : [themes]

            if (themeArray.length === 1 && themeArray[0].includes("--default")) {
                const [themeName, ...flags] = themeArray[0].split(" ")
                applyTheme(themeName, flags)
                return { include, exclude, prefix }
            }

            // default theme
            themeArray.forEach((themeOption) => {
                const [themeName, ...flags] = themeOption.split(" ")
                if (flags.includes("--default")) {
                    applyTheme(themeName, ["--default"])
                }
            })

            // prefers dark theme
            themeArray.forEach((themeOption) => {
                const [themeName, ...flags] = themeOption.split(" ")
                if (flags.includes("--prefersdark") && themesObject[themeName]) {
                    const themeWithVars = {}
                    Object.entries(themesObject[themeName]).forEach(([key, value]) => {
                        const varName = key.startsWith('--') ? key : `--${key}`
                        themeWithVars[varName] = value
                    })

                    const darkSelector =
                        root === ":root" ? ":root:not([data-theme])" : `${root}:not([data-theme])`
                    addBase({
                        "@media (prefers-color-scheme: dark)": { [darkSelector]: themeWithVars },
                    })
                }
            })

            // other themes
            themeArray.forEach((themeOption) => {
                const [themeName] = themeOption.split(" ")
                applyTheme(themeName, [])
            })
        }

        return { include, exclude, prefix }
    }
})()
