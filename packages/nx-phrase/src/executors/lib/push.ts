import { relative, resolve } from "path"

import { ExecutorContext } from "@nrwl/devkit"
import { remove, readFile } from "fs-extra"

import { InternalPhraseConfig } from "./config"
import { compile, extract } from "./formatjs"
import { PhraseClient } from "./phrase"

export async function extractTranslations(config: InternalPhraseConfig, projectName: string) {
    // Use nx-phrase home as temporary storage
    const pluginHome = resolve(__dirname, "../../../../")

    // Clean up temporary files.
    const tmpDir = resolve(pluginHome, "tmp", projectName)
    await remove(tmpDir)

    // Extract translations from sources
    console.log(`Extracting translations from files in '${config.sourceRoot}'`)
    console.log(`using source glob '${config.sourceGlob}'`)
    if (config.ignoreGlob) {
        console.log(`Ignoring '${config.ignoreGlob}'`)
    }

    const extractionOutputFile = `${tmpDir}/translations.extracted.json`
    await extract({
        sourceRoot: config.sourceRoot,
        outputFile: extractionOutputFile,
        sourceGlob: config.sourceGlob,
        ignoreGlob: config.ignoreGlob,
    })
    console.log(`Extracted translations into ${relative(process.cwd(), extractionOutputFile)}`)

    // Compile extracted translation into target format
    const compilationOutputFile = resolve(tmpDir, "translations.compiled.json")
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

    const compilationOutputFile = await extractTranslations(config, projectName)
    await uploadTranslations(config, compilationOutputFile)
}
