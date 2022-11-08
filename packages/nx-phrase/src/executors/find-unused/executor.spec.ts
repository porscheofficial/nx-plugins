import { resolve } from "path"

import { ExecutorContext } from "@nrwl/devkit"
import nock from "nock"

import executor from "./executor"
import { NonSensitiveArgs } from "../lib/types"
import { NPM_SCOPE } from "../../utils"
import { readFileSync } from "fs"

const options: Partial<NonSensitiveArgs> = {
    projectId: "projectId",
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
        targetName: "translation",
        configurationName: "unused",
        target: {
            executor: `${NPM_SCOPE}/nx-phrase:build`,
        },
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

    it("transforms keys", async () => {
        nockForProject(options.projectId)

        const myOptions = { ...options, phraseKeyTransformer: "./transform.js", sourceKeyTransformer: "./transform.js" }

        const output = await executor(myOptions, context)
        expect(output.success).toBe(true)

        // Validate output files
        expect(
            JSON.parse(readFileSync(resolve(TEST_ASSETS_DIR, ".nx-phrase/unused/test_app.unused-keys.json")).toString())
        ).toMatchSnapshot("keys downloaded from phrase that are NOT used in the source (anymore)")

        expect(
            JSON.parse(
                readFileSync(resolve(TEST_ASSETS_DIR, ".nx-phrase/unused/test_app.pending-upload-keys.json")).toString()
            )
        ).toMatchSnapshot("keys from the source that are NOT uploaded in phrase yet")
    })

    it("filters keys", async () => {
        nockForProject(options.projectId)

        const myOptions = { ...options, phraseKeyFilter: "./filter.js", sourceKeyFilter: "./filter.js" }

        const output = await executor(myOptions, context)
        expect(output.success).toBe(true)

        // Validate output files
        expect(
            JSON.parse(
                readFileSync(
                    resolve(TEST_ASSETS_DIR, ".nx-phrase/unused/test_app.filtered-source-keys.json")
                ).toString()
            )
        ).toMatchSnapshot("keys from source that are NOT valid according to the filter function")

        expect(
            JSON.parse(
                readFileSync(
                    resolve(TEST_ASSETS_DIR, ".nx-phrase/unused/test_app.filtered-phrase-keys.json")
                ).toString()
            )
        ).toMatchSnapshot("keys from phrase that are NOT valid according to the filter function")
    })

    it("filters before applying transformers", async () => {
        nockForProject(options.projectId)

        const myOptions = {
            ...options,
            phraseKeyFilter: "./filter.js",
            sourceKeyFilter: "./filter.js",
            phraseKeyTransformer: "./transform.js",
            sourceKeyTransformer: "./transform.js",
        }

        const output = await executor(myOptions, context)
        expect(output.success).toBe(true)

        // Validate output files
        expect(
            JSON.parse(readFileSync(resolve(TEST_ASSETS_DIR, ".nx-phrase/unused/test_app.unused-keys.json")).toString())
        ).toMatchSnapshot("keys downloaded from phrase and FILTERED that are NOT used in the source (anymore)")

        expect(
            JSON.parse(
                readFileSync(resolve(TEST_ASSETS_DIR, ".nx-phrase/unused/test_app.pending-upload-keys.json")).toString()
            )
        ).toMatchSnapshot("keys from the source and FILTERED that are NOT uploaded in phrase yet")
    })
})
