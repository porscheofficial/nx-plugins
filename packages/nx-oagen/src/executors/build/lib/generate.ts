import { spawn } from "child_process"
import { Generator } from "../../../types"

const defaults: Record<Generator, Record<string, string | number | boolean>> = {
    "typescript-axios": {
        // supportsES6: true,
        enumPropertyNaming: "original",
    },
    typescript: {
        // supportsES6: true,
        framework: "fetch-api",
        platform: "node",
        useObjectParameters: true,
    },
    "typescript-fetch": {
        // supportsES6: true
        enumPropertyNaming: "original",
        typescriptThreePlus: true,
        useSingleRequestParameter: true,
    },
    "typescript-node": {
        // supportsES6: true,
        enumPropertyNaming: "original",
    },
}

export async function generate({
    specFile,
    outputDir,
    generator,
    additionalProperties,
}: {
    specFile: string
    outputDir: string
    generator?: Generator
    additionalProperties?: Record<string, string | number | boolean>
}) {
    return new Promise<void>((resolve, reject) => {
        const args = [`-g ${generator}`, `-i ${specFile}`, `-o ${outputDir}`]

        additionalProperties = { ...defaults[generator], ...additionalProperties }

        if (Object.keys(additionalProperties).length > 0) {
            const serialized = Object.keys(additionalProperties).reduce((acc, curr) => {
                return [acc, `${curr}=${additionalProperties[curr]}`].join(",")
            }, "")
            args.push(`--additional-properties=${serialized}`)
        }

        const compile = spawn("./node_modules/.bin/openapi-generator-cli", ["generate", ...args], {
            stdio: "inherit",
        })

        compile.on("error", (err) => {
            reject(err)
        })

        compile.on("exit", (code) => {
            if (code === 0) {
                resolve()
            } else {
                reject()
            }
        })
    })
}
