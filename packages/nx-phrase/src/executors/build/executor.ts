import { ExecutorContext } from "@nrwl/devkit"

import { getConfig, InternalPhraseConfig } from "../lib/config"
import { pull } from "../lib/pull"
import { push } from "../lib/push"
import type { BuildExecutorSchema, Operation } from "./schema"

const requiredConfigs: Record<Operation, string[]> = {
    push: ["projectId", "uploadLanguageId"],
    pull: ["projectId", "output"],
}

export default async function runExecutor(options: BuildExecutorSchema, context: ExecutorContext) {
    const operation = options.operation ?? "pull"
    const config: InternalPhraseConfig = getConfig(options, context, requiredConfigs[operation])

    if (operation === "push") {
        await push(config, context)
    } else {
        await pull(config)
    }

    return { success: true }
}
