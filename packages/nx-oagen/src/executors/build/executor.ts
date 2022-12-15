import { BuildExecutorSchema } from "./schema"
import { generate } from "./lib/generate"
import { ExecutorContext, formatFiles, generateFiles, names, offsetFromRoot, visitNotIgnoredFiles } from "@nrwl/devkit"
import { FsTree, Tree, flushChanges, printChanges } from "@nrwl/tao/src/shared/tree"
import { NormalizedSchema, normalizeOptions, NPM_SCOPE } from "../../utils"
import { join, relative } from "path"
import { mkdtempSync, rmSync } from "fs-extra"

function addFiles(tree: Tree, options: NormalizedSchema, targetDir: string) {
    const templateOptions = {
        ...options,
        ...names(options.projectName),
        offsetFromRoot: offsetFromRoot(options.projectRoot),
        template: "",
    }

    generateFiles(tree, join(__dirname, "files"), targetDir, templateOptions)
}

export default async function runExecutor(options: BuildExecutorSchema, context: ExecutorContext) {
    const tree = new FsTree(context.root, true)

    const normalizedOptions = normalizeOptions(tree, {
        projectName: context.projectName,
        specFile: options.specFile,
        generator: options.generator,
    })

    const tmpDir = mkdtempSync(`${context.root}/${NPM_SCOPE}`)
    try {
        await generate({
            specFile: options.specFile,
            outputDir: tmpDir,
            generator: options.generator,
            additionalProperties: options.additionalProperties,
        })

        if (tree.exists(`${context.workspace.projects[context.projectName].sourceRoot}/${options.outDir}`)) {
            tree.delete(`${context.workspace.projects[context.projectName].sourceRoot}/${options.outDir}`)
            printChanges(tree.listChanges())
            flushChanges(tree.root, tree.listChanges())
        }

        const relativeTmpRoot = relative(context.root, tmpDir)
        const relativeSrcRoot = relative(context.root, context.workspace.projects[context.projectName].sourceRoot)
        visitNotIgnoredFiles(tree, relativeTmpRoot, (filePath) => {
            const relativePath = relative(relativeTmpRoot, filePath)

            // move generated files from tmp directory into nx context
            tree.rename(filePath, `${relativeSrcRoot}/${options.outDir}/${relativePath}`)
        })

        addFiles(tree, normalizedOptions, relative(context.root, context.workspace.projects[context.projectName].root))

        printChanges(tree.listChanges())
    } finally {
        await formatFiles(tree)
        flushChanges(tree.root, tree.listChanges())
        rmSync(tmpDir, { recursive: true, force: true })
    }

    console.log("Executor ran for Build", options)
    return {
        success: true,
    }
}
