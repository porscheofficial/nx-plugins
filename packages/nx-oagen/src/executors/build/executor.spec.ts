import { BuildExecutorSchema } from "./schema"
import executor from "./executor"
import { mkdtempSync, rmSync, ensureDirSync, existsSync } from "fs-extra"
import { ExecutorContext } from "@nx/devkit"
import { resolve } from "path"

const options: BuildExecutorSchema = {
    specFile: "https://petstore.swagger.io/v2/swagger.json",
    outDir: "lib",
    generator: "typescript-axios",
    additionalProperties: undefined,
}

describe("Build Executor", () => {
    let tmpDir

    const projectName = "test"
    let context: ExecutorContext

    beforeAll(() => {
        ensureDirSync("tmp")
        tmpDir = mkdtempSync("tmp/test")

        context = {
            root: tmpDir,
            workspace: {
                projects: {
                    [projectName]: {
                        sourceRoot: `${tmpDir}/libs/${projectName}/src`,
                        root: `${tmpDir}/libs/${projectName}`,
                    },
                },
            } as unknown as ExecutorContext["workspace"],
            cwd: tmpDir,
            isVerbose: false,
            projectName,
            target: { executor: "blabla" },
        }
    })

    afterAll(() => {
        rmSync(tmpDir, { recursive: true, force: true })
    })

    it("should generate client for petstore api ", async () => {
        const output = await executor(options, context)

        expect(output.success).toBe(true)

        expect(existsSync(`${context.workspace.projects[projectName].sourceRoot}/index.ts`)).toBe(true)
        expect(existsSync(`${context.workspace.projects[projectName].sourceRoot}/lib`)).toBe(true)
        expect(existsSync(`${context.workspace.projects[projectName].sourceRoot}/lib/index.ts`)).toBe(true)
        expect(existsSync(`${context.workspace.projects[projectName].sourceRoot}/lib/configuration.ts`)).toBe(true)
        expect(existsSync(`${context.workspace.projects[projectName].sourceRoot}/lib/common.ts`)).toBe(true)
        expect(existsSync(`${context.workspace.projects[projectName].sourceRoot}/lib/base.ts`)).toBe(true)
        expect(existsSync(`${context.workspace.projects[projectName].sourceRoot}/lib/api.ts`)).toBe(true)
    }, 20000)

    it("should understand additionalProperties", async () => {
        const output = await executor(
            {
                ...options,
                additionalProperties: {
                    modelPackage: "model",
                    apiPackage: "api",
                    withSeparateModelsAndApi: true,
                },
            },
            context
        )

        expect(output.success).toBe(true)

        // configured like above the generator should produce a model and an api directory
        expect(existsSync(`${context.workspace.projects[projectName].sourceRoot}/lib/model`)).toBe(true)
        expect(existsSync(`${context.workspace.projects[projectName].sourceRoot}/lib/api`)).toBe(true)
    })

    it("should generate client for locally provided swagger spec file", async () => {
        const output = await executor(
            {
                ...options,
                specFile: resolve(__dirname, "../../../test", "swagger.json"),
            },
            context
        )

        expect(output.success).toBe(true)
    })

    xit("should generate clients using typescript generator", () => {
        // TODO
    })

    xit("should generate clients using typescript-fetch generator", () => {
        // TODO
    })
})
