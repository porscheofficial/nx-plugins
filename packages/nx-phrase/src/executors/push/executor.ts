import { ExecutorContext } from "@nrwl/devkit"

import { getConfig, InternalPhraseConfig } from "../lib/config"
import { push } from "../lib/push"
import { NonSensitiveArgs } from "../lib/types"

export const pushRequiredConfigs = ["projectId", "uploadLanguageId"]

export default async function runExecutor(options: Partial<NonSensitiveArgs>, context: ExecutorContext) {
    const config: InternalPhraseConfig = getConfig(options, context, pushRequiredConfigs)

    await push(config, context)

    return { success: true }
}
