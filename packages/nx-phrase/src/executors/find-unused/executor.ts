import { ExecutorContext } from "@nx/devkit"
import { existsSync, writeFileSync } from "fs"
import { resolve } from "path"
import { prepareOutput } from "../../lib/utils"

import { getConfig, InternalPhraseConfig } from "../../lib/config"
import { extractTranslations } from "../../lib/push"
import { NonSensitiveArgs } from "../../lib/types"
import { PhraseClient } from "../../lib/phrase"

const requiredConfigProperties = ["projectId", "output"]

function defaultTransformKeyFn(translationKey: string) {
    return translationKey
}
type transformTranslationKeyFn = typeof defaultTransformKeyFn

function defaultFilterKeyFn(translationKey: string) {
    return !!translationKey
}
type filterKeyFn = typeof defaultFilterKeyFn

async function loadTransformer<T = transformTranslationKeyFn>(path: string) {
    if (path) {
        if (existsSync(path)) {
            const filterFunction = (await import(path)).default as T
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

async function getKeysFromSource(config: InternalPhraseConfig, outputFilePath: string) {
    // extracts current translations
    const compiledTranslationsFilePath = await extractTranslations(config, outputFilePath)
    const compiledTranslationKeys = Object.keys((await import(compiledTranslationsFilePath)).default)

    return compiledTranslationKeys
}

async function getKeysFromPhrase(config: InternalPhraseConfig): Promise<string[]> {
    const phrase = new PhraseClient(config.phraseClientConfig)
    const keysInPhrase = await phrase.keysListAll({ projectId: config.projectId, branch: config.branch })
    const keysInPhraseList = keysInPhrase.map(({ name }) => name)

    return keysInPhraseList

    // TODO deduplication of keys, report duplicates?

    // Old (slow) logic:
    // const pull = new PullHelper({ ...config, fileFormat: "react_simple_json" })

    // // downloads available translations
    // const locales = await pull.listLocales()
    // const localeToRawTranslations = await pull.downloadTranslations(locales)
    // const keysInPhrase = new Set<string>()
    // Object.keys(localeToRawTranslations).forEach((locale) =>
    //     Object.keys(JSON.parse(localeToRawTranslations[locale])).forEach((key) => keysInPhrase.add(key))
    // )

    // // use set for deduplication
    // const keysInPhraseList = [...keysInPhrase]

    // return keysInPhraseList
}

function applyTransform(input: string[], transformer: transformTranslationKeyFn) {
    // apply optional filter (use set for deduplication)
    const set = new Set<string>()
    input.map(transformer).forEach((key) => set.add(key))
    return [...set]
}

function filterList(input: string[], filter: filterKeyFn) {
    return input.filter(filter)
}

export default async function runExecutor(options: Partial<NonSensitiveArgs>, context: ExecutorContext) {
    const config: InternalPhraseConfig = getConfig(options, context, requiredConfigProperties)
    const { projectName } = context

    // extract and prepare keys from source code
    const outputPath = await prepareOutput({
        projectRoot: context.workspace.projects[context?.projectName]?.root ?? context.root,
        subfolder: "unused",
        workingDirectory: options.workingDirectory,
    })
    let sourceTranslationKeys
    {
        const sourceKeyFilter = options.sourceKeyFilter
            ? await loadTransformer<filterKeyFn>(resolve(context.root, options.sourceKeyFilter))
            : defaultFilterKeyFn

        const sourceKeyTransformer = options.sourceKeyTransformer
            ? await loadTransformer(resolve(context.root, options.sourceKeyTransformer))
            : defaultTransformKeyFn

        const allSourceTranslationKeys = await getKeysFromSource(config, outputPath)
        sourceTranslationKeys = filterList(allSourceTranslationKeys, sourceKeyFilter)

        if (allSourceTranslationKeys.length !== sourceTranslationKeys.length) {
            const bogusKeys = allSourceTranslationKeys.filter((key) => !sourceTranslationKeys.includes(key))
            const sourceBugKeysFilename = `${outputPath}/${projectName}.filtered-source-keys.json`
            writeFileSync(sourceBugKeysFilename, JSON.stringify(bogusKeys, null, 2), {
                flag: "w",
            })
            console.log(`Keys filtered from source written to: ${sourceBugKeysFilename}`)
        }

        sourceTranslationKeys = applyTransform(sourceTranslationKeys, sourceKeyTransformer)
    }

    // extract and prepare keys from phrase
    let phraseTranslationKeys
    const phraseDuplicatedKeys = []
    {
        const phraseKeyFilter = options.phraseKeyFilter
            ? await loadTransformer<filterKeyFn>(resolve(context.root, options.phraseKeyFilter))
            : defaultFilterKeyFn

        const phraseKeyTransformer = options.phraseKeyTransformer
            ? await loadTransformer(resolve(context.root, options.phraseKeyTransformer))
            : defaultTransformKeyFn

        const allPhraseTranslationKeys = await getKeysFromPhrase(config)

        // check for duplicate keys (keys are not unique in phrase, so this can happen when a key is renamed)
        const deduplicatedPhraseTranslationKeys = allPhraseTranslationKeys.filter((key, index) => {
            if (allPhraseTranslationKeys.indexOf(key) !== index) {
                phraseDuplicatedKeys.push(key)
                return false
            } else {
                return true
            }
        })

        // report duplicated keys
        if (phraseDuplicatedKeys.length > 0) {
            const phraseDuplicateKeysFilename = `${outputPath}/${projectName}.phrase-duplicate-keys.json`
            writeFileSync(phraseDuplicateKeysFilename, JSON.stringify(phraseDuplicatedKeys, null, 2), {
                flag: "w",
            })
            console.log(`Duplicated keys im phrase written to: ${phraseDuplicateKeysFilename}`)
        }

        phraseTranslationKeys = filterList(deduplicatedPhraseTranslationKeys, phraseKeyFilter)

        if (deduplicatedPhraseTranslationKeys.length !== phraseTranslationKeys.length) {
            const bogusKeys = deduplicatedPhraseTranslationKeys.filter((key) => !phraseTranslationKeys.includes(key))
            const phraseBugKeysFilename = `${outputPath}/${projectName}.filtered-phrase-keys.json`
            writeFileSync(phraseBugKeysFilename, JSON.stringify(bogusKeys, null, 2), {
                flag: "w",
            })
            console.log(`Keys filtered from phrase written to: ${phraseBugKeysFilename}`)
        }

        phraseTranslationKeys = applyTransform(phraseTranslationKeys, phraseKeyTransformer)
    }

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

    // console.log(`${context.targetName} ${context.configurationName}`)

    console.log("Done.")

    return { success: true }
}
