import { mkdirs, remove, writeFile } from "fs-extra"
import { resolve } from "path"
import { InternalPhraseConfig } from "./config"
import { PhraseClient } from "./phrase"

type TranslationsMap = Record<string, string>

export async function downloadTranslations(config: InternalPhraseConfig): Promise<TranslationsMap> {
    const phrase = new PhraseClient(config.phraseClientConfig)
    const availableLocales = await phrase.localesListAll({ project_id: config.projectId })

    const translations: Record<string, string> = {}
    for (const locale of availableLocales) {
        const { id, name } = locale
        if (id && name) {
            const localeData = await phrase.localesDownload({
                project_id: config.projectId,
                id,
                branch: config.branch,
                file_format: config.fileFormat,
            })

            translations[name] = localeData
        }
    }

    return translations
}

export async function writeTranslations(translations: TranslationsMap, config: InternalPhraseConfig) {
    // recreate L10n directory
    await remove(config.output)
    await mkdirs(config.output)

    // write each translation in its own file
    const localeNames = Object.keys(translations)
    for (const locale of localeNames) {
        const filePath = resolve(config.output, `${locale}.json`)
        await writeFile(filePath, translations[locale])
    }
}

export async function pull(config: InternalPhraseConfig) {
    const translations = await downloadTranslations(config)
    await writeTranslations(translations, config)
}
