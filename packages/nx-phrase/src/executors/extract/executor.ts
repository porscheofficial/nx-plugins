import { ExecutorContext } from "@nx/devkit"

import { getConfig, InternalPhraseConfig } from "../../lib/config"
import { NonSensitiveArgs } from "../../lib/types"
import { extract } from "../../lib/extract"

export const pullRequiredConfigs = ["output"]

export default async function runExecutor(options: Partial<NonSensitiveArgs>, context: ExecutorContext) {
    const config: InternalPhraseConfig = getConfig(options, context, pullRequiredConfigs)

    await extract(config, context)

    console.log("Done.")

    return { success: true }
}
