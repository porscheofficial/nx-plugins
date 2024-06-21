import { ExecutorContext } from "@nx/devkit"

import { default as pull } from "../pull/executor"
import { default as push } from "../push/executor"
import { default as findUnused } from "../find-unused/executor"
import { default as extract } from "../extract/executor"
import type { BuildExecutorSchema } from "./schema"

export default async function runExecutor(options: BuildExecutorSchema, context: ExecutorContext) {
    const operation = options.operation ?? "pull"

    if (operation === "push") {
        await push(options, context)
    } else if (operation === "find-unused") {
        await findUnused(options, context)
    } else if (operation === "extract") {
        await extract(options, context)
    } else {
        await pull(options, context)
    }

    return { success: true }
}
