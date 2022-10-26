import { resolve } from "path"

import { ExecutorContext } from "@nrwl/devkit"
import nock from "nock"

import executor from "./executor"

const TEST_ASSETS_DIR = resolve(__dirname, "../../../test")

describe("Push", () => {
    it("can push", async () => {
        nock("https://api.phrase.com/v2")
            .post(/\/projects\/[^/]+\/uploads/i)
            .matchHeader("Authorization", /token .*/)
            .query(true)
            .reply(201, {})

        const context = {
            root: TEST_ASSETS_DIR,
            projectName: "test_app",
            workspace: { projects: { test_app: { root: TEST_ASSETS_DIR, sourceRoot: TEST_ASSETS_DIR } } } as unknown,
        } as ExecutorContext

        const output = await executor({}, context)
        expect(output.success).toBe(true)
    })

    afterEach(() => {
        expect(nock.isDone()).toBe(true)
    })
})
