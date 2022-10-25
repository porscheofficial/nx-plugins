import { NonSensitiveArgs } from "../lib/types"

export interface UnusedExecutorSchema extends Partial<NonSensitiveArgs> {
    sourceKeyTransformer?: string
    phraseKeyTransformer?: string
} // eslint-disable-line
