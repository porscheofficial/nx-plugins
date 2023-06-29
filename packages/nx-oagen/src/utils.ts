import { Tree, names, getWorkspaceLayout, offsetFromRoot } from "@nx/devkit"
import { NxOagenGeneratorSchema } from "./generators/library/schema"
import { Generator } from "./types"

export const NPM_SCOPE = "@porscheofficial"

export interface NormalizedSchema extends NxOagenGeneratorSchema {
    projectName: string
    projectRoot: string
    projectDirectory: string
    parsedTags: string[]
    generator: Generator
    defaultPrefix: string
    offsetFromRoot: string
}

export function normalizeOptions(tree: Tree, options: NxOagenGeneratorSchema): NormalizedSchema {
    const { npmScope, libsDir } = getWorkspaceLayout(tree)

    const name = names(options.projectName).fileName
    const projectDirectory = options.directory ? `${names(options.directory).fileName}/${name}` : name
    const projectName = projectDirectory.replace(new RegExp("/", "g"), "-")
    const projectRoot = `${libsDir}/${projectDirectory}`
    const parsedTags = options.tags ? options.tags.split(",").map((s) => s.trim()) : []
    const generator = options.generator

    const defaultPrefix = npmScope

    return {
        ...options,
        projectName,
        projectRoot,
        projectDirectory,
        parsedTags,
        generator,
        defaultPrefix,
        offsetFromRoot: offsetFromRoot(projectRoot),
    }
}
