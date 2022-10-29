import { Tree, names, getWorkspaceLayout, offsetFromRoot } from "@nrwl/devkit"
import { existsSync, mkdirSync, writeFileSync } from "fs"
import { resolve } from "path"

export const NPM_SCOPE = "@porscheofficial"

export interface NormalizedSchema {
    projectName: string
    projectRoot: string
    projectDirectory: string
    parsedTags: string[]
    defaultPrefix: string
    offsetFromRoot: string
}

export function normalizeOptions(tree: Tree, options): NormalizedSchema {
    const { npmScope, libsDir } = getWorkspaceLayout(tree)

    const name = names(options.projectName).fileName
    const projectDirectory = options.directory ? `${names(options.directory).fileName}/${name}` : name
    const projectName = projectDirectory.replace(new RegExp("/", "g"), "-")
    const projectRoot = `${libsDir}/${projectDirectory}`
    const parsedTags = options.tags ? options.tags.split(",").map((s) => s.trim()) : []

    const defaultPrefix = npmScope

    return {
        ...options,
        projectName,
        projectRoot,
        projectDirectory,
        parsedTags,
        defaultPrefix,
        offsetFromRoot: offsetFromRoot(projectRoot),
    }
}

export function prepareOutput(projectRoot: string, subfolder: string = null) {
    const baseOutputPath = resolve(projectRoot, ".nx-phrase")
    if (!existsSync(baseOutputPath)) {
        mkdirSync(baseOutputPath)
    }

    const ignoreFile = resolve(baseOutputPath, ".gitignore")
    if (!existsSync(ignoreFile)) {
        writeFileSync(ignoreFile, "**/*.*", { flag: "wx" })
    }

    if (subfolder) {
        const outputPath = resolve(baseOutputPath, subfolder)
        if (!existsSync(outputPath)) {
            mkdirSync(outputPath, { recursive: true })
        }

        return outputPath
    }

    return baseOutputPath
}
