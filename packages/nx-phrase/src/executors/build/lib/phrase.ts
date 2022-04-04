import FormData from "form-data"
import { requestUrl } from "./request"

const BASE_URL = "https://api.phrase.com/v2"

export type Translations = Record<string, string>

interface PhraseLocale {
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
}

export interface PhraseClientConfig {
    token: string
}

type PhraseAllPaginated<T> = Omit<T, "page" | "per_page">

export class PhraseClient {
    private ITEMS_PER_PAGE = 20
    private credentials: { token: string }

    constructor(config: PhraseClientConfig) {
        this.credentials = { token: config.token }
    }

    public async localesList({
        project_id,
        ...optionalArgs
    }: {
        project_id: string
        page?: number
        per_page?: number
        sort_by?: string
        branch?: string
    }): Promise<PhraseLocale[]> {
        const url = new URL(`${BASE_URL}/projects/${project_id}/locales`)
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
        project_id,
        id,
        ...otherArgs
    }: {
        project_id: string
        id: string
        file_format: string
        branch?: string
    }): Promise<string> {
        console.log("Downloading translation for", id)

        const url = new URL(`${BASE_URL}/projects/${project_id}/locales/${id}/download`)
        for (const argName in otherArgs) {
            if (otherArgs[argName]) {
                url.searchParams.set(argName, otherArgs[argName])
            }
        }

        const response = await requestUrl(url, {
            headers: {
                Authorization: `token ${this.credentials.token}`,
            },
            successStatus: 200,
            errorMessagePrefix: `Failed to download translations for ${id}`,
        })

        return response
    }

    public async upload(
        {
            project_id,
            ...otherArgs
        }: {
            project_id: string
            locale_id: string
            update_translations?: boolean
            skip_upload_tags?: boolean
            file_format: string
            branch?: string
        },
        fileContent: string | Buffer
    ) {
        const url = new URL(`${BASE_URL}/projects/${project_id}/uploads`)
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
}
