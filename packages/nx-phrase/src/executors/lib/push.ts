import { relative, resolve } from "path"

import { ExecutorContext } from "@nrwl/devkit"
import { readFile } from "fs-extra"

import { InternalPhraseConfig } from "./config"
import { compile, extract } from "./formatjs"
import { PhraseClient } from "./phrase"
import { prepareOutput } from "../../utils"

export async function extractTranslations(config: InternalPhraseConfig, outputPath: string) {
    // Extract translations from sources
    console.log(`Extracting translations from files in '${config.sourceRoot}'`)
    console.log(`using source glob '${config.sourceGlob}'`)
    if (config.ignoreGlob) {
        console.log(`Ignoring '${config.ignoreGlob}'`)
    }

    const extractionOutputFile = `${outputPath}/translations.extracted.json`

    await extract({
        sourceRoot: config.sourceRoot,
        outputFile: extractionOutputFile,
        sourceGlob: config.sourceGlob,
        ignoreGlob: config.ignoreGlob,
    })
    console.log(`Extracted translations into ${relative(process.cwd(), extractionOutputFile)}`)

    // Compile extracted translation into target format
    const compilationOutputFile = resolve(outputPath, "translations.compiled.json")
    await compile({ inputFile: extractionOutputFile, outputFile: compilationOutputFile })
    console.log(`Compiled translations into ${relative(process.cwd(), compilationOutputFile)}`)

    return compilationOutputFile
}

export async function uploadTranslations(config: InternalPhraseConfig, compilationOutputFile: string) {
    // Upload translations to phrase
    const phrase = new PhraseClient(config.phraseClientConfig)
    await phrase.upload(
        {
            project_id: config.projectId,
            locale_id: config.uploadLanguageId,
            file_format: "react_simple_json",
            update_translations: true,
            skip_upload_tags: true,
        },
        await readFile(compilationOutputFile)
    )
    console.log(`Uploaded translations to phrase.`)
}

export async function push(config: InternalPhraseConfig, context: ExecutorContext) {
    const { projectName } = context

    if (!projectName) {
        throw new Error("project name not set in context")
    }

    const outputPath = prepareOutput(context.root, "push")
    const compilationOutputFile = await extractTranslations(config, outputPath)
    await uploadTranslations(config, compilationOutputFile)
}
