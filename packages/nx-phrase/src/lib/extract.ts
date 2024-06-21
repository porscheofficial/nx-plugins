import { relative, resolve } from "path"

import { ExecutorContext } from "@nx/devkit"

import { compile, extract as extractFromSource } from "./formatjs"
import { prepareOutput } from "./utils"
import debug from "debug"
import { NonSensitiveArgs } from "./types"
import { copyFile, mkdirs, remove } from "fs-extra"
import { DEFAULT_PHRASE_LANGUAGE_NAME } from "./consts"

const logger = debug("nx-plugins.nx-phrase.lib.push")

export async function extractTranslations(config: NonSensitiveArgs, outputPath: string) {
    // Extract translations from sources
    logger(`Extracting translations from files in '${config.sourceRoot}'`)
    logger(`using source glob '${config.sourceGlob}'`)
    if (config.ignoreGlob) {
        logger(`Ignoring '${config.ignoreGlob}'`)
    }

    const extractionOutputFile = `${outputPath}/translations.extracted.json`

    await extractFromSource({
        sourceRoot: config.sourceRoot,
        outputFile: extractionOutputFile,
        sourceGlob: config.sourceGlob,
        ignoreGlob: config.ignoreGlob,
    })
    logger(`Extracted translations into ${relative(process.cwd(), extractionOutputFile)}`)

    // Compile extracted translation into target format
    const compilationOutputFile = resolve(outputPath, "translations.compiled.json")
    await compile({ inputFile: extractionOutputFile, outputFile: compilationOutputFile })
    logger(`Compiled translations into ${relative(process.cwd(), compilationOutputFile)}`)

    return compilationOutputFile
}

export async function extract(config: NonSensitiveArgs, context: ExecutorContext) {
    const { projectName } = context

    if (!projectName) {
        throw new Error("project name not set in context")
    }

    const outputPath = prepareOutput({
        projectRoot: context.workspace.projects[context?.projectName]?.root ?? context.root,
        subfolder: "extract",
        workingDirectory: config.workingDirectory,
    })

    await remove(config.output)
    await mkdirs(config.output)

    const compilationOutputFile = await extractTranslations(config, outputPath)
    const fileName = `${DEFAULT_PHRASE_LANGUAGE_NAME}.json`
    const filePath = resolve(config.output, fileName)
    await copyFile(compilationOutputFile, filePath)
}
