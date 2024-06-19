import { resolve } from "path"

import { ExecutorContext } from "@nx/devkit"
import nock from "nock"

import executor from "./executor"
import { NonSensitiveArgs } from "../../lib/types"
import { PhraseClient } from "../../lib/phrase"
import { readFileSync } from "fs"
import { PhraseFileFormat } from "../../lib/consts"

const options: Partial<NonSensitiveArgs> = {
    projectId: "projectId",
    output: ".nx-phrase/translations",
}

const TEST_ASSETS_DIR = resolve(__dirname, "../../../test")

function nockForProject(projectId = "project_id") {
    const french = { greeting: "bonjour" }

    nock("https://api.phrase.com/v2")
        .get(`/projects/${projectId}/locales`)
        .matchHeader("Authorization", /token .*/)
        .query({ per_page: 20, page: 1 })
        .replyWithFile(200, `${TEST_ASSETS_DIR}/localesListResponse.json`)

        .get(/\/projects\/[^/]+\/locales\/[^/]+\/download/)
        .matchHeader("Authorization", /token .*/)
        .query({ file_format: PhraseFileFormat.REACT_SIMPLE_JSON })
        .thrice()
        .reply(429, { message: "Concurrency limit exceeded" })

        .get(/\/projects\/[^/]+\/locales\/french\/download/)
        .matchHeader("Authorization", /token .*/)
        .query({ file_format: PhraseFileFormat.REACT_SIMPLE_JSON })
        .reply(200, french)

        .get(/\/projects\/[^/]+\/locales\/[^/]+\/download/)
        .matchHeader("Authorization", /token .*/)
        .query({ file_format: PhraseFileFormat.REACT_SIMPLE_JSON })
        .twice()
        .replyWithFile(200, `${TEST_ASSETS_DIR}/localeDownloadResponse.json`)
}

// Remove actual sleep from implementation
jest.spyOn(PhraseClient.prototype, "sleepHelper").mockImplementation(() => Promise.resolve())

describe("Pull", () => {
    const context = {
        root: TEST_ASSETS_DIR,
        projectName: "test_app",
        workspace: { projects: { test_app: { root: TEST_ASSETS_DIR } } } as unknown,
    } as ExecutorContext

    afterEach(() => {
        expect(nock.isDone()).toBe(true)
    })

    it("can pull", async () => {
        nockForProject(options.projectId)
        const output = await executor(options, context)
        expect(output.success).toBe(true)

        expect(
            readFileSync(resolve(TEST_ASSETS_DIR, ".nx-phrase/translations", "fr-BE.json")).toString()
        ).toMatchSnapshot()
        expect(
            readFileSync(resolve(TEST_ASSETS_DIR, ".nx-phrase/translations", "fr-CA.json")).toString()
        ).toMatchSnapshot()
    })

    it("works with fallback_locale workaround", async () => {
        nockForProject(options.projectId)
        const output = await executor({ ...options, useSourceLocaleAsFallback: true }, context)
        expect(output.success).toBe(true)

        // canada has a source_locale set, so it should contain all keys from the source language as well
        const canadianFrench = JSON.parse(
            readFileSync(resolve(TEST_ASSETS_DIR, ".nx-phrase/translations", "fr-CA.json")).toString()
        )
        expect(canadianFrench).toHaveProperty("greeting")

        // belgion does not have source_locale set, so it should NOT contain the key defined in french
        const belgianFrench = JSON.parse(
            readFileSync(resolve(TEST_ASSETS_DIR, ".nx-phrase/translations", "fr-BE.json")).toString()
        )
        expect(belgianFrench).not.toHaveProperty("greeting")
    })
})
