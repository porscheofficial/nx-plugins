import { ExecutorContext } from "@nrwl/devkit"
import { existsSync, writeFileSync } from "fs"
import { resolve } from "path"
import { prepareOutput } from "../../utils"

import { getConfig, InternalPhraseConfig } from "../lib/config"
import { downloadTranslations } from "../lib/pull"
import { extractTranslations } from "../lib/push"
import { NonSensitiveArgs } from "../lib/types"

const requiredConfigProperties = ["projectId", "output"]

function defaultTransformKeyFn(translationKey: string) {
    return translationKey
}
type transformTranslationKeyFn = typeof defaultTransformKeyFn

async function loadTransformer(path: string) {
    if (path) {
        if (existsSync(path)) {
            const filterFunction = (await import(path)).default as transformTranslationKeyFn
            if (typeof filterFunction === "function") {
                return filterFunction
            } else {
                throw new Error(`${path} does not export a function as default`)
            }
        } else {
            throw new Error(`${path} does not exist`)
        }
    }
}

async function getKeysFromSource(
    config: InternalPhraseConfig,
    transformer: transformTranslationKeyFn,
    outputFilePath: string
) {
    // extracts current translations
    const compiledTranslationsFilePath = await extractTranslations(config, outputFilePath)
    const compiledTranslationKeys = Object.keys((await import(compiledTranslationsFilePath)).default)

    // apply optional filter
    return compiledTranslationKeys.map(transformer)
}

async function getKeysFromPhrase(config: InternalPhraseConfig, transformer: transformTranslationKeyFn) {
    // downloads available translations
    const localeToRawTranslations = await downloadTranslations(config)
    const keysInPhrase = new Set<string>()
    Object.keys(localeToRawTranslations).forEach((locale) =>
        Object.keys(JSON.parse(localeToRawTranslations[locale])).forEach((key) => keysInPhrase.add(key))
    )

    // apply optional filter (use set for deduplication)
    const keysInPhraseList = [...keysInPhrase]
    const phraseKeysSet = new Set<string>()
    keysInPhraseList.map(transformer).forEach((key) => phraseKeysSet.add(key))

    return [...phraseKeysSet]
}

export default async function runExecutor(options: Partial<NonSensitiveArgs>, context: ExecutorContext) {
    const config: InternalPhraseConfig = getConfig(options, context, requiredConfigProperties)
    const { projectName } = context

    // extract and prepare keys from source code
    const sourceKeyTransformer = options.sourceKeyTransformer
        ? await loadTransformer(resolve(context.root, options.sourceKeyTransformer))
        : defaultTransformKeyFn

    const outputPath = await prepareOutput(context.root, "unused")
    const sourceTranslationKeys = await getKeysFromSource(config, sourceKeyTransformer, outputPath)

    // extract and prepare keys from phrase
    const phraseKeyTransformer = options.phraseKeyTransformer
        ? await loadTransformer(resolve(context.root, options.phraseKeyTransformer))
        : defaultTransformKeyFn

    const phraseTranslationKeys = await getKeysFromPhrase(config, phraseKeyTransformer)

    // compare available and current translations
    const notUploadedYet = sourceTranslationKeys.filter((key) => !phraseTranslationKeys.includes(key))
    const unusedKeys = phraseTranslationKeys.filter((key) => !sourceTranslationKeys.includes(key))

    // tell difference
    const unusedKeysFilename = `${outputPath}/${projectName}.unused-keys.json`
    writeFileSync(unusedKeysFilename, JSON.stringify(unusedKeys, null, 2), {
        flag: "w",
    })
    console.log(`Unused keys written to: ${unusedKeysFilename}`)

    const pendingUploadKeysFilename = `${outputPath}/${projectName}.pending-upload-keys.json`
    writeFileSync(pendingUploadKeysFilename, JSON.stringify(notUploadedYet, null, 2), {
        flag: "w",
    })
    console.log(`Keys pending upload written to: ${pendingUploadKeysFilename}`)

    return { success: true }
}
