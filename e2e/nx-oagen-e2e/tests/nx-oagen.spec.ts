import { ProjectConfiguration, readWorkspaceConfiguration } from "@nrwl/devkit"
import { ensureNxProject, runNxCommandAsync, uniq, readJson, updateFile } from "@nrwl/nx-plugin/testing"

describe("nx-oagen e2e", () => {
    it("should create library project and run code builder", async () => {
        const testProject = "petstore-api"

        ensureNxProject("@porscheofficial/nx-oagen", "dist/packages/nx-oagen")

        const { stdout: generatorOut, stderr: generatorErr } = await runNxCommandAsync(
            `generate @porscheofficial/nx-oagen:nx-oagen ${testProject} --specFile=https://petstore.swagger.io/v2/swagger.json --add modelPackage=model --add apiPackage=api --add withSeparateModelsAndApi=true`
        )

        expect(generatorOut).toContain("Generator ran")

        // New target for our plugin should be present in project.json
        expect(readJson(`libs/${testProject}/project.json`).targets.build).toBeTruthy()

        // Generate api client
        const { stdout: executorOut, stderr: executorErr } = await runNxCommandAsync(`build ${testProject}`)

        expect(executorErr).toHaveLength(0)
        expect(executorOut).toContain("Executor ran")

        const projectJson = readJson(`libs/${testProject}/project.json`) as ProjectConfiguration

        updateFile(`libs/${testProject}/project.json`, JSON.stringify(projectJson, null, 2))

        // TODO: Create a test that actually uses the api (is that even possible?)
    }, 120000)
})
