import { Operation, NonSensitiveArgs } from "./types"

export interface BuildExecutorSchema extends Partial<NonSensitiveArgs> {
    operation?: Operation
} // eslint-disable-line
