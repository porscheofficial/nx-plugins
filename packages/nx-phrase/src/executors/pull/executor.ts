import { ExecutorContext } from "@nrwl/devkit"

import { getConfig, InternalPhraseConfig } from "../lib/config"
import { pull } from "../lib/pull"
import { NonSensitiveArgs } from "../lib/types"

export const pullRequiredConfigs = ["projectId", "output"]

export default async function runExecutor(options: Partial<NonSensitiveArgs>, context: ExecutorContext) {
    const config: InternalPhraseConfig = getConfig(options, context, pullRequiredConfigs)

    await pull(config)

    console.log("Done.")

    return { success: true }
}
