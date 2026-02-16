import { promises as fs } from "fs"
import path from "path"

export const createDirectoryBasedOnFileNames = async (fileName, fileExtension, distDir) => {
    const componentName = path.basename(fileName, fileExtension)
    const componentDir = path.join(distDir, componentName)
    await fs.mkdir(componentDir, { recursive: true })
    return componentDir
}
