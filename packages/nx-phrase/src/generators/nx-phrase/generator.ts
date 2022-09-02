import {
    addDependenciesToPackageJson,
    generateFiles,
    installPackagesTask,
    readProjectConfiguration,
    Tree,
    updateProjectConfiguration,
    readJson,
} from "@nrwl/devkit"
import { join } from "path"
import { normalizeOptions, NPM_SCOPE } from "../../utils"
import { NxPhraseGeneratorSchema } from "./schema"

export default async function (tree: Tree, options: NxPhraseGeneratorSchema) {
    const { projectName } = options

    const { peerDependencies } = readJson(tree, `node_modules/${NPM_SCOPE}/nx-phrase/package.json`)
    const installDependencies = addDependenciesToPackageJson(tree, undefined, peerDependencies)
    if (installDependencies) {
        await installDependencies()
    }

    // addDependenciesToPackageJson("")
    const projectConfiguration = readProjectConfiguration(tree, projectName)
    projectConfiguration.targets = {
        ...projectConfiguration.targets,
        translation: {
            executor: "@porscheofficial/nx-phrase:build",
            options: {},
            configurations: {
                pull: {
                    operation: "pull",
                },
                push: {
                    operation: "push",
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
