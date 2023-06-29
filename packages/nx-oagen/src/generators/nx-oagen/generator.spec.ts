import { createTreeWithEmptyWorkspace } from "@nx/devkit/testing"
import { Tree, readProjectConfiguration } from "@nx/devkit"

import generator from "./generator"
import { NxOagenGeneratorSchema } from "./schema"
import { NPM_SCOPE } from "../../utils"

describe("nx-oagen generator", () => {
    let appTree: Tree
    const options: NxOagenGeneratorSchema = {
        projectName: "test",
        specFile: "https://petstore.swagger.io/v2/swagger.json",
        generator: "typescript-axios",
    }

    beforeEach(() => {
        appTree = createTreeWithEmptyWorkspace()
    })

    it("should run successfully", async () => {
        await generator(appTree, options)
        const config = readProjectConfiguration(appTree, "test")

        expect(config).toBeDefined()
        expect(config.targets["build"]).toBeDefined()
        expect(config.targets["build"]["executor"]).toContain(NPM_SCOPE)
        expect(config.targets["build"]["options"]["specFile"]).toEqual(options.specFile)
    })

    it("should setup dependencies according to selected generator", () => {
        // TODO
    })
})
