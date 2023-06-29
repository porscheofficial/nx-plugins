import { extract as formatjsExtract, compile as formatjsCompile } from "@formatjs/cli-lib"
import { sync } from "glob"
import { writeFileSync } from "fs"

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
    const files = sync(`${sourceRoot}/${sourceGlob}`)
    const ignoredFiles = sync(`${sourceRoot}/${ignoreGlob}`)
    const filteredFiles = files.filter((file) => !ignoredFiles.includes(file))

    const extracted = await formatjsExtract(filteredFiles, {})
    writeFileSync(outputFile, extracted, {})
}

export async function compile({ inputFile, outputFile }: { inputFile: string; outputFile: string }) {
    writeFileSync(outputFile, await formatjsCompile([inputFile], {}))
}
