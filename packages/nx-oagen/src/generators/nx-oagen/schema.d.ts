import { Generator } from "../../types"

export interface NxOagenGeneratorSchema {
    projectName: string
    specFile: string
    generator: Generator
    tags?: string
    directory?: string
    additionalProperties?: string[]
}
