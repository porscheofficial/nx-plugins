import { Tree, updateProjectConfiguration, readProjectConfiguration, generateFiles } from "@nx/devkit"
import { libraryGenerator } from "@nx/node"
import { join } from "path"
import { normalizeOptions, NPM_SCOPE } from "../../utils"
import { defaults } from "./defaults"
import { NxOagenGeneratorSchema } from "./schema"

export default async function (tree: Tree, options: NxOagenGeneratorSchema) {
    const normalizedOptions = normalizeOptions(tree, options)

    await libraryGenerator(tree, {
        ...options,
        name: normalizedOptions.projectName,
        testEnvironment: "node",
        skipFormat: true,
        compiler: "swc",
    })

    const additionalProperties = { ...defaults[options.generator], ...options.additionalProperties }

    const projectConfiguration = readProjectConfiguration(tree, normalizedOptions.projectName)
    updateProjectConfiguration(tree, normalizedOptions.projectName, {
        ...projectConfiguration,
        targets: {
            build: {
                executor: `${NPM_SCOPE}/nx-oagen:build`,
                options: {
                    specFile: options.specFile,
                    additionalProperties,
                },
            },
            ...projectConfiguration.targets,
        },
    })

    generateFiles(tree, join(__dirname, "files"), normalizedOptions.projectRoot, {
        ...normalizedOptions,
        executor: `${NPM_SCOPE}/nx-oagen`,
    })
}
