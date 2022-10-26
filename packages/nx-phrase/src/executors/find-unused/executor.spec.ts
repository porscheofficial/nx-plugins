import { resolve } from "path"

import { ExecutorContext } from "@nrwl/devkit"
import nock from "nock"

import executor from "./executor"
import { NonSensitiveArgs } from "../lib/types"

const options: Partial<NonSensitiveArgs> = {
    phraseKeyTransformer: "./filter.js",
    sourceKeyTransformer: "./filter.js",
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
        .twice()
        .replyWithFile(200, `${TEST_ASSETS_DIR}/localeDownloadResponse.json`)
}

describe("find unused", () => {
    const context = {
        root: TEST_ASSETS_DIR,
        projectName: "test_app",
        workspace: { projects: { test_app: { root: TEST_ASSETS_DIR, sourceRoot: TEST_ASSETS_DIR } } } as unknown,
    } as ExecutorContext

    afterEach(() => {
        expect(nock.isDone()).toBe(true)
    })

    it("finds unused translations", async () => {
        nockForProject(options.projectId)

        const output = await executor(options, context)
        expect(output.success).toBe(true)
    })

    it("can override configuration options via project.json", async () => {
        nockForProject("other_project")
        const output = await executor({ ...options, projectId: "other_project" }, context)
        expect(output.success).toBe(true)
    })
})
