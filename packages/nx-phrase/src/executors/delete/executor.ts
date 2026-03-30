import { ExecutorContext } from "@nrwl/devkit"
import { existsSync } from "fs"

import { getConfig, InternalPhraseConfig } from "../lib/config"
import { deleteKeys } from "../lib/delete"
import { NonSensitiveArgs } from "../lib/types"

const requiredConfigProperties = ["projectId", "inputFile"]

export default async function runExecutor(options: Partial<NonSensitiveArgs>, context: ExecutorContext) {
    const config: InternalPhraseConfig = getConfig(options, context, requiredConfigProperties)
    const { projectName } = context

    // get path from config / cli param?
    if (!existsSync(options.inputFile)) {
        throw new Error(`input file "${options.inputFile}" does not exist.`)
    }

    // load file
    await deleteKeys(options.inputFile, config)

    return { success: true }
}
