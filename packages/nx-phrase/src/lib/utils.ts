import { Tree, names, getWorkspaceLayout, offsetFromRoot } from "@nx/devkit"
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

export function prepareOutput({
    projectRoot,
    subfolder = null,
    workingDirectory = ".nx-phrase",
}: {
    projectRoot: string
    subfolder?: string
    workingDirectory?: string
}) {
    const baseOutputPath = resolve(projectRoot, workingDirectory)
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

export interface LanguageAndRegion {
    language: string
    region?: string
}

export function getLanguageAndRegion(locale: string): LanguageAndRegion {
    if (!locale) {
        throw new Error("Incorrect locale information provided")
    }
    const normalizedLocale = locale.replace(/_|–/g, "-")
    if (normalizedLocale.indexOf("-") === -1) {
        return {
            language: normalizedLocale.toLocaleLowerCase(),
        }
    }
    const [language, region, ...unsupportedLocaleParts] = normalizedLocale.split("-")
    if (unsupportedLocaleParts.length > 0) {
        throw new Error("Incorrect locale information provided")
    }
    return { language: language.toLocaleLowerCase(), region: region.toLocaleUpperCase() }
}
