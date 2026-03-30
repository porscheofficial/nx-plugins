import { resolve } from "path"

import { ExecutorContext } from "@nrwl/devkit"
import nock from "nock"

import executor from "./executor"
import { NonSensitiveArgs } from "../lib/types"

const TEST_ASSETS_DIR = resolve(__dirname, "../../../test")

const options: Partial<NonSensitiveArgs> = {
    inputFile: resolve(TEST_ASSETS_DIR, "unused-keys.json"),
}

function nockForProject(projectId = "project_id") {
    nock("https://api.phrase.com/v2", { encodedQueryParams: true })
        .post(`/projects/${projectId}/keys/search`)
        .matchHeader("Authorization", /token .*/)
        .query({ q: /^name.*/ })
        .times(4)
        .reply(200, [
            {
                id: "some_key_id",
                name: "some_key_name",
                description: "key description",
                name_hash: "04afc0e8cd172dfacdddf0b46dca990f",
                plural: false,
                max_characters_allowed: 0,
                tags: [],
                created_at: "2022-10-29T12:15:19Z",
                updated_at: "2022-10-29T12:15:19Z",
            },
        ])

        // .delete(/\/projects\/[^/]+\/keys\/.*/)
        // .matchHeader("Authorization", /token .*/)
        // .query({})
        // .once()
        // .reply(500, "<html>")

        .delete(/\/projects\/[^/]+\/keys\/.*/)
        .matchHeader("Authorization", /token .*/)
        .query({})
        .times(4)
        .reply(204, "")
}

describe("delete", () => {
    const context = {
        root: TEST_ASSETS_DIR,
        projectName: "test_app",
        workspace: { projects: { test_app: { root: TEST_ASSETS_DIR, sourceRoot: TEST_ASSETS_DIR } } } as unknown,
    } as ExecutorContext

    afterEach(() => {
        expect(nock.isDone()).toBe(true)
    })

    it("delete phrase keys", async () => {
        nockForProject(options.projectId)
        const output = await executor(options, context)
        expect(output.success).toBe(true)
    })
})
