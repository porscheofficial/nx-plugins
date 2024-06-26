import { mkdirs, remove, writeFile } from "fs-extra"
import { resolve } from "path"
import { InternalPhraseConfig } from "./config"
import { PhraseClient, PhraseLocale } from "./phrase"
import { getLanguageAndRegion } from "./utils"
import { PhraseFileFormat } from "./consts"

type TranslationsMap = Record<string, string>

export class PullHelper {
    private phrase: PhraseClient

    constructor(private config: InternalPhraseConfig) {
        this.phrase = new PhraseClient(this.config.phraseClientConfig)
    }

    async listLocales(): Promise<PhraseLocale[]> {
        return await this.phrase.localesListAll({ projectId: this.config.projectId, branch: this.config.branch })
    }

    async downloadTranslations(locales: PhraseLocale[]): Promise<TranslationsMap> {
        const phrase = new PhraseClient(this.config.phraseClientConfig)

        const formatOptions = {
            "format_options[escape_single_quotes]":
                this.config.fileFormat === "properties" ? this.config.formatOptions.escapeSingleQuotes : undefined,
        }

        const translations: Record<string, string> = {}
        for (const locale of locales) {
            const { id, name } = locale
            if (id && name) {
                const localeData = await phrase.localesDownload({
                    projectId: this.config.projectId,
                    id,
                    branch: this.config.branch,
                    file_format: this.config.fileFormat,
                    // Use phrase API fallback locale?
                    ...(this.config.useFallbackLocale && locale.fallback_locale
                        ? {
                              fallback_locale_id: locale.fallback_locale.id,
                              include_empty_translations: true,
                          }
                        : {}),
                    ...formatOptions,
                })

                translations[name] = localeData
            }
        }

        return translations
    }
}

export async function writeTranslations(translations: TranslationsMap, config: InternalPhraseConfig) {
    // recreate L10n directory
    await remove(config.output)
    await mkdirs(config.output)

    // write each translation in its own file
    const localeNames = Object.keys(translations)
    for (const locale of localeNames) {
        const { language, region } = getLanguageAndRegion(locale)
        const fileName =
            config.fileFormat === PhraseFileFormat.PROPERTIES
                ? region
                    ? `message_${language}_${region}.properties`
                    : `message_${language}.properties`
                : `${locale}.json`
        const filePath = resolve(config.output, fileName)
        await writeFile(filePath, translations[locale])
    }
}

export async function pull(config: InternalPhraseConfig) {
    console.log(`Translations will be written to ${config.output}.`)

    const pull = new PullHelper(config)

    const locales = await pull.listLocales()
    const translations = await pull.downloadTranslations(locales)

    // fake fallback_locale functionality via source_locale
    if (config.useSourceLocaleAsFallback && config.fileFormat === PhraseFileFormat.REACT_SIMPLE_JSON) {
        for (const locale of locales) {
            if (locale.source_locale && locale.source_locale.name in translations) {
                translations[locale.name] = JSON.stringify(
                    {
                        ...JSON.parse(translations[locale.source_locale.name]),
                        ...JSON.parse(translations[locale.name]),
                    },
                    null,
                    4
                )
            }
        }
    }

    await writeTranslations(translations, config)
}
