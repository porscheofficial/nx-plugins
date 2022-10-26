import { NonSensitiveArgs } from "../lib/types"

export type Operation = "push" | "pull" | "find-unused"

export interface BuildExecutorSchema extends Partial<NonSensitiveArgs> {
    operation?: Operation
} // eslint-disable-line
