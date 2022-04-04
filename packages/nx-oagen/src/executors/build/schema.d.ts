import { Generator } from "../../types"

export interface BuildExecutorSchema {
    specFile: string
    outDir: string
    generator: Generator
    additionalProperties: Record<string, string | number | boolean>
} // eslint-disable-line
