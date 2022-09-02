import { ExecutorContext } from "@nrwl/devkit"

import { getConfig, InternalPhraseConfig } from "./lib/config"
import { pull } from "./lib/pull"
import { push } from "./lib/push"
import type { BuildExecutorSchema } from "./schema"

export default async function runExecutor(options: BuildExecutorSchema, context: ExecutorContext) {
    const operation = options.operation ?? "pull"
    const config: InternalPhraseConfig = getConfig(options, context, operation)

    if (operation === "push") {
        await push(config, context)
    } else {
        await pull(config)
    }

    return { success: true }
}
