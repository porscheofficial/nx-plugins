import FormData from "form-data"
import { RequestError, requestUrl } from "./request"
import debug from "debug"

const logger = debug("nx-plugins.nx-phrase.lib.phrase")

const BASE_URL = process.env.PHRASE_API_BASE_URL ?? "https://api.phrase.com/v2"

export type Translations = Record<string, string>

export interface PhraseLocale {
    id: string
    name: string
    code: string
    default: boolean
    main: boolean
    rtl: boolean
    plural_forms: string[]
    created_at: string
    updated_at: string
    source_locale: {
        id: string
        name: string
        code: string
    }
    fallback_locale: {
        id: string
        name: string
        code: string
    }
}

export interface PhraseKey {
    id: string
    name: string
    description: string
    name_hash: string
    plural: boolean
    max_characters_allowed: number
    tags: string[]
    created_at: string
    updated_at: string
}

export interface PhraseClientConfig {
    token: string
}

type PhraseAllPaginated<T> = Omit<T, "page" | "per_page">

export class PhraseClient {
    #baseUrl = BASE_URL
    private ITEMS_PER_PAGE = 20
    private credentials: { token: string }

    constructor(config: PhraseClientConfig) {
        this.credentials = { token: config.token }

        logger(`Using ${this.#baseUrl} as base`)
    }

    public async localesList({
        projectId,
        ...optionalArgs
    }: {
        projectId: string
        // These arguments are snake cased because that is how the api expects them
        page?: number
        per_page?: number
        sort_by?: string
        branch?: string
    }): Promise<PhraseLocale[]> {
        const url = new URL(`${this.#baseUrl}/projects/${projectId}/locales`)
        for (const argName in optionalArgs) {
            if (optionalArgs[argName]) {
                url.searchParams.set(argName, optionalArgs[argName])
            }
        }

        const response = await requestUrl(url, {
            headers: {
                Authorization: `token ${this.credentials.token}`,
            },
            successStatus: 200,
            errorMessagePrefix: "Failed to load locales",
        })

        return JSON.parse(response) as Promise<PhraseLocale[]>
    }

    public async localesListAll(args: PhraseAllPaginated<Parameters<PhraseClient["localesList"]>[0]>) {
        let page = 0
        let items = [] as PhraseLocale[]
        let nextPage = [] as PhraseLocale[]

        do {
            nextPage = await this.localesList({ ...args, page, per_page: this.ITEMS_PER_PAGE })
            items = [...items, ...nextPage]

            page++
        } while (nextPage.length >= this.ITEMS_PER_PAGE)

        return items
    }

    public async localesDownload({
        projectId: projectId,
        id,
        ...otherArgs
    }: {
        projectId: string
        id: string
        // These arguments are snake cased because that is how the api expects them
        file_format: string
        branch?: string
    }): Promise<string> {
        logger("Downloading translation for", id)

        const url = new URL(`${this.#baseUrl}/projects/${projectId}/locales/${id}/download`)
        for (const argName in otherArgs) {
            if (otherArgs[argName]) {
                url.searchParams.set(argName, otherArgs[argName])
            }
        }

        const downloadRequestFactory = () =>
            requestUrl(url, {
                headers: {
                    Authorization: `token ${this.credentials.token}`,
                },
                successStatus: 200,
                errorMessagePrefix: `Failed to download translations for ${id}`,
            })

        return this.retry(downloadRequestFactory, (e: unknown, attempt: number) => {
            if (e instanceof RequestError) {
                // handle concurrency limit exceeded
                if (e.statusCode === 429 && attempt < 5) {
                    logger(`Retrying due to concurrency`)
                    return true
                }
            }

            return false
        })
    }

    private async retry<T extends () => R | Promise<R>, R>(
        callbackFn: T,
        shouldRetry: (error: unknown, attempt: number) => boolean | Promise<boolean>
    ): Promise<R> {
        let attempt = 0
        let repeat = false
        do {
            try {
                attempt++
                return await callbackFn()
            } catch (e) {
                repeat = await shouldRetry(e, attempt)
                if (!repeat) {
                    throw e
                }

                const sleepFor = 2 ** attempt * 1000
                await this.sleepHelper(sleepFor)
            }
        } while (repeat)

        throw new Error("Unreachable")
    }

    /**
     * Sleep helper can be overwritten with jest.mock to allow proper testing  of retry
     */
    async sleepHelper(time: number) {
        await new Promise((resolve) => setTimeout(resolve, time))
    }

    public async upload(
        {
            projectId,
            ...otherArgs
        }: {
            projectId: string
            // These arguments are snake cased because that is how the api expects them
            locale_id: string
            update_translations?: boolean
            skip_upload_tags?: boolean
            file_format: string
            branch?: string
        },
        fileContent: string | Buffer
    ) {
        const url = new URL(`${this.#baseUrl}/projects/${projectId}/uploads`)
        const body = new FormData()
        for (const argName in otherArgs) {
            if (otherArgs[argName]) {
                body.append(argName, `${otherArgs[argName]}`)
            }
        }
        if (Buffer.isBuffer(fileContent)) {
            body.append("file", fileContent.toString(), { filename: "default.json" })
        } else {
            body.append("file", fileContent, { filename: "default.json" })
        }

        await requestUrl(url, {
            headers: {
                Authorization: `token ${this.credentials.token}`,
            },
            method: "POST",
            requestBody: body,
            successStatus: 201,
            errorMessagePrefix: "Failed to upload default translations",
        })
    }

    public async resolveKeyIdByName({
        projectId,
        keyName,
        ...otherArgs
    }: {
        projectId: string
        keyName: string
        branch?: string
    }) {
        const url = new URL(`${this.#baseUrl}/projects/${projectId}/keys/search`)
        url.searchParams.set("q", `name:${keyName}`)
        for (const argName in otherArgs) {
            if (otherArgs[argName]) {
                url.searchParams.set(argName, otherArgs[argName])
            }
        }

        const response = await requestUrl(url, {
            method: "POST",
            headers: {
                Authorization: `token ${this.credentials.token}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            successStatus: 200,
            errorMessagePrefix: "Failed to load locales",
        })

        const foundKeys = JSON.parse(response) as PhraseKey[]
        return foundKeys.map((key) => key.id)
    }

    public async deleteKey({ projectId, keyId, ...otherArgs }: { projectId: string; keyId: string; branch?: string }) {
        const url = new URL(`${this.#baseUrl}/projects/${projectId}/keys/${keyId}`)
        for (const argName in otherArgs) {
            if (otherArgs[argName]) {
                url.searchParams.set(argName, otherArgs[argName])
            }
        }

        await requestUrl(url, {
            method: "DELETE",
            headers: {
                Authorization: `token ${this.credentials.token}`,
            },
            successStatus: 204,
            errorMessagePrefix: "Failed to delete key",
        })
    }
}
