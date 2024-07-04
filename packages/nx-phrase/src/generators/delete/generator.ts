import { readProjectConfiguration, Tree } from "@nrwl/devkit"
import { NxPhraseGeneratorSchema } from "./schema"

export default async function (tree: Tree, options: NxPhraseGeneratorSchema) {
    const { config } = options

    const [projectName, target, configuration] = config.split(":")

    const projectConfiguration = readProjectConfiguration(tree, projectName)
    const targetConfiguration = projectConfiguration.targets[target]
    const targetOptions = targetConfiguration.options
    const configurationOptions = targetConfiguration.configurations[configuration]
    const projectOptions = { ...targetOptions, ...configurationOptions }

    console.log(projectOptions)

    console.log(`Generator ran for ${projectName}`, options)
}
