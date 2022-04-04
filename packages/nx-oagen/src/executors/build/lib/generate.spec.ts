import { resolve } from "path"
import { remove, existsSync } from "fs-extra"
import { generate } from "./generate"

const TEST_RESOURCE_DIR = resolve(__dirname, "../../../../", "test")

it("generates", async () => {
    const outputDir = resolve(TEST_RESOURCE_DIR, "tmp")
    const specFile = resolve(TEST_RESOURCE_DIR, "swagger.json")

    await remove(outputDir)

    expect(existsSync(outputDir)).toBe(false)

    await generate({ specFile, outputDir, generator: "typescript-axios" })

    // openapi generator does not wait for sources to finish copying
    await new Promise((resolve) => setTimeout(resolve, 2000))

    expect(existsSync(outputDir)).toBe(true)
}, 20000)
