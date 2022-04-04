import { ExecutorContext } from "@nrwl/devkit"

import { getConfig, InternalPhraseConfig } from "./lib/config"
import { pull } from "./lib/pull"
import { push } from "./lib/push"
import type { BuildExecutorSchema } from "./schema"

export default async function runExecutor(options: BuildExecutorSchema, context: ExecutorContext) {
    const operation = options.operation ?? "pull"
    const config: InternalPhraseConfig = getConfig(context, operation)
    // override options from config file with the ones from the project.json
    Object.assign(config, options)

    if (operation === "push") {
        await push(config, context)
    } else {
        await pull(config)
    }

    return Promise.resolve({ success: true })
}
