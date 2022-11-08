import { resolve } from "path"

import { ExecutorContext } from "@nrwl/devkit"
import nock from "nock"

import executor from "./executor"
import { NonSensitiveArgs } from "../lib/types"
import { PhraseClient } from "../lib/phrase"
import { readFileSync } from "fs"

const options: Partial<NonSensitiveArgs> = {
    projectId: "projectId",
    output: ".nx-phrase/translations",
}

const TEST_ASSETS_DIR = resolve(__dirname, "../../../test")

function nockForProject(projectId = "project_id") {
    nock("https://api.phrase.com/v2")
        .get(`/projects/${projectId}/locales`)
        .matchHeader("Authorization", /token .*/)
        .query({ per_page: 20 })
        .replyWithFile(200, `${TEST_ASSETS_DIR}/localesListResponse.json`)

        .get(/\/projects\/[^/]+\/locales\/[^/]+\/download/)
        .matchHeader("Authorization", /token .*/)
        .query({ file_format: "react_simple_json" })
        .thrice()
        .reply(429, { message: "Concurrency limit exceeded" })

        .get(/\/projects\/[^/]+\/locales\/[^/]+\/download/)
        .matchHeader("Authorization", /token .*/)
        .query({ file_format: "react_simple_json" })
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

        expect(readFileSync(resolve(TEST_ASSETS_DIR, ".nx-phrase/translations", "fr-BE.json"))).toMatchSnapshot()
        expect(readFileSync(resolve(TEST_ASSETS_DIR, ".nx-phrase/translations", "fr-CA.json"))).toMatchSnapshot()
    })
})
