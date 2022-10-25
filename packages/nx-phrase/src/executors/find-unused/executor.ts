import { ExecutorContext } from "@nrwl/devkit"
import { existsSync } from "fs"
import { resolve } from "path"

import { getConfig, InternalPhraseConfig } from "../lib/config"
import { downloadTranslations } from "../lib/pull"
import { extractTranslations } from "../lib/push"
import type { UnusedExecutorSchema } from "./schema"

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
    projectName: string,
    transformer: transformTranslationKeyFn
) {
    // extracts current translations
    const compiledTranslationsFilePath = await extractTranslations(config, projectName)
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

export default async function runExecutor(options: UnusedExecutorSchema, context: ExecutorContext) {
    const config: InternalPhraseConfig = getConfig(options, context, requiredConfigProperties)
    const { projectName } = context

    // extract and prepare keys from source code
    const sourceKeyTransformer = options.sourceKeyTransformer
        ? await loadTransformer(resolve(context.root, options.sourceKeyTransformer))
        : defaultTransformKeyFn

    const sourceTranslationKeys = await getKeysFromSource(config, projectName, sourceKeyTransformer)

    // extract and prepare keys from phrase
    const phraseKeyTransformer = options.phraseKeyTransformer
        ? await loadTransformer(resolve(context.root, options.phraseKeyTransformer))
        : defaultTransformKeyFn

    const phraseTranslationKeys = await getKeysFromPhrase(config, phraseKeyTransformer)

    // compare available and current translations
    const notUploadedYet = sourceTranslationKeys.filter((key) => !phraseTranslationKeys.includes(key))
    const unusedKeys = phraseTranslationKeys.filter((key) => !sourceTranslationKeys.includes(key))

    // tell difference
    console.log({ notUploadedYet, unusedKeys })

    return { success: true }
}
