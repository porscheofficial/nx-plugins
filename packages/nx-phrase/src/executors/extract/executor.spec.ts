import { resolve } from "path"

import { ExecutorContext } from "@nx/devkit"

import executor from "./executor"
import { NonSensitiveArgs } from "../../lib/types"

const options: Partial<NonSensitiveArgs> = {
    projectId: "projectId",
    output: ".nx-phrase/translations",
}

const TEST_ASSETS_DIR = resolve(__dirname, "../../../test")

describe("Extract", () => {
    const context = {
        root: TEST_ASSETS_DIR,
        projectName: "test_app",
        workspace: { projects: { test_app: { root: TEST_ASSETS_DIR } } } as unknown,
    } as ExecutorContext

    it("should extract", async () => {
        const output = await executor(options, context)
        expect(output.success).toBe(true)
    })
})
