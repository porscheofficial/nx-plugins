import { spawn } from "child_process"

export async function extract({
    sourceGlob,
    ignoreGlob,
    sourceRoot,
    outputFile,
}: {
    sourceGlob: string
    ignoreGlob?: string
    sourceRoot: string
    outputFile: string
}) {
    return new Promise<void>((resolve, reject) => {
        const extract = spawn(
            "./node_modules/.bin/formatjs",
            [
                "extract",
                `${sourceRoot}/${sourceGlob}`, // `./${projectRoot}/src/**/*.{ts,tsx}`,
                ...(ignoreGlob
                    ? [
                          "--ignore",
                          `${sourceRoot}/${ignoreGlob}`, //`./${projectRoot}/src/**/*.d.ts`,
                      ]
                    : []),
                "--out-file",
                outputFile,
                "--extract-source-location",
            ],
            { stdio: "inherit" }
        )

        extract.on("exit", (code) => {
            if (code === 0) {
                resolve()
            } else {
                reject()
            }
        })
    })
}

export async function compile({ inputFile, outputFile }: { inputFile: string; outputFile: string }) {
    return new Promise<void>((resolve, reject) => {
        const compile = spawn("./node_modules/.bin/formatjs", ["compile", inputFile, "--out-file", outputFile], {
            stdio: "inherit",
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
