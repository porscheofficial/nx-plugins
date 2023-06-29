import {
    addDependenciesToPackageJson,
    generateFiles,
    installPackagesTask,
    readProjectConfiguration,
    Tree,
    updateProjectConfiguration,
    readJson,
} from "@nx/devkit"
import { join } from "path"
import { normalizeOptions, NPM_SCOPE } from "../../lib/utils"
import { NxPhraseGeneratorSchema } from "./schema"

export default async function (tree: Tree, options: NxPhraseGeneratorSchema) {
    const { projectName } = options

    const { peerDependencies } = readJson(tree, `node_modules/${NPM_SCOPE}/nx-phrase/package.json`)
    const installDependencies = addDependenciesToPackageJson(tree, {}, peerDependencies)
    if (installDependencies) {
        await installDependencies()
    }

    // addDependenciesToPackageJson("")
    const projectConfiguration = readProjectConfiguration(tree, projectName)
    projectConfiguration.targets = {
        ...projectConfiguration.targets,
        translation: {
            executor: "@porscheofficial/nx-phrase:build",
            options: {
                projectId: "<put phrase project id here>",
            },
            configurations: {
                pull: {
                    operation: "pull",
                },
                push: {
                    operation: "push",
                },
                unused: {
                    operation: "find-unused",
                },
            },
        },
    }
    updateProjectConfiguration(tree, projectName, projectConfiguration)

    if (tree.isFile(".gitignore")) {
        const gitignore = tree.read(".gitignore")
        if (!gitignore.toString().match(/\.phrase.yml/)) {
            const updatedGitignore = Buffer.concat([
                gitignore,
                Buffer.from("\n# Phrase configuration file \n.phrase.yml"),
            ])
            tree.write(".gitignore", updatedGitignore)
        }
    }

    const normalizedOptions = normalizeOptions(tree, options)
    generateFiles(tree, join(__dirname, "files"), "./", {
        ...normalizedOptions,
    })

    return async () => {
        installPackagesTask(tree)

        console.log(`Generator ran for ${projectName}`, options)
    }
}
